import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Sun, Moon, MapPin } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
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
                <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontWeight: 700, fontSize: '13px' }}>
                        <MapPin size={16} />
                        <span>Location</span>
                    </div>
                    <select
                        className="search-input"
                        style={{ height: '36px', padding: '0 12px', minWidth: '200px' }}
                        value={selectedLocation ? selectedLocation.id : '__all__'}
                        onChange={(e) => {
                            const v = e.target.value;
                            if (v === '__all__') return setSelectedLocation(null);
                            setSelectedLocation(locations.find(l => l.id === v) || null);
                        }}
                    >
                        <option value="__all__">All locations</option>
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>
                                {loc.city && loc.city !== 'Global' ? `${loc.name} · ${loc.city}` : loc.name}
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
