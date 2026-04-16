import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useLocations } from '../contexts/LocationContext';

export interface AgentData {
    id?: number;
    location_state: string;
    locaion_city: string;
    company_name: string;
    company_name_small: string;
    company_contact: string;
    company_address: string;
    agent_phone: string;
    created_at?: string;
}

export function useAgentData() {
    const [lastSubmission, setLastSubmission] = useState<AgentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { selectedLocation } = useLocations();

    const fetchLatestData = useCallback(async () => {
        if (!selectedLocation) return;
        
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('agent_location_data')
                .select('*')
                // Filter by city if it matches our selected location city
                .ilike('locaion_city', selectedLocation.city) 
                .order('id', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    setLastSubmission(null);
                } else {
                    console.warn('Fetch error:', error.message);
                }
            } else {
                setLastSubmission(data);
            }
        } catch (err: any) {
            console.error('Error fetching latest agent data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedLocation]);

    useEffect(() => {
        fetchLatestData();
    }, [fetchLatestData]);

    const createAgentEntry = async (entry: AgentData) => {
        try {
            // 1. Check if a record with this phone number already exists
            const { data: existing } = await supabase
                .from('agent_location_data')
                .select('id')
                .eq('agent_phone', entry.agent_phone)
                .maybeSingle();

            let result;
            if (existing) {
                // 2. Update the existing record
                console.log(`Updating existing agent record ID: ${existing.id}`);
                result = await supabase
                    .from('agent_location_data')
                    .update(entry)
                    .eq('id', existing.id)
                    .select();
            } else {
                // 3. Insert fresh record
                console.log('Inserting new agent record');
                result = await supabase
                    .from('agent_location_data')
                    .insert([entry])
                    .select();
            }

            if (!result.error) {
                fetchLatestData();
            }
            return result;
        } catch (err: any) {
            return { data: null, error: err };
        }
    };

    return { lastSubmission, loading, error, refresh: fetchLatestData, createAgentEntry };
}
