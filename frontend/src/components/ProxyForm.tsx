import { useState } from 'react';

type ProxyFormProps = {
  onSubmit: (payload: {
    name: string;
    host: string;
    port: number;
    protocol: 'http' | 'https';
    enabled: boolean;
  }) => Promise<void>;
};

export function ProxyForm({ onSubmit }: ProxyFormProps) {
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState(8080);
  const [protocol, setProtocol] = useState<'http' | 'https'>('http');
  const [enabled, setEnabled] = useState(true);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:grid-cols-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        try {
          await onSubmit({ name, host, port, protocol, enabled });
          setName('');
          setHost('');
          setPort(8080);
          setProtocol('http');
          setEnabled(true);
        } finally {
          setBusy(false);
        }
      }}
    >
      <input
        className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        placeholder="Proxy label"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        placeholder="Host"
        value={host}
        onChange={(event) => setHost(event.target.value)}
      />
      <input
        className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
        type="number"
        min={1}
        max={65535}
        value={port}
        onChange={(event) => setPort(Number(event.target.value))}
      />
      <select
        className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
        value={protocol}
        onChange={(event) => setProtocol(event.target.value as 'http' | 'https')}
      >
        <option value="http">HTTP</option>
        <option value="https">HTTPS</option>
      </select>
      <button
        className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-ink transition hover:bg-[#72e5da] disabled:opacity-50"
        type="submit"
        disabled={busy}
      >
        {busy ? 'Saving...' : `Create ${enabled ? 'enabled' : 'disabled'} proxy`}
      </button>
      <label className="col-span-full flex items-center gap-3 text-sm text-slate-300">
        <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
        Start in enabled state
      </label>
    </form>
  );
}

