import React from 'react';
import {
    LayoutDashboard,
    Database,
    Calendar,
    BarChart3,
    Bell,
    Settings,
    PhoneCall,
    HelpCircle,
    AlertCircle,
    MessageSquare,
    ChevronRight,
    ChevronDown,
    LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    isMobile?: boolean;
    activePage: string;
    setActivePage: (page: string) => void;
}

export function Sidebar({ isOpen, isMobile = false, activePage, setActivePage }: SidebarProps) {
    const { user, role, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const userMenuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu]);

    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
        'Overview': true,
        'AI Operations': true,
        'Analytics & Billing': true,
        'Administration': true
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <aside
            className={`sidebar ${isOpen ? '' : 'collapsed'} ${isMobile ? 'sidebar-mobile' : ''} ${isMobile && !isOpen ? 'sidebar-mobile-hidden' : ''}`}
            style={{ backgroundColor: 'var(--card)', borderRight: '1px solid var(--border)' }}
        >
            <div className="sidebar-header" style={{ borderBottom: 'none', padding: '16px 24px', height: 'auto', minHeight: 'var(--navbar-height)' }}>
                <div ref={userMenuRef} style={{ position: 'relative', width: '100%' }}>
                    <button
                        className="btn user-profile"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        style={{ 
                            width: '100%', display: 'flex', alignItems: 'center', 
                            justifyContent: isOpen ? 'flex-start' : 'center', 
                            padding: isOpen ? '6px 12px 6px 6px' : '6px', 
                            borderRadius: '12px',
                            transition: 'all 0.2s', 
                            backgroundColor: 'var(--input)',
                            border: '1px solid var(--border)',
                            gap: '12px',
                            cursor: 'pointer'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                    >
                        <div className="user-avatar group" style={{ 
                            flexShrink: 0, 
                            backgroundColor: 'var(--primary)', 
                            borderRadius: '8px',
                            width: '36px', height: '36px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15) rotate(-10deg)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1) rotate(0)'}
                        >
                            <img src="/tooth.png" style={{ height: '22px', width: '22px', filter: 'brightness(0) invert(1)', pointerEvents: 'none' }} />
                        </div>
                        {isOpen && (
                            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--foreground)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>Dental Ai</span>
                                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--muted)' }}>Administrator</span>
                            </div>
                        )}
                    </button>

                    {showUserMenu && (
                        <div className="card animate-in" style={{
                            position: 'absolute',
                            left: isOpen ? 0 : '100%',
                            top: isOpen ? '100%' : 0,
                            marginLeft: isOpen ? 0 : '16px',
                            marginTop: isOpen ? '12px' : 0,
                            width: isOpen ? '100%' : '200px',
                            zIndex: 100,
                            padding: '8px'
                        }}>
                            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                                <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                            </div>
                            <button
                                onClick={() => logout()}
                                style={{
                                    display: 'flex', gap: '12px', padding: '10px 12px',
                                    borderRadius: '8px', color: '#ef4444',
                                    border: 'none', background: 'none', width: '100%',
                                    cursor: 'pointer', textAlign: 'left', alignItems: 'center',
                                    fontWeight: '600', fontSize: '13px'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <nav className="nav-list no-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                <SectionLabel isOpen={isOpen} label="Overview" expanded={expandedSections['Overview']} onToggle={() => toggleSection('Overview')} />
                {(!isOpen || expandedSections['Overview']) && (
                    <>
                        <NavItem
                            icon={<LayoutDashboard size={18} strokeWidth={1.5} />}
                            label="Dashboard"
                            active={activePage === 'dashboard'}
                            onClick={() => setActivePage('dashboard')}
                            isOpen={isOpen}
                        />
                        <NavItem
                            icon={<Calendar size={18} strokeWidth={1.5} />}
                            label="Calendar"
                            active={activePage === 'calendar'}
                            onClick={() => setActivePage('calendar')}
                            isOpen={isOpen}
                        />
                    </>
                )}

                <SectionLabel isOpen={isOpen} label="AI Operations" expanded={expandedSections['AI Operations']} onToggle={() => toggleSection('AI Operations')} />
                {(!isOpen || expandedSections['AI Operations']) && (
                    <>
                        <NavItem
                            icon={<PhoneCall size={18} strokeWidth={1.5} />}
                            label="Call Logs"
                            active={activePage === 'call-logs'}
                            onClick={() => setActivePage('call-logs')}
                            isOpen={isOpen}
                        />
                        <NavItem
                            icon={<AlertCircle size={18} strokeWidth={1.5} />}
                            label="Unanswered"
                            active={activePage === 'unanswered'}
                            onClick={() => setActivePage('unanswered')}
                            isOpen={isOpen}
                            badge={2}
                        />
                        <NavItem
                            icon={<HelpCircle size={18} strokeWidth={1.5} />}
                            label="Knowledge Base"
                            active={activePage === 'faq'}
                            onClick={() => setActivePage('faq')}
                            isOpen={isOpen}
                        />
                    </>
                )}

                <SectionLabel isOpen={isOpen} label="Analytics & Billing" expanded={expandedSections['Analytics & Billing']} onToggle={() => toggleSection('Analytics & Billing')} />
                {(!isOpen || expandedSections['Analytics & Billing']) && (
                    <>
                        <NavItem
                            icon={<BarChart3 size={18} strokeWidth={1.5} />}
                            label="Analytics"
                            active={activePage === 'analytics'}
                            onClick={() => setActivePage('analytics')}
                            isOpen={isOpen}
                        />
                    </>
                )}

                <SectionLabel isOpen={isOpen} label="Administration" expanded={expandedSections['Administration']} onToggle={() => toggleSection('Administration')} />
                {(!isOpen || expandedSections['Administration']) && (
                    <>
                        <NavItem
                            icon={<Settings size={18} strokeWidth={1.5} />}
                            label="Settings"
                            active={activePage === 'settings'}
                            onClick={() => setActivePage('settings')}
                            isOpen={isOpen}
                        />
                        <NavItem
                            icon={<MessageSquare size={18} strokeWidth={1.5} />}
                            label="SMS Templates"
                            active={activePage === 'sms-templates'}
                            onClick={() => setActivePage('sms-templates')}
                            isOpen={isOpen}
                        />
                    </>
                )}
            </nav>
        </aside>
    );
}

function SectionLabel({ isOpen, label, expanded = false, onToggle }: { isOpen: boolean, label: string, expanded?: boolean, onToggle?: () => void }) {
    if (!isOpen) return <div style={{ height: '8px' }}></div>;
    return (
        <div 
            onClick={onToggle}
            style={{
                padding: '24px 24px 8px 24px',
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
            }}>
            <span>{label}</span>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
    );
}

function NavItem({ icon, label, isOpen, active = false, onClick, badge }: {
    icon: React.ReactNode,
    label: string,
    isOpen?: boolean,
    active?: boolean,
    onClick: () => void,
    badge?: number | string
}) {
    return (
        <button
            onClick={onClick}
            className={`nav-item ${active ? 'active' : ''}`}
            style={{ paddingLeft: isOpen ? '12px' : '0', paddingRight: isOpen ? '12px' : '0', justifyContent: isOpen ? 'flex-start' : 'center' }}
        >
            <span className="icon" style={{ marginRight: isOpen ? '12px' : '0', display: 'flex', alignItems: 'center' }}>
                {icon}
            </span>
            <span className="nav-label" style={{ fontSize: '13px' }}>{label}</span>
            {isOpen && badge && (
                <span style={{
                    marginLeft: 'auto',
                    backgroundColor: 'var(--input)',
                    color: 'var(--muted)',
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    minWidth: '18px',
                    textAlign: 'center'
                }}>
                    {badge}
                </span>
            )}
        </button>
    );
}
