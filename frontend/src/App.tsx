import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  Globe,
  Lock,
  PlayCircle,
  Shield,
  Sparkles,
  Wifi,
} from 'lucide-react';

type Region = {
  id: string;
  label: string;
  speed: string;
  badge: string;
};

const regions: Region[] = [
  { id: 'eu', label: 'Poland / France', speed: 'Fast', badge: 'Best latency' },
  { id: 'us', label: 'United States', speed: 'Slow', badge: 'Popular region' },
  { id: 'sg', label: 'Singapore', speed: 'Slow', badge: 'Asia gateway' },
];

const featureCards = [
  {
    title: 'Browse anonymously',
    description: 'Route requests through a remote edge so destination sites see the proxy instead of the local browser.',
    icon: Shield,
  },
  {
    title: 'Unlock websites quickly',
    description: 'Open blocked pages directly in the browser without installing a VPN client or changing device settings.',
    icon: Globe,
  },
  {
    title: 'Encrypted sessions',
    description: 'Traffic is wrapped with SSL handling so standard websites still load through a secure browsing surface.',
    icon: Lock,
  },
];

const useCases = [
  'General web proxy',
  'Streaming and video access',
  'School and office unblocker',
  'Quick research from another region',
];

const faqItems = [
  {
    question: 'Is this a real proxy?',
    answer:
      'Yes. The frontend submits the requested URL to the Rocket backend, which fetches the upstream page and rewrites navigational links back through the proxy.',
  },
  {
    question: 'Why do some regions show slower speed?',
    answer:
      'The landing page mirrors region choices from the reference experience and surfaces relative speed hints for the user before starting a session.',
  },
  {
    question: 'What can users do with a web proxy?',
    answer:
      'They can open a blocked website from the browser, mask their direct IP from the destination website, and avoid installing dedicated software for quick access.',
  },
];

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value) || /^[^\s]+\.[^\s]+/.test(value);
}

function resolveInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (looksLikeUrl(trimmed)) {
    return `https://${trimmed}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

export default function App() {
  const [url, setUrl] = useState('');
  const [activeRegion, setActiveRegion] = useState<Region>(regions[0]);
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedUrl = resolveInput(url);
    if (!normalizedUrl) {
      setError('Enter a website URL or search term to start browsing.');
      return;
    }

    setError('');
    setSubmittedUrl(normalizedUrl);
    const backendBase = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000';
    const target = `${backendBase}/proxy?url=${encodeURIComponent(normalizedUrl)}&region=${encodeURIComponent(activeRegion.id)}`;
    window.location.assign(target);
  }

  return (
    <div className="relative overflow-hidden text-slate-950">
      <div className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(circle_at_top,rgba(29,78,216,0.16),transparent_48%),linear-gradient(180deg,#f7f4ea_0%,#efe7d2_100%)]" />
      <div className="absolute right-[-12rem] top-24 -z-10 h-80 w-80 rounded-full bg-[#e07131]/20 blur-3xl" />
      <div className="absolute left-[-8rem] top-72 -z-10 h-72 w-72 rounded-full bg-[#2f5fd0]/20 blur-3xl" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[#2f5fd0]">Proxyra</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">Free Web Proxy</div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          <a href="#use-cases" className="transition hover:text-slate-950">
            Use cases
          </a>
          <a href="#advantages" className="transition hover:text-slate-950">
            Advantages
          </a>
          <a href="#faq" className="transition hover:text-slate-950">
            FAQ
          </a>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur">
              <Sparkles size={16} className="text-[#2f5fd0]" />
              Browse fast and anonymously
            </div>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl">
              Proxyium-style web proxy landing page for quick browser access.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
              Open restricted websites from a clean web interface, choose a region, and start a proxy session without
              installing extra software. This replica keeps the public landing experience and form flow in the
              frontend.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-700">
              <div className="rounded-full border border-slate-900/10 bg-white/80 px-4 py-2">No client install</div>
              <div className="rounded-full border border-slate-900/10 bg-white/80 px-4 py-2">Region switcher</div>
              <div className="rounded-full border border-slate-900/10 bg-white/80 px-4 py-2">Frontend demo flow</div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-900/10 bg-white/80 p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#2f5fd0] p-3 text-white">
                <PlayCircle size={24} />
              </div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Start Browsing</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight">Launch a session</div>
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Website URL</span>
                <input
                  type="text"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="Enter URL or search term"
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#2f5fd0] focus:bg-white"
                />
              </label>

              <div>
                <div className="mb-2 text-sm font-medium text-slate-700">Country</div>
                <div className="grid gap-3">
                  {regions.map((region) => {
                    const isActive = region.id === activeRegion.id;
                    return (
                      <button
                        key={region.id}
                        type="button"
                        onClick={() => setActiveRegion(region)}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                          isActive
                            ? 'border-[#2f5fd0] bg-[#2f5fd0] text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{region.label}</div>
                          <div className={`text-sm ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>{region.badge}</div>
                        </div>
                        <div
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                            isActive ? 'bg-white/15 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {region.speed}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e07131] px-5 py-4 text-base font-semibold text-white transition hover:bg-[#c85c22]"
              >
                GO
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              By using the web proxy you accept the browsing policy and understand upstream sites may behave differently
              depending on CSP, cookies, and anti-bot protections.
            </p>

            {error ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900">
                {error}
              </div>
            ) : null}

            {submittedUrl && !error ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
                Session prepared for <span className="font-semibold">{submittedUrl}</span> via{' '}
                <span className="font-semibold">{activeRegion.label}</span>. Redirecting through the Rocket proxy
                backend now.
              </div>
            ) : null}
          </div>
        </section>

        <section id="advantages" className="grid gap-6 md:grid-cols-3">
          {featureCards.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-[1.75rem] border border-slate-900/10 bg-white/70 p-6 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)]"
            >
              <div className="inline-flex rounded-2xl bg-slate-950 p-3 text-white">
                <Icon size={22} />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div id="use-cases" className="rounded-[2rem] bg-slate-950 px-6 py-8 text-white sm:px-8">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">Use Cases</div>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">Where the user will use the proxy</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
              The experience fits quick access scenarios where users need a browser-level proxy instead of a device-wide
              VPN.
            </p>
            <div className="mt-8 space-y-3">
              {useCases.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-4">
                  <Wifi size={18} className="text-blue-300" />
                  <span className="text-sm font-medium text-slate-100">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <article className="rounded-[2rem] border border-slate-900/10 bg-[#fff7ed] p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-[#c85c22]">How it works</div>
              <p className="mt-4 text-lg leading-8 text-slate-700">
                A web proxy sits between the user and the destination website. The user enters a URL, the proxy fetches
                the remote page, and the response comes back through that intermediary instead of directly from the
                browser.
              </p>
            </article>
            <article className="rounded-[2rem] border border-slate-900/10 bg-white p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2f5fd0]">Why people use it</div>
              <p className="mt-4 text-lg leading-8 text-slate-700">
                It helps with geoblocked pages, restrictive local networks, and quick anonymous browsing when users do
                not want to install dedicated software just to open a site.
              </p>
            </article>
          </div>
        </section>

        <section id="faq" className="rounded-[2rem] border border-slate-900/10 bg-white/75 p-6 sm:p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">FAQ</div>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">Common questions</h2>
          <div className="mt-8 grid gap-4">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                <h3 className="text-lg font-semibold tracking-tight">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
