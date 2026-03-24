import { LogsTable } from '../components/LogsTable';
import { LogRecord } from '../lib/api';

type LogsPageProps = {
  logs: LogRecord[];
  statusCode: string;
  search: string;
  onStatusCodeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
};

export function LogsPage({ logs, statusCode, search, onStatusCodeChange, onSearchChange }: LogsPageProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur md:grid-cols-[180px_1fr]">
        <select
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          value={statusCode}
          onChange={(event) => onStatusCodeChange(event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="200">200</option>
          <option value="301">301</option>
          <option value="400">400</option>
          <option value="403">403</option>
          <option value="500">500</option>
        </select>
        <input
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          placeholder="Filter by method or URL"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <LogsTable rows={logs} />
    </div>
  );
}

