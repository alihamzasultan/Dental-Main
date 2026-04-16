import { useState } from 'react';
import Calendar from 'react-calendar';
import { useAppointments } from '../hooks/useAppointments';
import { useSettings } from '../hooks/useSettings';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, addDays, subDays, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, List, Grid, Columns } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

export function CalendarView() {
    const { appointments, loading } = useAppointments();
    const { settings } = useSettings();
    const [date, setDate] = useState<Date>(new Date());
    const [view, setView] = useState<'day' | 'week' | 'month'>('week');

    const appointmentsOnDate = (d: Date) => appointments.filter(a => {
        if (!a.appointment_time || a.status === 'cancelled') return false;

        try {
            // parseISO handles the Supabase format correctly with timezones
            const aptDate = parseISO(a.appointment_time);
            return format(aptDate, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd');
        } catch (e) {
            console.error("Date parse error", e);
            return false;
        }
    });

    const handlePrev = () => {
        if (view === 'day') setDate(subDays(date, 1));
        else if (view === 'week') setDate(subDays(date, 7));
        else setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    };

    const handleNext = () => {
        if (view === 'day') setDate(addDays(date, 1));
        else if (view === 'week') setDate(addDays(date, 7));
        else setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    };

    const handleToday = () => setDate(new Date());

    if (loading || !settings) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>Loading schedule...</div>;

    const days = view === 'week'
        ? eachDayOfInterval({ start: startOfWeek(date), end: endOfWeek(date) })
        : [date];

    const timeSlots: string[] = [];
    const slotDuration = 60;
    for (let i = 0; i < 24 * 60; i += slotDuration) {
        const h = Math.floor(i / 60);
        const m = i % 60;
        timeSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }

    return (
        <div className="animate-up">
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em' }}>Schedule Calendar</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '4px' }}>Manage clinic sessions and availability.</p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="card" style={{ padding: '4px', display: 'flex', gap: '4px', backgroundColor: 'var(--background)' }}>
                        <ViewBtn active={view === 'day'} onClick={() => setView('day')} icon={<List size={16} />} label="Day" />
                        <ViewBtn active={view === 'week'} onClick={() => setView('week')} icon={<Columns size={16} />} label="Week" />
                        <ViewBtn active={view === 'month'} onClick={() => setView('month')} icon={<Grid size={16} />} label="Month" />
                    </div>
                </div>
            </header>

            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>
                            {view === 'month' ? format(date, 'MMMM yyyy') :
                                view === 'week' ? `${format(startOfWeek(date), 'MMM d')} - ${format(endOfWeek(date), 'MMM d, yyyy')}` :
                                    format(date, 'MMMM d, yyyy')}
                        </h2>
                        <button onClick={handleToday} className="btn" style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '4px 12px', borderRadius: '12px', border: 'none' }}>Today</button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handlePrev} className="btn" style={{ padding: '8px' }}><ChevronLeft size={20} /></button>
                        <button onClick={handleNext} className="btn" style={{ padding: '8px' }}><ChevronRight size={20} /></button>
                    </div>
                </div>

                {view === 'month' ? (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Calendar
                            onChange={(d: any) => setDate(d as Date)}
                            value={date}
                            className="font-sans"
                            tileContent={({ date: d, view: v }: { date: Date, view: string }) => {
                                if (v !== 'month') return null;
                                const count = appointmentsOnDate(d).length;
                                if (count === 0) return null;
                                return <div style={{ fontSize: '10px', marginTop: '4px', fontWeight: '800', color: 'var(--primary)' }}>{count} apts</div>;
                            }}
                        />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '0', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', height: '600px' }}>
                        {/* Time Gutter */}
                        <div className="no-scrollbar" style={{ backgroundColor: 'var(--background)', borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
                            <div style={{ height: '50px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, backgroundColor: 'var(--background)', zIndex: 5 }} />
                            {timeSlots.map(time => (
                                <div key={time} style={{ height: '60px', padding: '8px', fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>
                                    {time}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid Wrapper for scrolling */}
                        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${days.length}, 1fr)`, backgroundColor: 'var(--card)', flex: 1 }}>
                                {days.map(d => {
                                    const dayName = format(d, 'eeee').toLowerCase();
                                    const isWorkingDay = settings.business_hours?.[dayName]?.enabled;
                                    const apts = appointmentsOnDate(d);

                                    return (
                                        <div key={d.toString()} style={{ borderRight: '1px solid var(--border-light)', position: 'relative' }}>
                                            <div style={{
                                                height: '50px', padding: '12px', textAlign: 'center',
                                                borderBottom: '1px solid var(--border)',
                                                backgroundColor: isToday(d) ? 'var(--primary-light)' : 'var(--background)',
                                                color: isToday(d) ? 'var(--primary)' : 'inherit',
                                                position: 'sticky', top: 0, zIndex: 5
                                            }}>
                                                <div style={{ fontSize: '11px', fontWeight: '700', opacity: 0.6 }}>{format(d, 'EEE').toUpperCase()}</div>
                                                <div style={{ fontSize: '16px', fontWeight: '800' }}>{format(d, 'd')}</div>
                                                {apts.length > 0 && <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '800' }}>{apts.length}Session</div>}
                                            </div>

                                            <div style={{ position: 'relative', height: `${timeSlots.length * 60}px`, backgroundColor: isWorkingDay ? 'transparent' : 'var(--input)', opacity: isWorkingDay ? 1 : 0.4 }}>
                                                {/* Time segments */}
                                                {timeSlots.map((_, i) => (
                                                    <div key={i} style={{ height: '60px', borderBottom: '1px solid var(--border)' }} />
                                                ))}

                                                {/* Appointments */}
                                                {apts.map(apt => {
                                                    const aptTime = parseISO(apt.appointment_time);
                                                    const aptTypes = settings.appointment_types || [];
                                                    const aptType = aptTypes.find(t => t.name === apt.reason_for_visit) || aptTypes[0] || { color: '#3b82f6', duration: 30, name: 'Other' };
                                                    const startHour = aptTime.getHours();
                                                    const startMin = aptTime.getMinutes();

                                                    // Calculate top position based on 12 AM start (0 mins)
                                                    const totalMins = (startHour * 60 + startMin);
                                                    const top = (totalMins / 60) * 60;
                                                    const height = ((aptType.duration || 30) / 60) * 60;

                                                    return (
                                                        <div
                                                            key={apt.id}
                                                            style={{
                                                                position: 'absolute',
                                                                top: `${top}px`,
                                                                left: '4px',
                                                                right: '4px',
                                                                height: `${height}px`,
                                                                backgroundColor: aptType.color + '20',
                                                                borderLeft: `4px solid ${aptType.color}`,
                                                                borderRadius: '4px',
                                                                padding: '8px',
                                                                zIndex: 10,
                                                                overflow: 'hidden',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <div style={{ fontWeight: '800', color: aptType.color }}>{format(aptTime, 'h:mm a')}</div>
                                                            <div style={{ fontWeight: '700', marginTop: '2px' }}>{apt.patient_name}</div>
                                                            <div style={{ fontSize: '10px', opacity: 0.7 }}>{aptType.name}</div>
                                                            {apt.confirmation_status === 'CONFIRMED' && (
                                                                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-completed)' }} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ViewBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                backgroundColor: active ? 'var(--primary)' : 'transparent',
                color: active ? 'white' : 'var(--muted)',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            {icon} {label}
        </button>
    );
}