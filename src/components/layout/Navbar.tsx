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
