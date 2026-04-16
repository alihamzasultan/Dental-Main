import { useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { useCallLogs } from '../hooks/useCallLogs';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Calendar, TrendingUp, PhoneCall, CheckCircle2, Navigation, Clock } from 'lucide-react';
import { 
    format, 
    startOfDay, 
    startOfWeek, 
    startOfMonth, 
    isWithinInterval, 
    subDays, 
    subWeeks, 
    subMonths,
    eachDayOfInterval,
    eachHourOfInterval,
    eachWeekOfInterval,
    isSameDay,
    isSameHour,
    isSameWeek,
    isSameMonth
} from 'date-fns';

export function Analytics() {
    const { appointments, loading: appointmentsLoading } = useAppointments();
    const { callLogs, loading: callLogsLoading } = useCallLogs();
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

    // Calculate dynamic data based on appointments and callLogs
    const getChartData = () => {
        const now = new Date();
        let interval: { start: Date, end: Date };
        
        if (timeRange === 'day') {
            interval = { start: startOfDay(now), end: now };
            // Group by hour
            return eachHourOfInterval({ start: startOfDay(now), end: now }).map(hour => {
                const hourFormatted = format(hour, 'HH:00');
                const calls = callLogs.filter(cl => isSameHour(new Date(cl.created_at), hour)).length;
                const bookings = appointments.filter(apt => 
                    (apt.status === 'booked' || apt.status === 'rescheduled' || apt.status === 'completed') &&
                    isSameHour(new Date(apt.created_at || apt.appointment_time), hour)
                ).length;
                return { name: hourFormatted, calls, bookings };
            });
        } else if (timeRange === 'week') {
            interval = { start: subDays(now, 6), end: now };
            // Group by day for the last 7 days
            return eachDayOfInterval(interval).map(day => {
                const dayName = format(day, 'EEE');
                const calls = callLogs.filter(cl => isSameDay(new Date(cl.created_at), day)).length;
                const bookings = appointments.filter(apt => 
                    (apt.status === 'booked' || apt.status === 'rescheduled' || apt.status === 'completed') &&
                    isSameDay(new Date(apt.created_at || apt.appointment_time), day)
                ).length;
                return { name: dayName, calls, bookings };
            });
        } else {
            interval = { start: subWeeks(now, 3), end: now };
            // Group by week for the last 4 weeks
            return eachWeekOfInterval(interval).map((weekStart, index) => {
                const weekLabel = `Week ${index + 1}`;
                const calls = callLogs.filter(cl => isSameWeek(new Date(cl.created_at), weekStart)).length;
                const bookings = appointments.filter(apt => 
                    (apt.status === 'booked' || apt.status === 'rescheduled' || apt.status === 'completed') &&
                    isSameWeek(new Date(apt.created_at || apt.appointment_time), weekStart)
                ).length;
                return { name: weekLabel, calls, bookings };
            });
        }
    };

    const dynamicChartData = getChartData();

    // Calculate statistics
    const totalCalls = callLogs.length;
    const resolvedCalls = callLogs.filter(cl => cl.outcome === 'completed' || cl.outcome === 'resolved').length;
    const bookedCalls = callLogs.filter(cl => cl.outcome === 'booked' || cl.outcome === 'rescheduled').length;
    
    // Resolution Rate %
    const resolutionRate = totalCalls > 0 ? ((resolvedCalls / totalCalls) * 100).toFixed(1) : '0';
    
    // Booking Rate % (based on calls)
    const bookingRate = totalCalls > 0 ? ((bookedCalls / totalCalls) * 100).toFixed(1) : '0';
    
    // Average Handling Time (parse "M:SSs")
    const getAvgHandlingTime = () => {
        if (totalCalls === 0) return "0:00s";
        const totalSeconds = callLogs.reduce((acc, log) => {
            const parts = log.duration.replace('s', '').split(':');
            const seconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
            return acc + seconds;
        }, 0);
        const avgSeconds = Math.round(totalSeconds / totalCalls);
        const mins = Math.floor(avgSeconds / 60);
        const secs = avgSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}s`;
    };

    const avgHandlingTime = getAvgHandlingTime();

    const outcomeData = [
        { name: 'Resolved', value: resolvedCalls + bookedCalls, color: 'var(--status-completed)' },
        { name: 'Transferred', value: callLogs.filter(l => l.outcome === 'transferred').length, color: 'var(--status-booked)' },
        { name: 'Abandoned', value: callLogs.filter(l => l.outcome === 'abandoned' || l.outcome === 'cancelled').length, color: '#ef4444' },
    ];

    if (appointmentsLoading || callLogsLoading) {
        return <div style={{ padding: '64px', textAlign: 'center', color: 'var(--muted)' }}>Calculating real-time analytics...</div>;
    }

    return (
        <div className="animate-up">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Operational Analytics</h1>
                    <p className="page-subtitle">Detailed insights into AI performance and clinic efficiency.</p>
                </div>
                <div style={{ display: 'flex', backgroundColor: 'var(--input)', padding: '4px', borderRadius: '8px' }}>
                    {['day', 'week', 'month'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range as any)}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: timeRange === range ? 'var(--card)' : 'transparent',
                                color: timeRange === range ? 'var(--foreground)' : 'var(--muted)',
                                boxShadow: timeRange === range ? 'var(--card-shadow)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {range.toUpperCase()}
                        </button>
                    ))}
                </div>
            </header>

            <div className="stat-grid" style={{ marginBottom: '32px' }}>
                <AnalyticCard label="Total AI Calls" value={totalCalls.toString()} delta="+12%" icon={<PhoneCall size={20} />} />
                <AnalyticCard label="Booking Rate" value={`${bookingRate}%`} delta="+4.2%" icon={<TrendingUp size={20} />} />
                <AnalyticCard label="Resolution Rate" value={`${resolutionRate}%`} delta="+2.5%" icon={<CheckCircle2 size={20} />} />
                <AnalyticCard label="Avg. Handling Time" value={avgHandlingTime} delta="-12s" icon={<Clock size={20} />} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px' }}>Call Volume & Appointments</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={dynamicChartData}>
                                <defs>
                                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }} />
                                <Area type="monotone" dataKey="calls" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCalls)" strokeWidth={3} />
                                <Area type="monotone" dataKey="bookings" stroke="var(--status-completed)" fillOpacity={0} strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Call Outcome Analysis</h3>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>Performance distribution of AI handled calls.</p>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ height: '240px', width: '200px' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={outcomeData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                                        {outcomeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {outcomeData.map(item => (
                                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: item.color }}></div>
                                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</span>
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '700' }}>
                                        {totalCalls > 0 ? ((item.value / totalCalls) * 100).toFixed(0) : '0'}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AnalyticCard({ label, value, delta, icon }: { label: string, value: string, delta: string, icon: React.ReactNode }) {
    const isNegative = delta.startsWith('-');
    return (
        <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '4px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em' }}>{value}</h2>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: isNegative ? '#ef4444' : 'var(--status-completed)' }}>
                        {delta}
                    </span>
                </div>
            </div>
        </div>
    );
}
