import { useState } from 'react';
import { useCallLogs, CallOutcome } from '../hooks/useCallLogs';
import { format } from 'date-fns';
import { Phone, Clock, MessageSquare, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useLocations } from '../contexts/LocationContext';

export function CallLogs() {
    const { callLogs, loading } = useCallLogs();
    const { selectedLocation } = useLocations();

    const filteredLogs = callLogs.filter(log => {
        // Filter by location if one is selected
        const matchesLocation = !selectedLocation || 
            (log.location && log.location.toLowerCase() === selectedLocation.name.toLowerCase());

        return matchesLocation;
    });

    if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>Loading call logs...</div>;

    return (
        <div className="animate-up">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="page-title">Real-Time Call Logs</h1>
                    <p className="page-subtitle">Monitor incoming AI-handled calls and their outcomes in real-time.</p>
                </div>
                {selectedLocation && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: 'var(--primary-light)',
                        borderRadius: '20px',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        fontWeight: '600',
                        fontSize: '14px',
                        marginBottom: '8px'
                    }}>
                        <MapPin size={16} />
                        <span>Showing: {selectedLocation.name}</span>
                    </div>
                )}
            </header>

            <div className="table-container">


                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date / Time</th>
                                <th>Caller Number</th>
                                <th>Duration</th>
                                <th>Intent Detected</th>
                                <th>Outcome</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td style={{ fontWeight: '600' }}>
                                            {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Phone size={14} style={{ color: 'var(--muted)' }} />
                                                <span>{log.caller_number}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Clock size={14} style={{ color: 'var(--muted)' }} />
                                                <span>{log.duration}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <MessageSquare size={14} style={{ color: 'var(--muted)' }} />
                                                <span>{log.intent_detected}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <OutcomeBadge outcome={log.outcome} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)', fontStyle: 'italic' }}>
                                        No call logs found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        Showing {filteredLogs.length} of {callLogs.length} logs
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn" style={{ padding: '8px', border: '1px solid var(--border)', backgroundColor: 'transparent' }}><ChevronLeft size={18} /></button>
                        <button className="btn" style={{ padding: '8px', border: '1px solid var(--border)', backgroundColor: 'transparent' }}><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OutcomeBadge({ outcome }: { outcome: CallOutcome }) {
    const config: Record<string, { color: string, bg: string, label: string }> = {
        resolved: { color: 'var(--status-completed)', bg: 'var(--status-completed-bg)', label: 'Resolved' },
        transferred: { color: 'var(--status-booked)', bg: 'var(--status-booked-bg)', label: 'Transferred' },
        abandoned: { color: 'var(--status-cancelled)', bg: 'var(--status-cancelled-bg)', label: 'Abandoned' },
        booked: { color: 'var(--status-booked)', bg: 'var(--status-booked-bg)', label: 'Booked' },
        cancelled: { color: 'var(--status-cancelled)', bg: 'var(--status-cancelled-bg)', label: 'Cancelled' },
        rescheduled: { color: 'var(--status-rescheduled)', bg: 'var(--status-rescheduled-bg)', label: 'Rescheduled' },
        completed: { color: 'var(--status-completed)', bg: 'var(--status-completed-bg)', label: 'Completed' },
    };

    const { color, bg, label } = config[outcome] || config.booked;

    return (
        <span className="badge" style={{ color, backgroundColor: bg, borderColor: 'transparent' }}>
            {label}
        </span>
    );
}
