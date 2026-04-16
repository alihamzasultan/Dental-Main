import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

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
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLocations() {
            setLoading(true);
            const hardcodedLocations: Location[] = [
                { id: 'all', name: 'All Locations', city: 'Global' },
                { id: 'austin', name: 'AU', city: 'Austin' },
                { id: 'newyork', name: 'NY', city: 'New York' },
                { id: 'sanfrancisco', name: 'SF', city: 'San Francisco' }
            ];
            setLocations(hardcodedLocations);
            setSelectedLocation(hardcodedLocations[0]);
            setLoading(false);
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
