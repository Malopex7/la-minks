'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth, API_URL } from '@/lib/api';
import { Loader2, ShieldAlert, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface AuditEntry {
    _id: string;
    userId?: { firstName?: string; lastName?: string; email?: string; role?: string } | null;
    action: string;
    entityType: string;
    entityId: string;
    details?: Record<string, unknown>;
    createdAt: string;
}

interface AuditResponse {
    logs: AuditEntry[];
    total: number;
    page: number;
    pages: number;
}

const ACTION_COLORS: Record<string, string> = {
    CREATE: 'bg-blue-100 text-blue-700',
    UPDATE: 'bg-amber-100 text-amber-700',
    DELETE: 'bg-red-100 text-red-700',
    STATUS_CHANGE: 'bg-purple-100 text-purple-700',
    STAFF_ASSIGNED: 'bg-emerald-100 text-emerald-700',
};

const ENTITY_TYPES = ['', 'Booking', 'Service', 'PricingRule', 'User'];

export default function AuditLogPage() {
    const { user } = useAuthStore();
    const [data, setData] = useState<AuditResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [entityType, setEntityType] = useState('');
    const [actionFilter, setActionFilter] = useState('');

    const fetchLogs = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ page: String(page) });
            if (entityType) params.set('entityType', entityType);
            if (actionFilter) params.set('action', actionFilter);

            const res = await fetchWithAuth(`${API_URL}/audit?${params}`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to fetch audit logs');
            }
            const json: AuditResponse = await res.json();
            setData(json);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [user, page, entityType, actionFilter]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });

    const userName = (entry: AuditEntry) =>
        entry.userId
            ? `${entry.userId.firstName ?? ''} ${entry.userId.lastName ?? ''}`.trim() || entry.userId.email || 'Unknown'
            : 'System';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <ShieldAlert className="w-7 h-7 text-zinc-400" />
                    Audit Log
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                    A record of all significant actions performed in the system.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
                <select
                    value={entityType}
                    onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
                    className="text-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                    {ENTITY_TYPES.map(t => (
                        <option key={t} value={t}>{t || 'All entity types'}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Filter by action…"
                    value={actionFilter}
                    onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                    className="text-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-zinc-400 min-w-[180px]"
                />
                {(entityType || actionFilter) && (
                    <button
                        onClick={() => { setEntityType(''); setActionFilter(''); setPage(1); }}
                        className="text-xs text-zinc-500 hover:text-zinc-800 underline"
                    >
                        Clear filters
                    </button>
                )}
                {data && (
                    <span className="ml-auto text-xs text-zinc-400">{data.total} entries</span>
                )}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                    </div>
                ) : error ? (
                    <p className="p-6 text-red-600 text-sm">{error}</p>
                ) : !data?.logs.length ? (
                    <div className="flex flex-col items-center justify-center h-48 text-zinc-400 gap-2">
                        <ShieldAlert className="w-8 h-8" />
                        <p className="text-sm">No audit entries found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3 text-left font-medium">Date / Time</th>
                                    <th className="px-5 py-3 text-left font-medium">User</th>
                                    <th className="px-5 py-3 text-left font-medium">Action</th>
                                    <th className="px-5 py-3 text-left font-medium">Entity</th>
                                    <th className="px-5 py-3 text-left font-medium">Entity ID</th>
                                    <th className="px-5 py-3 text-left font-medium">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {data.logs.map((entry) => (
                                    <tr key={entry._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-5 py-3.5 whitespace-nowrap text-zinc-500 text-xs">
                                            {formatDate(entry.createdAt)}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{userName(entry)}</p>
                                            {entry.userId?.role && (
                                                <p className="text-xs text-zinc-400 capitalize">{entry.userId.role}</p>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLORS[entry.action] ?? 'bg-zinc-100 text-zinc-600'}`}>
                                                {entry.action.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-zinc-700 dark:text-zinc-300 font-medium">
                                            {entry.entityType}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <code className="text-xs text-zinc-400 font-mono">
                                                {String(entry.entityId).slice(-8)}…
                                            </code>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-zinc-500 max-w-[220px] truncate">
                                            {entry.details ? JSON.stringify(entry.details) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {data && data.pages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-500">
                        Page {data.page} of {data.pages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={data.page <= 1}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                            disabled={data.page >= data.pages}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
