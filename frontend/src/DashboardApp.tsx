import { useEffect, useState } from 'react';
import { BarChart3, FileText, Network } from 'lucide-react';
import { api, LogRecord, ProxyRecord, StatusResponse } from './lib/api';
import { DashboardPage } from './pages/DashboardPage';
import { LogsPage } from './pages/LogsPage';
import { ProxiesPage } from './pages/ProxiesPage';

type Tab = 'dashboard' | 'proxies' | 'logs';

export default function DashboardApp() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [proxies, setProxies] = useState<ProxyRecord[]>([]);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [statusCode, setStatusCode] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getStatus().then(setStatus);
    api.getProxies().then(setProxies);
  }, []);

  useEffect(() => {
    api.getLogs({ statusCode, search, limit: 100 }).then(setLogs);
  }, [statusCode, search]);

  async function handleCreateProxy(payload: Omit<ProxyRecord, 'id' | 'created_at'>) {
    await api.createProxy(payload);
    const updated = await api.getProxies();
    setProxies(updated);
    const updatedStatus = await api.getStatus();
    setStatus(updatedStatus);
  }

  async function handleDeleteProxy(id: string) {
    await api.deleteProxy(id);
    const updated = await api.getProxies();
    setProxies(updated);
    const updatedStatus = await api.getStatus();
    setStatus(updatedStatus);
  }

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
    { id: 'proxies' as Tab, label: 'Proxies', icon: Network },
    { id: 'logs' as Tab, label: 'Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">Proxyra</div>
              <div className="mt-1 text-xl font-semibold tracking-tight">Admin Dashboard</div>
            </div>
            <nav className="flex gap-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${
                    activeTab === id
                      ? 'bg-accent text-slate-950'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && <DashboardPage status={status} logs={logs} />}
        {activeTab === 'proxies' && (
          <ProxiesPage proxies={proxies} onCreate={handleCreateProxy} onDelete={handleDeleteProxy} />
        )}
        {activeTab === 'logs' && (
          <LogsPage
            logs={logs}
            statusCode={statusCode}
            search={search}
            onStatusCodeChange={setStatusCode}
            onSearchChange={setSearch}
          />
        )}
      </main>
    </div>
  );
}
