import { useState } from 'react';
import { useAppointments, Appointment } from '../hooks/useAppointments';
import { AppointmentTable } from '../components/Dashboard/AppointmentTable';
import { ViewAppointmentModal, EditAppointmentModal, DeleteConfirmationModal, RescheduleModal, CancelConfirmationModal } from '../components/Dashboard/AppointmentModals';
import { Users, CalendarCheck, CalendarX, RotateCcw, MapPin, Building2, Phone, Bot, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocations } from '../contexts/LocationContext';
import { useAgents } from '../hooks/useAgents';

export function Dashboard() {
    const { appointments, updateAppointment, deleteAppointment } = useAppointments();
    const { role } = useAuth();
    const { locations, selectedLocation } = useLocations();

    // Modal States
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [modalType, setModalType] = useState<'view' | 'edit' | 'delete' | 'cancel' | 'reschedule' | null>(null);

    const stats = {
        total: appointments.length,
        booked: appointments.filter(a => a.status === 'booked' || a.status === 'rescheduled').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
        rescheduled: appointments.filter(a => a.status === 'rescheduled').length,
        completed: appointments.filter(a => a.status === 'completed').length,
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedAppointment(null);
    };

    return (
        <div className="animate-up">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h1 className="page-title">Appointment Dashboard</h1>
                    <p className="page-subtitle">Real-time monitoring and management of dental appointments.</p>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '999px',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--muted)',
                    fontWeight: 700,
                    fontSize: '13px'
                }}>
                    <MapPin size={16} />
                    <span>
                        {selectedLocation ? `Filtered: ${selectedLocation.name}` : 'Showing: All locations'}
                    </span>
                </div>
            </header>

            {/* Location pills */}
            <div className="card" style={{ padding: '18px 20px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MapPin size={16} style={{ color: 'var(--primary)' }} />
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 800 }}>Available locations</div>
                                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Detected from your database.</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700 }}>
                                {locations.length} total
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
                            {locations.map(loc => (
                                <span
                                    key={loc.id}
                                    className="badge"
                                    style={{
                                        padding: '6px 10px',
                                        borderRadius: '999px',
                                        borderColor: 'transparent',
                                        background: 'var(--primary-light)',
                                        color: 'var(--primary)',
                                        fontWeight: 800,
                                        fontSize: '12px'
                                    }}
                                >
                                    {loc.city && loc.city !== 'Global' ? `${loc.name} · ${loc.city}` : loc.name}
                                </span>
                            ))}
                            {locations.length === 0 && (
                                <span style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '13px' }}>No locations found.</span>
                            )}
                        </div>
                    </div>

                    {/* Stat cards */}
                    <div className="stat-grid">
                        <StatCard label="Total Appointments" value={stats.total.toString()} icon={<Users size={20} />} trend="" type="total" />
                        <StatCard label="Booked" value={stats.booked.toString()} icon={<CalendarCheck size={20} />} trend="" type="booked" />
                        <StatCard label="Cancelled" value={stats.cancelled.toString()} icon={<CalendarX size={20} />} trend="" type="cancelled" />
                        <StatCard label="Rescheduled" value={stats.rescheduled.toString()} icon={<RotateCcw size={20} />} trend="" type="rescheduled" />
                    </div>

                    {/* Appointment table */}
                    <div style={{ marginTop: '24px' }}>
                        <AppointmentTable
                            onView={(apt) => { setSelectedAppointment(apt); setModalType('view'); }}
                            onEdit={(apt) => { setSelectedAppointment(apt); setModalType('edit'); }}
                            onReschedule={(apt) => { setSelectedAppointment(apt); setModalType('reschedule'); }}
                            onCancel={(apt) => { setSelectedAppointment(apt); setModalType('cancel'); }}
                            onDelete={(apt) => { setSelectedAppointment(apt); setModalType('delete'); }}
                        />
                    </div>

            {/* Modals */}
            <ViewAppointmentModal
                isOpen={modalType === 'view'}
                onClose={closeModal}
                appointment={selectedAppointment}
            />
            <EditAppointmentModal
                isOpen={modalType === 'edit'}
                onClose={closeModal}
                appointment={selectedAppointment}
                onSave={async (updates) => {
                    if (selectedAppointment) await updateAppointment(selectedAppointment.id, updates);
                }}
            />
            <RescheduleModal
                isOpen={modalType === 'reschedule'}
                onClose={closeModal}
                appointment={selectedAppointment}
                onSave={async (newTime) => {
                    if (selectedAppointment) await updateAppointment(selectedAppointment.id, { appointment_time: newTime, status: 'rescheduled' });
                }}
            />
            <DeleteConfirmationModal
                isOpen={modalType === 'delete'}
                onClose={closeModal}
                patientName={selectedAppointment?.patient_name || ''}
                onConfirm={async () => {
                    if (selectedAppointment) await deleteAppointment(selectedAppointment.id);
                }}
            />
            <CancelConfirmationModal
                isOpen={modalType === 'cancel'}
                onClose={closeModal}
                patientName={selectedAppointment?.patient_name || ''}
                onConfirm={async () => {
                    if (selectedAppointment) await updateAppointment(selectedAppointment.id, { status: 'cancelled' });
                }}
            />
        </div>
    );
}

function StatCard({ label, value, icon, trend, type }: { label: string, value: string, icon: React.ReactNode, trend: string, type: 'total' | 'agents' | 'booked' | 'cancelled' | 'completed' | 'rescheduled' }) {
    const config = {
        total: { color: 'var(--primary)', bg: 'var(--primary-light)' },
        agents: { color: 'var(--primary)', bg: 'var(--primary-light)' },
        booked: { color: 'var(--status-booked)', bg: 'var(--status-booked-bg)' },
        cancelled: { color: 'var(--status-cancelled)', bg: 'var(--status-cancelled-bg)' },
        completed: { color: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
        rescheduled: { color: 'var(--status-rescheduled)', bg: 'var(--status-rescheduled-bg)' }
    };

    const { color, bg } = config[type];
    const isPositive = trend.startsWith('+');

    return (
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '8px',
                    backgroundColor: bg, color: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {icon}
                </div>
                {trend && (
                    <div style={{
                        padding: '4px 8px', borderRadius: '16px', fontSize: '11px', fontWeight: '700',
                        backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: isPositive ? '#10b981' : '#ef4444'
                    }}>
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--foreground)', lineHeight: '1.2' }}>{value}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '500', marginTop: '4px' }}>{label}</div>
            </div>
        </div>
    );
}
