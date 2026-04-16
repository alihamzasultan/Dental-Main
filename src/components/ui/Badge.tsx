import { AppointmentStatus } from '../../hooks/useAppointments';

interface BadgeProps {
    status: string | null;
}

export function Badge({ status }: BadgeProps) {
    if (!status) return (
        <span className="badge" style={{ backgroundColor: 'var(--border)', color: 'var(--muted)' }}>
            Pending
        </span>
    );

    const styles: Record<string, { color: string, bg: string }> = {
        booked: { color: 'var(--status-booked)', bg: 'var(--status-booked-bg)' },
        cancelled: { color: 'var(--status-cancelled)', bg: 'var(--status-cancelled-bg)' },
        rescheduled: { color: 'var(--status-rescheduled)', bg: 'var(--status-rescheduled-bg)' },
        completed: { color: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
    };

    const normalizedStatus = (status || 'booked').toLowerCase();
    const config = styles[normalizedStatus] || { color: 'var(--muted)', bg: 'var(--input)' };

    return (
        <span className="badge" style={{
            color: config.color,
            backgroundColor: config.bg,
            border: `1px solid ${config.color}20`
        }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
