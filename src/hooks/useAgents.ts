import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AgentRow {
  id: number;
  created_at: string;
  location_state: string | null;
  locaion_city: string | null;
  company_name: string | null;
  company_name_small: string | null;
  agent_phone: string | null;
}

export function useAgents() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setCount(null);
      const { data, error, count } = await supabase
        .from('agent_location_data')
        .select('*', { count: 'exact', head: false })
        .order('id', { ascending: false });

      if (error) {
        console.error('[useAgents] Supabase error:', error.code, error.message, error.details, error.hint);
        throw error;
      }
      if (typeof count === 'number') setCount(count);
      setAgents((data || []) as AgentRow[]);
    } catch (e: any) {
      setError(e?.message || 'Failed to load agents');
      setAgents([]);
      setCount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAgent = useCallback(async (id: number, updates: Partial<AgentRow>) => {
    try {
      const { error } = await supabase
        .from('agent_location_data')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('[useAgents] update error:', error.message);
        throw error;
      }
      refresh();
      return true;
    } catch (e: any) {
      console.error('Failed to update agent:', e);
      throw e;
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { agents, count, loading, error, refresh, updateAgent };
}

