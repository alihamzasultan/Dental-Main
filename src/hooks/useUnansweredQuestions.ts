import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface UnansweredQuestion {
    id: string;
    original_id: string;
    created_at: string;
    caller_number: string;
    question: string;
    location?: string;
}

export function useUnansweredQuestions() {
    const [questions, setQuestions] = useState<UnansweredQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchQuestions = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('unanswered_questions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Map table layout to correct interface, flat mapping arrays
            const mappedData = (data || []).flatMap((item: any) => {
                let parsedQuestions: string[] = [];
                
                let parsedQuestion = item.question || '';
                try {
                    if (typeof parsedQuestion === 'string' && parsedQuestion.startsWith('[')) {
                        const parsed = JSON.parse(parsedQuestion);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            parsedQuestions = parsed;
                        } else {
                            parsedQuestions = [parsedQuestion];
                        }
                    } else if (Array.isArray(item.question) && item.question.length > 0) {
                        parsedQuestions = item.question;
                    } else {
                        parsedQuestions = [item.question || ''];
                    }
                } catch(e) {
                    parsedQuestions = [item.question || ''];
                }

                return parsedQuestions.map((q, index) => ({
                    id: `${item.id?.toString() || Math.random().toString()}-${index}`,
                    original_id: item.id?.toString() || '',
                    created_at: item.created_at,
                    caller_number: item.phone || 'Unknown',
                    question: q,
                    location: item.location || 'Unknown'
                }));
            });
            
            setQuestions(mappedData);
        } catch (err: any) {
            console.error('Error fetching questions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    return { questions, loading, error, refresh: fetchQuestions };
}
