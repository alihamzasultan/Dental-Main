import { useState } from 'react';
import { useAppointments, Appointment } from '../hooks/useAppointments';
import { AppointmentTable } from '../components/Dashboard/AppointmentTable';
import { ViewAppointmentModal, EditAppointmentModal, DeleteConfirmationModal, RescheduleModal, CancelConfirmationModal } from '../components/Dashboard/AppointmentModals';
import { Users, CalendarCheck, CalendarX, CheckCircle2, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
    const { appointments, updateAppointment, deleteAppointment } = useAppointments();
    const { role } = useAuth();

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
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title">Appointment Dashboard</h1>
                    <p className="page-subtitle">Real-time monitoring and management of dental appointments.</p>
                </div>
            </header>

            <div className="stat-grid">
                <StatCard
                    label="Total Appointments"
                    value={stats.total.toString()}
                    icon={<Users size={20} />}
                    trend="+4%"
                    type="total"
                />
                <StatCard
                    label="Booked"
                    value={stats.booked.toString()}
                    icon={<CalendarCheck size={20} />}
                    trend="+2%"
                    type="booked"
                />
                <StatCard
                    label="Cancelled"
                    value={stats.cancelled.toString()}
                    icon={<CalendarX size={20} />}
                    trend="-1%"
                    type="cancelled"
                />
                <StatCard
                    label="Rescheduled"
                    value={stats.rescheduled.toString()}
                    icon={<RotateCcw size={20} />}
                    trend="+1%"
                    type="rescheduled"
                />
            </div>

            <div style={{ marginTop: '32px' }}>
                <AppointmentTable
                    onView={(apt) => { setSelectedAppointment(apt); setModalType('view'); }}
                    onEdit={(apt) => { setSelectedAppointment(apt); setModalType('edit'); }}
                    onReschedule={(apt) => { setSelectedAppointment(apt); setModalType('reschedule'); }}
                    onCancel={(apt) => {
                        setSelectedAppointment(apt);
                        setModalType('cancel');
                    }}
                    onDelete={(apt) => { setSelectedAppointment(apt); setModalType('delete'); }}
                />
            </div>

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

function StatCard({ label, value, icon, trend, type }: { label: string, value: string, icon: React.ReactNode, trend: string, type: 'total' | 'booked' | 'cancelled' | 'completed' | 'rescheduled' }) {
    const config = {
        total: { color: 'var(--primary)', bg: 'var(--primary-light)' },
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
                <div style={{
                    padding: '4px 8px', borderRadius: '16px', fontSize: '11px', fontWeight: '700',
                    backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: isPositive ? '#10b981' : '#ef4444'
                }}>
                    {trend}
                </div>
            </div>
            <div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--foreground)', lineHeight: '1.2' }}>{value}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '500', marginTop: '4px' }}>{label}</div>
            </div>
        </div>
    );
}
