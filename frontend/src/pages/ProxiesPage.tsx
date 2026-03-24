import { Trash2 } from 'lucide-react';
import { ProxyForm } from '../components/ProxyForm';
import { ProxyRecord } from '../lib/api';

type ProxiesPageProps = {
  proxies: ProxyRecord[];
  onCreate: (payload: {
    name: string;
    host: string;
    port: number;
    protocol: 'http' | 'https';
    enabled: boolean;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function ProxiesPage({ proxies, onCreate, onDelete }: ProxiesPageProps) {
  return (
    <div className="space-y-6">
      <ProxyForm onSubmit={onCreate} />
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left">
            <thead className="bg-slate-950/40 text-xs uppercase tracking-[0.24em] text-slate-400">
              <tr>
                <th className="px-4 py-4">Name</th>
                <th className="px-4 py-4">Host</th>
                <th className="px-4 py-4">Port</th>
                <th className="px-4 py-4">Protocol</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Created</th>
                <th className="px-4 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-200">
              {proxies.map((proxy) => (
                <tr key={proxy.id} className="hover:bg-white/5">
                  <td className="px-4 py-4 font-semibold text-white">{proxy.name}</td>
                  <td className="px-4 py-4">{proxy.host}</td>
                  <td className="px-4 py-4">{proxy.port}</td>
                  <td className="px-4 py-4 uppercase">{proxy.protocol}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        proxy.enabled ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-500/15 text-slate-300'
                      }`}
                    >
                      {proxy.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-400">{new Date(proxy.created_at).toLocaleString()}</td>
                  <td className="px-4 py-4 text-right">
                    <button
                      className="rounded-2xl border border-danger/30 p-2 text-danger transition hover:bg-danger/10"
                      onClick={() => onDelete(proxy.id)}
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!proxies.length ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={7}>
                    No proxies registered yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

