import React, { useState, useRef, useEffect } from 'react';
import { Search, Eye, Edit3, Calendar, XCircle, Trash2, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { Appointment, useAppointments } from '../../hooks/useAppointments';
import { Badge } from '../ui/Badge';
import { format, isValid } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useLocations } from '../../contexts/LocationContext';

function safeFormat(dateStr: string | undefined | null, fmt: string, fallback = 'N/A'): string {
    if (!dateStr) return fallback;
    const d = new Date(dateStr);
    return isValid(d) ? format(d, fmt) : fallback;
}

interface AppointmentTableProps {
    onView: (apt: Appointment) => void;
    onEdit: (apt: Appointment) => void;
    onReschedule: (apt: Appointment) => void;
    onCancel: (apt: Appointment) => void;
    onDelete: (apt: Appointment) => void;
}

export function AppointmentTable({ onView, onEdit, onReschedule, onCancel, onDelete }: AppointmentTableProps) {
    const { appointments, loading, error } = useAppointments();
    const { role } = useAuth();
    const { locations } = useLocations();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredAppointments = appointments
        .filter((apt) => {
            const matchesSearch =
                (apt.patient_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (apt.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (apt.phone || '').includes(searchTerm);

            const matchesStatus = statusFilter === 'all' || 
                apt.status === statusFilter || 
                (statusFilter === 'booked' && apt.status === 'rescheduled');

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());


    if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>Loading appointments...</div>;
    if (error) return <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>Error: {error}</div>;

    return (
        <div className="table-container">
            {/* Table Headers/Controls */}
            <div className="table-header-row">
                <div className="search-input-wrapper" style={{ maxWidth: '360px' }}>
                    <Search size={16} strokeWidth={2.5} style={{ position: 'absolute', left: '12px', color: 'var(--muted)' }} />
                    <input
                        type="text"
                        placeholder="Search patient, email, phone..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select
                        className="search-input"
                        style={{
                            padding: '8px 36px 8px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--card)',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: 'var(--foreground)',
                            cursor: 'pointer',
                            outline: 'none',
                            WebkitAppearance: 'none',
                            backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px top 50%',
                            backgroundSize: '10px auto'
                        }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="booked">Booked</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rescheduled">Rescheduled</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Table Content */}
            <div className="custom-scrollbar" style={{ overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Contact</th>
                            <th>Reason</th>
                            <th>Schedule</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Confirm</th>
                            <th>Reminder</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.map((apt) => (
                            <tr key={apt.id}>
                                <td>
                                    <span style={{ fontWeight: '700' }}>{apt.patient_name}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '600' }}>{apt.phone}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{apt.email && apt.email !== 'EMPTY' ? apt.email : 'No email'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{apt.reason_for_visit}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '600' }}>{safeFormat(apt.appointment_time, 'MMM dd, yyyy')}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{safeFormat(apt.appointment_time, 'hh:mm a')}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '500' }}>
                                        {apt.location || 'N/A'}
                                    </span>
                                </td>
                                <td>
                                    <Badge status={apt.status || 'booked'} />
                                </td>
                                <td>
                                    {apt.confirmation_status === 'CONFIRMED' ? (
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--status-completed)', backgroundColor: 'var(--status-completed-bg)', padding: '2px 8px', borderRadius: '4px' }}>CONFIRMED</span>
                                    ) : (
                                        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--muted)' }}>{apt.confirmation_status || 'PENDING'}</span>
                                    )}
                                </td>
                                <td>
                                    {apt.reminder_sent === 'YES' ? (
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            backgroundColor: 'var(--status-booked-bg)',
                                            color: 'var(--status-booked)',
                                            textTransform: 'uppercase'
                                        }}>
                                            Sent
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Pending</span>
                                    )}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <ActionMenu 
                                            apt={apt} onView={onView} onEdit={onEdit} 
                                            onReschedule={onReschedule} onCancel={onCancel} 
                                            onDelete={onDelete} role={role} 
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredAppointments.length === 0 && (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontStyle: 'italic' }}>No appointments found matching your criteria.</div>
                )}
            </div>
        </div>
    );
}

function ActionMenu({ apt, onView, onEdit, onReschedule, onCancel, onDelete, role }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div style={{ position: 'relative' }} ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', color: 'var(--muted)' }}
            >
                <MoreVertical size={18} />
            </button>
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    zIndex: 50,
                    minWidth: '150px',
                    padding: '8px 0',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <ActionMenuItem icon={<Eye size={14} />} label="View Details" onClick={() => { setIsOpen(false); onView(apt); }} />
                    {role === 'Admin' && (
                        <>
                            <ActionMenuItem icon={<Edit3 size={14} />} label="Edit" onClick={() => { setIsOpen(false); onEdit(apt); }} />
                            <ActionMenuItem icon={<Calendar size={14} />} label="Reschedule" onClick={() => { setIsOpen(false); onReschedule(apt); }} />
                            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />
                            <ActionMenuItem icon={<XCircle size={14} />} label="Cancel" danger onClick={() => { setIsOpen(false); onCancel(apt); }} />
                            <ActionMenuItem icon={<Trash2 size={14} />} label="Delete" danger onClick={() => { setIsOpen(false); onDelete(apt); }} />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function ActionMenuItem({ icon, label, onClick, danger }: any) {
    return (
        <button 
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', border: 'none', background: 'transparent',
                color: danger ? '#ef4444' : 'var(--foreground)',
                fontSize: '13px', fontWeight: '500', textAlign: 'left', cursor: 'pointer', width: '100%'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = danger ? 'rgba(239, 68, 68, 0.1)' : 'var(--input)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
            {icon}
            {label}
        </button>
    );
}
