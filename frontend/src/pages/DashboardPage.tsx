import { Activity, Box, Clock3, Network } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LogRecord, StatusResponse } from '../lib/api';
import { MetricCard } from '../components/MetricCard';

type DashboardPageProps = {
  status: StatusResponse | null;
  logs: LogRecord[];
};

export function DashboardPage({ status, logs }: DashboardPageProps) {
  const chartData = logs
    .slice(0, 12)
    .reverse()
    .map((log) => ({
      time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      latency: log.latency_ms,
      status: log.status_code ?? 0,
    }));

  const cards = [
    {
      icon: Network,
      label: 'Active Proxies',
      value: String(status?.active_proxies ?? 0),
      hint: `${status?.total_proxies ?? 0} total registered endpoints`,
    },
    {
      icon: Activity,
      label: 'Requests / Hour',
      value: String(status?.last_hour_requests ?? 0),
      hint: 'Live traffic captured by the proxy engine',
    },
    {
      icon: Clock3,
      label: 'Average Latency',
      value: `${Math.round(status?.avg_latency_ms ?? 0)} ms`,
      hint: 'Based on persisted request logs',
    },
    {
      icon: Box,
      label: 'Total Logs',
      value: String(status?.total_logs ?? 0),
      hint: 'Available for filtering in the log explorer',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ icon: Icon, label, value, hint }) => (
          <div key={label} className="relative overflow-hidden rounded-3xl">
            <div className="absolute right-5 top-5 rounded-2xl bg-white/10 p-3 text-accent">
              <Icon size={20} />
            </div>
            <MetricCard label={label} value={value} hint={hint} />
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="mb-4 text-sm uppercase tracking-[0.3em] text-slate-400">Latency Timeline</div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4fd1c5" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#4fd1c5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: '#112036',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                  }}
                />
                <Area type="monotone" dataKey="latency" stroke="#4fd1c5" fill="url(#latencyGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="text-sm uppercase tracking-[0.3em] text-slate-400">Recent Traffic</div>
          <div className="mt-4 space-y-3">
            {logs.slice(0, 6).map((log) => (
              <div key={log.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-accent">{log.method}</span>
                  <span className="text-xs text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</span>
                </div>
                <div className="mt-2 truncate text-sm text-slate-300">{log.request_url}</div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Status: {log.status_code ?? 'ERR'}</span>
                  <span>{log.latency_ms} ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

