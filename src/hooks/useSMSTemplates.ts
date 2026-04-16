import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface SMSTemplate {
    id: string;
    template_id: string;
    template_name: string;
    sms_text: string;
    updated_at: string;
}

export function useSMSTemplates() {
    const [templates, setTemplates] = useState<SMSTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('sms_templates')
                .select('*')
                .order('template_name', { ascending: true });

            if (error) throw error;
            setTemplates(data || []);
        } catch (err: any) {
            console.error('Error fetching SMS templates:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const updateTemplate = async (templateId: string, smsText: string) => {
        try {
            const { data, error } = await supabase
                .from('sms_templates')
                .update({ 
                    sms_text: smsText,
                    updated_at: new Date().toISOString()
                })
                .eq('template_id', templateId)
                .select();

            if (error) throw error;
            
            // Update local state
            setTemplates(prev => prev.map(t => t.template_id === templateId ? { ...t, sms_text: smsText } : t));
            
            return { data, error: null };
        } catch (err: any) {
            console.error('Error updating SMS template:', err);
            return { data: null, error: err.message };
        }
    };

    return {
        templates,
        loading,
        error,
        refresh: fetchTemplates,
        updateTemplate
    };
}
