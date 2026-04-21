import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, APPOINTMENTS_TABLE } from '../lib/supabase';

export interface Location {
    id: string;
    name: string;
    city: string;
}

interface LocationContextType {
    locations: Location[];
    selectedLocation: Location | null;
    setSelectedLocation: (location: Location | null) => void;
    loading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [locations, setLocations] = useState<Location[]>([]);
    // null means "All locations"
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLocations() {
            setLoading(true);
            try {
                // Build a union of locations found in appointments + agent_location_data.
                const [{ data: aptRows, error: aptErr }, { data: agentRows, error: agentErr }] = await Promise.all([
                    supabase
                        .from(APPOINTMENTS_TABLE)
                        .select('location')
                        .not('location', 'is', null),
                    supabase
                        .from('agent_location_data')
                        .select('*')  // use * to avoid 400 from column name mismatches
                ]);

                if (aptErr) console.warn('Location load (appointments) error:', aptErr.message);
                if (agentErr) {
                    // Log full error details to console for debugging
                    console.error('[LocationContext] agent_location_data error:', agentErr.code, agentErr.message, agentErr.details, agentErr.hint);
                }

                const fromAppointments = (aptRows || [])
                    .map((r: any) => (typeof r.location === 'string' ? r.location.trim() : ''))
                    .filter(Boolean)
                    .map((name: string) => ({ name, city: name === 'UK' ? 'Global' : 'Global' }));

                const fromAgents = (agentRows || [])
                    .map((r: any) => ({
                        name: typeof r.location_state === 'string' && r.location_state.trim() ? r.location_state.trim() : '',
                        // Handle both the typo variant and correct spelling
                        city: typeof (r.locaion_city ?? r.location_city) === 'string' && (r.locaion_city ?? r.location_city).trim()
                            ? (r.locaion_city ?? r.location_city).trim()
                            : 'Global',
                    }))
                    .filter((r: any) => r.name);

                const merged = [...fromAppointments, ...fromAgents];
                const uniqueByKey = new Map<string, Location>();

                for (const loc of merged) {
                    const name = loc.name;
                    const city = loc.city || 'Global';
                    const key = `${name.toLowerCase()}::${city.toLowerCase()}`;
                    if (!uniqueByKey.has(key)) {
                        uniqueByKey.set(key, {
                            id: key.replace(/[^a-z0-9:]+/g, '-'),
                            name,
                            city,
                        });
                    }
                }

                const list = Array.from(uniqueByKey.values()).sort((a, b) => a.name.localeCompare(b.name));
                // Fallback to at least UK if DB is empty/unreachable.
                setLocations(list.length ? list : [{ id: 'uk::global', name: 'UK', city: 'Global' }]);
            } finally {
                setLoading(false);
            }
        }

        fetchLocations();
    }, []);

    return (
        <LocationContext.Provider value={{ locations, selectedLocation, setSelectedLocation, loading }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocations() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocations must be used within a LocationProvider');
    }
    return context;
}
