export type StatusResponse = {
  total_proxies: number;
  active_proxies: number;
  total_logs: number;
  last_hour_requests: number;
  avg_latency_ms: number;
};

export type ProxyRecord = {
  id: string;
  name: string;
  host: string;
  port: number;
  protocol: 'http' | 'https';
  enabled: boolean;
  created_at: string;
};

export type LogRecord = {
  id: string;
  method: string;
  request_url: string;
  status_code: number | null;
  latency_ms: number;
  client_ip: string | null;
  error: string | null;
  created_at: string;
};

const seededProxies: ProxyRecord[] = [
  {
    id: 'px-1',
    name: 'EU Edge Pool',
    host: 'eu-edge.proxyra.local',
    port: 8080,
    protocol: 'http',
    enabled: true,
    created_at: '2025-01-14T10:20:00.000Z',
  },
  {
    id: 'px-2',
    name: 'US Residential Mesh',
    host: 'us-res.proxyra.local',
    port: 8443,
    protocol: 'https',
    enabled: true,
    created_at: '2025-01-13T08:12:00.000Z',
  },
  {
    id: 'px-3',
    name: 'APAC Burst Route',
    host: 'apac-burst.proxyra.local',
    port: 9000,
    protocol: 'http',
    enabled: false,
    created_at: '2025-01-11T15:45:00.000Z',
  },
];

const seededLogs: LogRecord[] = [
  {
    id: 'lg-1',
    method: 'GET',
    request_url: 'http://api.vendor.internal/v1/metrics',
    status_code: 200,
    latency_ms: 86,
    client_ip: '10.0.10.24',
    error: null,
    created_at: '2025-01-14T10:36:00.000Z',
  },
  {
    id: 'lg-2',
    method: 'CONNECT',
    request_url: 'auth.partner.com:443',
    status_code: 200,
    latency_ms: 132,
    client_ip: '10.0.10.18',
    error: null,
    created_at: '2025-01-14T10:34:00.000Z',
  },
  {
    id: 'lg-3',
    method: 'POST',
    request_url: 'https://checkout.gateway.io/payments',
    status_code: 502,
    latency_ms: 441,
    client_ip: '10.0.10.31',
    error: 'upstream handshake timeout',
    created_at: '2025-01-14T10:31:00.000Z',
  },
  {
    id: 'lg-4',
    method: 'GET',
    request_url: 'http://catalog.service.local/products?region=us',
    status_code: 200,
    latency_ms: 71,
    client_ip: '10.0.10.12',
    error: null,
    created_at: '2025-01-14T10:26:00.000Z',
  },
  {
    id: 'lg-5',
    method: 'CONNECT',
    request_url: 'cdn.assets.net:443',
    status_code: 200,
    latency_ms: 98,
    client_ip: '10.0.10.52',
    error: null,
    created_at: '2025-01-14T10:22:00.000Z',
  },
  {
    id: 'lg-6',
    method: 'GET',
    request_url: 'http://status.internal/healthz',
    status_code: 403,
    latency_ms: 23,
    client_ip: '10.0.10.7',
    error: 'policy blocked request',
    created_at: '2025-01-14T10:19:00.000Z',
  },
];

type Store = {
  proxies: ProxyRecord[];
  logs: LogRecord[];
};

const storageKey = 'proxyra-frontend-store';

function initialStore(): Store {
  const raw = window.localStorage.getItem(storageKey);
  if (raw) {
    try {
      return JSON.parse(raw) as Store;
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }

  const store = { proxies: seededProxies, logs: seededLogs };
  window.localStorage.setItem(storageKey, JSON.stringify(store));
  return store;
}

let store = initialStore();

function persist() {
  window.localStorage.setItem(storageKey, JSON.stringify(store));
}

function computeStatus(): StatusResponse {
  const totalLogs = store.logs.length;
  const totalLatency = store.logs.reduce((sum, log) => sum + log.latency_ms, 0);
  return {
    total_proxies: store.proxies.length,
    active_proxies: store.proxies.filter((proxy) => proxy.enabled).length,
    total_logs: totalLogs,
    last_hour_requests: Math.min(totalLogs, 18),
    avg_latency_ms: totalLogs ? totalLatency / totalLogs : 0,
  };
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), 120));
}

export const api = {
  getStatus: () => delay(computeStatus()),
  getProxies: () => delay([...store.proxies].sort((a, b) => b.created_at.localeCompare(a.created_at))),
  createProxy: async (payload: Omit<ProxyRecord, 'id' | 'created_at'>) => {
    const record: ProxyRecord = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    store = { ...store, proxies: [record, ...store.proxies] };
    persist();
    return delay(record);
  },
  deleteProxy: async (id: string) => {
    store = { ...store, proxies: store.proxies.filter((proxy) => proxy.id !== id) };
    persist();
    return delay({ deleted: true });
  },
  getLogs: (params: { statusCode?: string; search?: string; limit?: number }) => {
    const search = params.search?.toLowerCase() ?? '';
    const statusCode = params.statusCode ? Number(params.statusCode) : null;
    const rows = store.logs
      .filter((log) => (statusCode ? log.status_code === statusCode : true))
      .filter((log) =>
        search ? log.request_url.toLowerCase().includes(search) || log.method.toLowerCase().includes(search) : true,
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, params.limit ?? 100);
    return delay(rows);
  },
};
