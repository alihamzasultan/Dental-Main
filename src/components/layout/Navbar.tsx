import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Search, Sun, Moon, User, LogOut, MapPin, Bell, Check, Trash2, MessageSquare, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { useNotifications, Notification } from '../../contexts/NotificationContext';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocations } from '../../contexts/LocationContext';

interface NavbarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
}

export function Navbar({
    isSidebarOpen,
    setIsSidebarOpen
}: NavbarProps) {
    const { theme, toggleTheme } = useTheme();
    const { locations, selectedLocation, setSelectedLocation } = useLocations();


    return (
        <header className="navbar">
            <div className="navbar-left">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="btn"
                    style={{ width: '36px', height: '36px', padding: 0, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                </button>



                <div className="divider-v"></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                    <MapPin size={18} style={{ color: 'var(--primary)' }} />
                    <select
                        className="search-input"
                        style={{
                            padding: '0 12px', minWidth: '160px', height: '36px',
                            backgroundColor: 'var(--input)', color: 'var(--foreground)',
                            border: '1px solid var(--border)', borderRadius: '8px',
                            fontSize: '13px', fontWeight: '600', outline: 'none', cursor: 'pointer',
                            WebkitAppearance: 'none',
                            backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px top 50%',
                            backgroundSize: '10px auto'
                        }}
                        value={selectedLocation?.id || 'all'}
                        onChange={(e) => {
                            const loc = locations.find(l => l.id === e.target.value);
                            setSelectedLocation(loc || null);
                        }}
                    >
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id} style={{ background: 'var(--card)', color: 'var(--foreground)' }}>
                                {loc.id === 'all' ? loc.name : loc.city}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="navbar-right">
                <button
                    onClick={toggleTheme}
                    className="btn"
                    style={{ width: '36px', height: '36px', padding: 0, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {theme === 'dark' ? <Sun size={18} style={{ color: '#fbbf24' }} /> : <Moon size={18} />}
                </button>


            </div>
        </header>
    );
}
