import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, LayoutDashboard } from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { CalendarView } from './pages/Calendar';
import { Login } from './pages/Login';
import { CallLogs } from './pages/CallLogs';
import { UnansweredQuestions } from './pages/UnansweredQuestions';
import { FAQManagement } from './pages/FAQManagement';
import { SMSTemplates } from './pages/SMSTemplates';
import { Settings } from './pages/Settings';
import { ModifyAgent } from './pages/ModifyAgent';
import { Agents } from './pages/Agents';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { LocationProvider } from './contexts/LocationContext';
import { AppointmentProvider } from './contexts/AppointmentContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';

function AppContent() {
    const { theme } = useTheme();
    const { user, loading } = useAuth();
    const { addNotification } = useNotifications();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [activePage, setActivePage] = useState('dashboard');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'info' } | null>(null);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleCancelEvent = (e: any) => {
            const apt = e.detail;
            const method = apt.canceled_via_sms ? 'via SMS' : '';
            const msg = `Patient ${apt.patient_name || 'unknown'} cancelled their appointment ${method}.`.replace('  ', ' ');
            setToast({ message: msg, type: 'danger' });
            addNotification({
                type: 'CANCELLED',
                message: msg,
                patientName: apt.patient_name
            });
            setTimeout(() => setToast(null), 8000);
        };
        const handleConfirmEvent = (e: any) => {
            const apt = e.detail;
            const msg = `Patient ${apt.patient_name || 'unknown'} confirmed their appointment via SMS.`;
            setToast({ message: msg, type: 'success' });
            addNotification({
                type: 'CONFIRMED',
                message: msg,
                patientName: apt.patient_name
            });
            setTimeout(() => setToast(null), 8000);
        };
        const handleFollowUpEvent = (e: any) => {
            const apt = e.detail;
            const type = apt.follow_up_response_type === 'POSITIVE' ? 'Positive' : 
                         apt.follow_up_response_type === 'NEGATIVE' ? 'Negative' : 'Response';
            const msg = `${type} follow-up received from ${apt.patient_name || 'patient'}`;
            setToast({ message: msg, type: apt.follow_up_response_type === 'NEGATIVE' ? 'danger' : 'success' });
            addNotification({
                type: apt.follow_up_response_type === 'NEGATIVE' ? 'NEGATIVE' : 'POSITIVE',
                message: msg,
                patientName: apt.patient_name
            });
            setTimeout(() => setToast(null), 8000);
        };
        const handleBookedEvent = (e: any) => {
            const apt = e.detail;
            const msg = `New appointment booked for ${apt.patient_name || 'a patient'}.`;
            setToast({ message: msg, type: 'info' });
            addNotification({
                type: 'NEW_BOOKING',
                message: msg,
                patientName: apt.patient_name
            });
            setTimeout(() => setToast(null), 8000);
        };
        window.addEventListener('appointment-booked', handleBookedEvent);
        window.addEventListener('appointment-cancelled', handleCancelEvent);
        window.addEventListener('appointment-confirmed', handleConfirmEvent);
        window.addEventListener('follow-up-received', handleFollowUpEvent);
        
        const handleNavigate = (e: any) => {
            if (e.detail) setActivePage(e.detail);
        };
        window.addEventListener('navigate', handleNavigate);

        return () => {
            window.removeEventListener('appointment-booked', handleBookedEvent);
            window.removeEventListener('appointment-cancelled', handleCancelEvent);
            window.removeEventListener('appointment-confirmed', handleConfirmEvent);
            window.removeEventListener('follow-up-received', handleFollowUpEvent);
            window.removeEventListener('navigate', handleNavigate);
        };
    }, [addNotification]);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--background)',
                color: 'var(--muted)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div className="sidebar-logo" style={{ width: '48px', height: '48px', animation: 'spin 2s linear infinite' }}>
                        <LayoutDashboard size={24} />
                    </div>
                    <p style={{ fontWeight: '600' }}>Initializing DentalAI Control Panel...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard':
            case 'appointments': return <Dashboard />;
            case 'calendar': return <CalendarView />;
            case 'call-logs': return <CallLogs />;
            case 'unanswered': return <UnansweredQuestions />;
            case 'faq': return <FAQManagement />;
            case 'analytics': return <Analytics />;
            case 'sms-templates': return <SMSTemplates />;
            case 'settings': return <Settings />;
            case 'my-agents': return <Agents />;
            case 'modify-agent': return <ModifyAgent />;
            default:
                return (
                    <div className="empty-state animate-in">
                        <div className="empty-state-icon">
                            <SettingsIcon size={32} />
                        </div>
                        <div>
                            <h3>{activePage.charAt(0).toUpperCase() + activePage.slice(1)} View</h3>
                            <p style={{ fontStyle: 'italic' }}>This module is currently being initialized...</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={`app-container ${theme === 'dark' ? 'dark' : ''}`}>
            {/* Mobile backdrop overlay */}
            {isMobile && isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed', inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 39,
                        backdropFilter: 'blur(2px)',
                        animation: 'fadeIn 0.2s ease'
                    }}
                />
            )}

            <Sidebar
                isOpen={isSidebarOpen}
                isMobile={isMobile}
                activePage={activePage}
                setActivePage={(page) => {
                    setActivePage(page);
                    if (isMobile) setIsSidebarOpen(false);
                }}
            />

            <div className="main-wrapper">
                <Navbar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />

                {toast && (
                    <div style={{
                        position: 'absolute', top: '16px', right: '16px', zIndex: 9999,
                        background: toast.type === 'danger' ? '#ef4444' : toast.type === 'success' ? '#10b981' : '#3b82f6', 
                        color: 'white', padding: '16px 24px',
                        borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <span style={{ fontWeight: '700' }}>{toast.type.toUpperCase()}:</span> {toast.message}
                        <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '12px', opacity: 0.8 }}>✕</button>
                    </div>
                )}

                <section className="content-area">
                    {renderPage()}
                </section>
            </div>
        </div>
    );
}



function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <LocationProvider>
                    <AppointmentProvider>
                        <NotificationProvider>
                            <AppContent />
                        </NotificationProvider>
                    </AppointmentProvider>
                </LocationProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
