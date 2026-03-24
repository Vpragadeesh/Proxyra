#[macro_use]
extern crate rocket;

use std::fmt::{Display, Formatter};
use std::sync::Arc;
use std::time::Duration;

use kuchiki::traits::*;
use reqwest::header::{
    HeaderMap as ReqwestHeaderMap, HeaderName as ReqwestHeaderName, HeaderValue as ReqwestHeaderValue,
    CONTENT_TYPE,
};
use reqwest::{Client, Method};
use rocket::data::ToByteUnit;
use rocket::http::{ContentType, Header, Status};
use rocket::response::content::RawHtml;
use rocket::response::{Responder, Response};
use rocket::serde::json::Json;
use rocket::{Build, Data, Request, Rocket, State};
use serde::Serialize;
use url::Url;

const USER_AGENT: &str =
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 Proxyra/0.1";
const MAX_BODY_SIZE: u64 = 2 * 1024 * 1024;

#[derive(Clone)]
struct AppState {
    client: Client,
    allowed_regions: Arc<Vec<&'static str>>,
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

struct ProxyRequest {
    target_url: Url,
    region: String,
}

#[derive(Debug)]
enum ProxyError {
    BadRequest(String),
    Upstream(String),
    Internal(String),
}

impl Display for ProxyError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::BadRequest(message) | Self::Upstream(message) | Self::Internal(message) => {
                write!(f, "{message}")
            }
        }
    }
}

impl ProxyError {
    fn status(&self) -> Status {
        match self {
            Self::BadRequest(_) => Status::BadRequest,
            Self::Upstream(_) => Status::BadGateway,
            Self::Internal(_) => Status::InternalServerError,
        }
    }
}

impl<'r> Responder<'r, 'static> for ProxyError {
    fn respond_to(self, request: &'r Request<'_>) -> rocket::response::Result<'static> {
        let payload = Json(ErrorResponse {
            error: self.to_string(),
        });
        Response::build_from(payload.respond_to(request)?)
            .status(self.status())
            .ok()
    }
}

#[get("/health")]
fn health() -> Json<HealthResponse> {
    Json(HealthResponse { status: "ok" })
}

#[get("/proxy?<url>&<region>")]
async fn proxy_get(
    url: &str,
    region: Option<&str>,
    state: &State<AppState>,
) -> Result<ProxyResponse, ProxyError> {
    let proxy_request = ProxyRequest {
        target_url: normalize_target(url)?,
        region: normalize_region(region.unwrap_or("eu"), state)?,
    };
    proxy_upstream(Method::GET, proxy_request, None, None, state).await
}

#[post("/proxy?<url>&<region>", data = "<data>")]
async fn proxy_post(
    url: &str,
    region: Option<&str>,
    content_type: &ContentType,
    data: Data<'_>,
    state: &State<AppState>,
) -> Result<ProxyResponse, ProxyError> {
    let proxy_request = ProxyRequest {
        target_url: normalize_target(url)?,
        region: normalize_region(region.unwrap_or("eu"), state)?,
    };
    let body = data
        .open(MAX_BODY_SIZE.bytes())
        .into_bytes()
        .await
        .map_err(|error| ProxyError::Internal(format!("Failed to read request body: {error}")))?;
    proxy_upstream(
        Method::POST,
        proxy_request,
        Some(content_type.to_string()),
        Some(body.into_inner()),
        state,
    )
    .await
}

async fn proxy_upstream(
    method: Method,
    proxy_request: ProxyRequest,
    request_content_type: Option<String>,
    body: Option<Vec<u8>>,
    state: &State<AppState>,
) -> Result<ProxyResponse, ProxyError> {
    let mut upstream_request = state.client.request(method, proxy_request.target_url.clone());
    let forwarded_headers = build_forward_headers(request_content_type)?;
    upstream_request = upstream_request.headers(forwarded_headers);

    if let Some(body) = body {
        upstream_request = upstream_request.body(body);
    }

    let upstream_response = upstream_request
        .send()
        .await
        .map_err(|error| ProxyError::Upstream(format!("Failed to reach upstream site: {error}")))?;

    let status = upstream_response.status();
    let final_url = upstream_response.url().clone();
    let content_type = upstream_response
        .headers()
        .get(CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .map(str::to_owned);

    let headers = upstream_response.headers().clone();
    let bytes = upstream_response
        .bytes()
        .await
        .map_err(|error| ProxyError::Upstream(format!("Failed to read upstream response: {error}")))?;

    let response_headers = build_response_headers(&headers, &proxy_request.region)?;
    let body = if is_html_response(content_type.as_deref()) {
        let html = String::from_utf8_lossy(&bytes).into_owned();
        rewrite_html(&html, &final_url, &proxy_request.region)?
    } else {
        ResponseBody::Binary(bytes.to_vec())
    };

    Ok(ProxyResponse {
        status: Status::from_code(status.as_u16()).unwrap_or(Status::Ok),
        content_type,
        headers: response_headers,
        body,
    })
}

fn normalize_region(region: &str, state: &State<AppState>) -> Result<String, ProxyError> {
    if state.allowed_regions.iter().any(|candidate| *candidate == region) {
        Ok(region.to_string())
    } else {
        Err(ProxyError::BadRequest(format!("Unsupported region '{region}'")))
    }
}

fn normalize_target(raw: &str) -> Result<Url, ProxyError> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Err(ProxyError::BadRequest("Target URL is required".into()));
    }

    let candidate = if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
        trimmed.to_string()
    } else if looks_like_url(trimmed) {
        format!("https://{trimmed}")
    } else {
        let query = url::form_urlencoded::byte_serialize(trimmed.as_bytes()).collect::<String>();
        format!("https://www.google.com/search?q={query}")
    };

    let parsed = Url::parse(&candidate)
        .map_err(|error| ProxyError::BadRequest(format!("Invalid target URL: {error}")))?;
    match parsed.scheme() {
        "http" | "https" => Ok(parsed),
        scheme => Err(ProxyError::BadRequest(format!(
            "Unsupported URL scheme '{scheme}'. Only http and https are allowed"
        ))),
    }
}

fn looks_like_url(value: &str) -> bool {
    !value.contains(char::is_whitespace) && value.contains('.')
}

fn is_html_response(content_type: Option<&str>) -> bool {
    content_type
        .map(|value| value.to_ascii_lowercase().contains("text/html"))
        .unwrap_or(false)
}

fn build_forward_headers(content_type: Option<String>) -> Result<ReqwestHeaderMap, ProxyError> {
    let mut headers = ReqwestHeaderMap::new();
    headers.insert(
        reqwest::header::USER_AGENT,
        ReqwestHeaderValue::from_str(USER_AGENT)
            .map_err(|error| ProxyError::Internal(format!("Invalid user agent header: {error}")))?,
    );
    headers.insert(
        reqwest::header::ACCEPT,
        ReqwestHeaderValue::from_static(
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        ),
    );
    headers.insert(
        reqwest::header::ACCEPT_LANGUAGE,
        ReqwestHeaderValue::from_static("en-US,en;q=0.9"),
    );

    if let Some(content_type) = content_type {
        let name = ReqwestHeaderName::from_static("content-type");
        let value = ReqwestHeaderValue::from_str(&content_type)
            .map_err(|error| ProxyError::BadRequest(format!("Invalid content type header: {error}")))?;
        headers.insert(name, value);
    }

    Ok(headers)
}

fn build_response_headers(
    upstream_headers: &ReqwestHeaderMap,
    region: &str,
) -> Result<Vec<Header<'static>>, ProxyError> {
    let mut headers = Vec::new();
    let pass_through = ["cache-control", "content-language", "content-type", "expires", "last-modified"];

    for (name, value) in upstream_headers.iter() {
        if !pass_through.iter().any(|candidate| *candidate == name.as_str()) {
            continue;
        }

        let text = value
            .to_str()
            .map_err(|error| ProxyError::Internal(format!("Invalid upstream header value: {error}")))?;
        headers.push(Header::new(name.as_str().to_string(), text.to_string()));
    }

    headers.push(Header::new("x-proxyra-region", region.to_string()));
    Ok(headers)
}

fn rewrite_html(html: &str, base_url: &Url, region: &str) -> Result<ResponseBody, ProxyError> {
    let document = kuchiki::parse_html().one(html);
    let selectors = [
        ("a", "href"),
        ("link", "href"),
        ("img", "src"),
        ("script", "src"),
        ("iframe", "src"),
        ("source", "src"),
        ("video", "poster"),
        ("audio", "src"),
        ("embed", "src"),
        ("form", "action"),
    ];

    for (tag, attribute) in selectors {
        let selector = format!("{tag}[{attribute}]");
        let matches = document
            .select(&selector)
            .map_err(|_| ProxyError::Internal(format!("Failed to parse selector '{selector}'")))?;

        for css_match in matches {
            let mut attributes = css_match.attributes.borrow_mut();
            if let Some(current) = attributes.get(attribute) {
                if let Some(rewritten) = rewrite_reference(base_url, current, region) {
                    attributes.insert(attribute, rewritten);
                }
            }
        }
    }

    let html = document.to_string();
    Ok(ResponseBody::Html(html))
}

fn rewrite_reference(base_url: &Url, current: &str, region: &str) -> Option<String> {
    let trimmed = current.trim();
    if trimmed.is_empty()
        || trimmed.starts_with('#')
        || trimmed.starts_with("javascript:")
        || trimmed.starts_with("data:")
        || trimmed.starts_with("mailto:")
        || trimmed.starts_with("tel:")
    {
        return None;
    }

    let target = match base_url.join(trimmed) {
        Ok(url) => url,
        Err(_) => return None,
    };

    Some(proxy_url(&target, region))
}

fn proxy_url(url: &Url, region: &str) -> String {
    format!("/proxy?url={}&region={region}", urlencoding(url.as_str()))
}

fn urlencoding(value: &str) -> String {
    url::form_urlencoded::byte_serialize(value.as_bytes()).collect()
}

enum ResponseBody {
    Html(String),
    Binary(Vec<u8>),
}

struct ProxyResponse {
    status: Status,
    content_type: Option<String>,
    headers: Vec<Header<'static>>,
    body: ResponseBody,
}

impl<'r> Responder<'r, 'static> for ProxyResponse {
    fn respond_to(self, _request: &'r Request<'_>) -> rocket::response::Result<'static> {
        let mut response = Response::build();
        let builder = response.status(self.status);

        if let Some(content_type) = self.content_type {
            if let Some(parsed) = ContentType::parse_flexible(&content_type) {
                builder.header(parsed);
            } else {
                builder.raw_header("content-type", content_type);
            }
        }

        for header in self.headers {
            builder.header(header);
        }

        match self.body {
            ResponseBody::Html(html) => builder.sized_body(html.len(), std::io::Cursor::new(html)),
            ResponseBody::Binary(bytes) => builder.sized_body(bytes.len(), std::io::Cursor::new(bytes)),
        };

        builder.ok()
    }
}

#[options("/<_..>")]
fn options_catch_all() -> Status {
    Status::NoContent
}

#[catch(default)]
fn default_catcher(status: Status, request: &Request<'_>) -> RawHtml<String> {
    RawHtml(format!(
        "<!doctype html><html><body><h1>{}</h1><p>Proxyra could not process {}</p></body></html>",
        status,
        request.uri()
    ))
}

fn rocket() -> Rocket<Build> {
    dotenvy::dotenv().ok();

    let client = Client::builder()
        .redirect(reqwest::redirect::Policy::limited(10))
        .timeout(Duration::from_secs(20))
        .build()
        .expect("reqwest client");

    let port: u16 = std::env::var("ROCKET_PORT")
        .or_else(|_| std::env::var("PORT"))
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(8000);

    let address = std::env::var("ROCKET_ADDRESS").unwrap_or_else(|_| "0.0.0.0".to_string());

    let config = rocket::Config {
        address: address
            .parse()
            .expect("ROCKET_ADDRESS must be a valid IP address"),
        port,
        ..rocket::Config::default()
    };

    rocket::custom(config)
        .manage(AppState {
            client,
            allowed_regions: Arc::new(vec!["eu", "us", "sg"]),
        })
        .register("/", catchers![default_catcher])
        .mount("/", routes![health, proxy_get, proxy_post, options_catch_all])
}

#[launch]
fn launch() -> Rocket<Build> {
    rocket()
}
