import { LogRecord } from '../lib/api';

type LogsTableProps = {
  rows: LogRecord[];
};

export function LogsTable({ rows }: LogsTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-slate-950/40 text-xs uppercase tracking-[0.24em] text-slate-400">
            <tr>
              <th className="px-4 py-4">Method</th>
              <th className="px-4 py-4">Request</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Latency</th>
              <th className="px-4 py-4">Client IP</th>
              <th className="px-4 py-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-white/5">
                <td className="px-4 py-4 font-semibold text-accent">{row.method}</td>
                <td className="max-w-[420px] px-4 py-4 text-slate-300">
                  <div className="truncate">{row.request_url}</div>
                  {row.error ? <div className="mt-1 text-xs text-danger">{row.error}</div> : null}
                </td>
                <td className="px-4 py-4">{row.status_code ?? 'ERR'}</td>
                <td className="px-4 py-4">{row.latency_ms} ms</td>
                <td className="px-4 py-4">{row.client_ip ?? 'n/a'}</td>
                <td className="px-4 py-4 text-slate-400">{new Date(row.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

