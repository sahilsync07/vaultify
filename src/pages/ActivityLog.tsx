import React, { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { driveService, type LogEntry } from '../services/driveService';
import { format } from 'date-fns';
import {
    ClockIcon,
    ArrowPathIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const ActivityLog: React.FC = () => {
    const { accessToken } = useAuthStore();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLogs = async () => {
        setIsLoading(true);
        if (accessToken) {
            const data = await driveService.fetchLogs(accessToken);
            setLogs(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, [accessToken]);

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Audit Logs</h1>
                        <p className="text-muted-foreground mt-1">
                            Secure, immutable record of vault activities.
                            Stored encrypted in Google Drive.
                        </p>
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="p-2 hover:bg-white/5 rounded-full text-white/70 hover:text-white transition-colors"
                        title="Refresh Logs"
                    >
                        <ArrowPathIcon className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <Card variant="glass" className="overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-muted-foreground">Loading audit trail...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                            <ShieldCheckIcon className="w-12 h-12 opacity-20" />
                            <p>No activity recorded yet.</p>
                            <p className="text-xs">Logs begin when you perform actions like uploading files.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-white/5 text-gray-200 uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Time</th>
                                        <th className="px-6 py-4 font-semibold">User</th>
                                        <th className="px-6 py-4 font-semibold">Action</th>
                                        <th className="px-6 py-4 font-semibold">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {logs.map((log, index) => (
                                        <tr key={index} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <ClockIcon className="w-4 h-4 text-primary" />
                                                    {format(new Date(log.timestamp), 'PPpp')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white">{log.user}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">{log.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
};

export default ActivityLog;
