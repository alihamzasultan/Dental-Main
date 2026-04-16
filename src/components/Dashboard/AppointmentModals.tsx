import { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from '../../hooks/useAppointments';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { format, isValid } from 'date-fns';
import { User, Phone, Mail, FileText, Clock, AlertTriangle, Bell, MessageSquare, CheckCircle, XCircle, Star } from 'lucide-react';

function safeFormat(dateStr: string | undefined | null, fmt: string, fallback = 'N/A'): string {
    if (!dateStr) return fallback;
    const d = new Date(dateStr);
    return isValid(d) ? format(d, fmt) : fallback;
}

interface ViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
}

export function ViewAppointmentModal({ isOpen, onClose, appointment }: ViewModalProps) {
    if (!appointment) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Appointment Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="sidebar-logo" style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                            <User size={24} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '20px', fontWeight: '800' }}>{appointment.patient_name}</h4>
                            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>ID: {appointment.id.slice(0, 8)}</p>
                        </div>
                    </div>
                    <Badge status={appointment.status as any} />
                </div>

                <div className="detail-grid">
                    <DetailItem icon={<Phone size={18} />} label="Phone" value={appointment.phone} />
                    <DetailItem icon={<Mail size={18} />} label="Email" value={appointment.email} />
                    <DetailItem
                        icon={<Clock size={18} />}
                        label="Appointment Time"
                        value={safeFormat(appointment.appointment_time, 'EEEE, MMMM dd, yyyy @ hh:mm a')}
                    />
                    <DetailItem icon={<FileText size={18} />} label="Reason for Visit" value={appointment.reason_for_visit} />
                    <DetailItem
                        icon={<Bell size={18} />}
                        label="Reminder Sent"
                        value={appointment.reminder_sent === 'YES' ? 'Yes' : 'No'}
                    />
                </div>

                <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                    <h5 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
                        Follow-up & Activity Log
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {appointment.confirmation_status && (
                            <ActivityItem 
                                icon={<CheckCircle size={14} />} 
                                color="var(--status-completed)" 
                                label="Confirmation Status" 
                                value={appointment.confirmation_status} 
                            />
                        )}
                        {appointment.canceled_via_sms && (
                            <ActivityItem 
                                icon={<XCircle size={14} />} 
                                color="#ef4444" 
                                label="Action" 
                                value="Cancelled via SMS Response" 
                            />
                        )}
                        {(appointment as any).feedback_text && (
                            <ActivityItem 
                                icon={<Star size={14} />} 
                                color="#f59e0b" 
                                label="Patient Feedback" 
                                value={(appointment as any).feedback_text} 
                            />
                        )}
                        {!appointment.confirmation_status && !appointment.canceled_via_sms && !(appointment as any).feedback_text && (
                            <p style={{ fontSize: '13px', color: 'var(--muted)', fontStyle: 'italic' }}>No activity logged yet.</p>
                        )}
                    </div>
                </div>

                <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Created: {safeFormat(appointment.created_at, 'MMM dd, yyyy HH:mm')}</span>
                    <span>Last Updated: {safeFormat(appointment.updated_at, 'MMM dd, yyyy HH:mm')}</span>
                </div>
            </div>
        </Modal>
    );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="detail-item">
            <div className="detail-icon">{icon}</div>
            <div className="detail-content">
                <p className="detail-label">{label}</p>
                <p className="detail-value">{value}</p>
            </div>
        </div>
    );
}

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    onSave: (updates: Partial<Appointment>) => Promise<void>;
}

export function EditAppointmentModal({ isOpen, onClose, appointment, onSave }: EditModalProps) {
    const [formData, setFormData] = useState<Partial<Appointment>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (appointment) {
            setFormData({
                patient_name: appointment.patient_name,
                phone: appointment.phone,
                email: appointment.email,
                reason_for_visit: appointment.reason_for_visit,
                status: appointment.status,
            });
        }
    }, [appointment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to update appointment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Appointment">
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <InputGroup label="Patient Name" value={formData.patient_name || ''} onChange={(val) => setFormData({ ...formData, patient_name: val })} />
                    <InputGroup label="Status" value={formData.status || ''} type="select" options={['booked', 'cancelled', 'rescheduled', 'completed']} onChange={(val) => setFormData({ ...formData, status: val })} />
                    <InputGroup label="Phone" value={formData.phone || ''} onChange={(val) => setFormData({ ...formData, phone: val })} />
                    <InputGroup label="Email" value={formData.email || ''} type="email" onChange={(val) => setFormData({ ...formData, email: val })} />
                </div>
                <InputGroup label="Reason for Visit" value={formData.reason_for_visit || ''} type="textarea" onChange={(val) => setFormData({ ...formData, reason_for_visit: val })} />

                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="btn" style={{ padding: '10px 24px', border: '1px solid var(--border)', backgroundColor: 'transparent' }}>Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, patientName }: { isOpen: boolean, onClose: () => void, onConfirm: () => Promise<void>, patientName: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        await onConfirm();
        setIsDeleting(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Appointment" maxWidth="400px">
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <AlertTriangle size={32} />
                </div>
                <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Confirm Deletion</h4>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Are you sure you want to delete the appointment for <strong>{patientName}</strong>? This action cannot be undone.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} className="btn" style={{ flex: 1, padding: '12px', border: '1px solid var(--border)', backgroundColor: 'transparent' }}>Cancel</button>
                    <button onClick={handleConfirm} disabled={isDeleting} className="btn" style={{ flex: 1, padding: '12px', backgroundColor: '#ef4444', color: 'white' }}>
                        {isDeleting ? 'Deleting...' : 'Delete Now'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export function CancelConfirmationModal({ isOpen, onClose, onConfirm, patientName }: { isOpen: boolean, onClose: () => void, onConfirm: () => Promise<void>, patientName: string }) {
    const [isCanceling, setIsCanceling] = useState(false);

    const handleConfirm = async () => {
        setIsCanceling(true);
        await onConfirm();
        setIsCanceling(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cancel Appointment" maxWidth="400px">
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <XCircle size={32} />
                </div>
                <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Confirm Cancellation</h4>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Are you sure you want to cancel the appointment for <strong>{patientName}</strong>?</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} className="btn" style={{ flex: 1, padding: '12px', border: '1px solid var(--border)', backgroundColor: 'transparent' }}>Keep it</button>
                    <button onClick={handleConfirm} disabled={isCanceling} className="btn" style={{ flex: 1, padding: '12px', backgroundColor: '#ef4444', color: 'white' }}>
                        {isCanceling ? 'Canceling...' : 'Yes, Cancel'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export function RescheduleModal({ isOpen, onClose, appointment, onSave }: { isOpen: boolean, onClose: () => void, appointment: Appointment | null, onSave: (time: string) => Promise<void> }) {
    const [newTime, setNewTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (appointment) {
            const formatted = safeFormat(appointment.appointment_time, "yyyy-MM-dd'T'HH:mm", '');
            setNewTime(formatted);
        }
    }, [appointment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(newTime);
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to reschedule');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reschedule Appointment" maxWidth="400px">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <InputGroup label="Select New Date & Time" value={newTime} type="datetime-local" onChange={(val) => setNewTime(val)} />
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={onClose} className="btn" style={{ flex: 1, padding: '12px', border: '1px solid var(--border)', backgroundColor: 'transparent' }}>Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                        {isSubmitting ? 'Rescheduling...' : 'Update Appointment'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

interface AddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Appointment>) => Promise<void>;
}

export function AddAppointmentModal({ isOpen, onClose, onSave }: AddModalProps) {
    const [formData, setFormData] = useState<Partial<Appointment>>({
        status: 'booked',
        appointment_time: format(new Date(), "yyyy-MM-dd'T'10:00")
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.patient_name || !formData.phone || !formData.appointment_time) {
            return alert('Please fill in Name, Phone, and Time.');
        }
        setIsSubmitting(true);
        try {
            await onSave(formData);
            setFormData({ status: 'booked', appointment_time: format(new Date(), "yyyy-MM-dd'T'10:00") });
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to add appointment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Book New Appointment">
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <InputGroup label="Patient Name" value={formData.patient_name || ''} onChange={(val) => setFormData({ ...formData, patient_name: val })} />
                    <InputGroup label="Appointment Time" value={formData.appointment_time || ''} type="datetime-local" onChange={(val) => setFormData({ ...formData, appointment_time: val })} />
                    <InputGroup label="Phone" value={formData.phone || ''} onChange={(val) => setFormData({ ...formData, phone: val })} />
                    <InputGroup label="Email" value={formData.email || ''} type="email" onChange={(val) => setFormData({ ...formData, email: val })} />
                </div>
                <InputGroup label="Reason for Visit" value={formData.reason_for_visit || ''} type="textarea" onChange={(val) => setFormData({ ...formData, reason_for_visit: val })} />

                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="btn" style={{ padding: '10px 24px', border: '1px solid var(--border)', backgroundColor: 'transparent' }}>Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                        {isSubmitting ? 'Creating...' : 'Book Appointment'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function ActivityItem({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color?: string }) {
    return (
        <div style={{ 
            display: 'flex', alignItems: 'flex-start', gap: '12px', 
            padding: '12px', backgroundColor: 'var(--background)', borderRadius: '10px',
            border: '1px solid var(--border)' 
        }}>
            <div style={{ 
                marginTop: '2px', color: color || 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</p>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--foreground)' }}>{value}</p>
            </div>
        </div>
    );
}

function InputGroup({ label, value, onChange, type = 'text', options = [] }: { label: string, value: string, onChange: (val: string) => void, type?: 'text' | 'email' | 'select' | 'textarea' | 'datetime-local', options?: string[] }) {
    return (
        <div className="input-group">
            <label className="input-label">{label}</label>
            {type === 'select' ? (
                <select className="search-input" style={{ paddingLeft: '16px' }} value={value} onChange={(e) => onChange(e.target.value)}>
                    {options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                </select>
            ) : type === 'textarea' ? (
                <textarea className="search-input" style={{ paddingLeft: '16px', height: 'auto', minHeight: '100px', paddingTop: '12px' }} rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
            ) : (
                <input type={type} className="search-input" style={{ paddingLeft: '16px' }} value={value} onChange={(e) => onChange(e.target.value)} />
            )}
        </div>
    );
}
