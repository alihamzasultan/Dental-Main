import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, APPOINTMENTS_TABLE } from '../lib/supabase';
import { useLocations } from './LocationContext';

export type AppointmentStatus = 'booked' | 'cancelled' | 'rescheduled' | 'completed';

export interface Appointment {
    id: string;
    patient_name: string;
    phone: string;
    email: string;
    reason_for_visit: string;
    appointment_time: string;
    status: string | null;
    calendar_event_id?: string;
    location?: string;
    reminder_sent?: string;
    canceled_via_sms?: boolean;
    confirmation_status?: string | null;
    confirmation_received_at?: string | null;
    follow_up_sent?: boolean;
    follow_up_response?: string | null;
    follow_up_response_type?: 'POSITIVE' | 'NEGATIVE' | null;
    feedback_text?: string | null;
    agent_phone?: string;
    created_at: string;
    updated_at: string;
}

interface AppointmentContextType {
    appointments: Appointment[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    addAppointment: (appointment: Partial<Appointment>) => Promise<any>;
    updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<any>;
    deleteAppointment: (id: string) => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export function AppointmentProvider({ children }: { children: React.ReactNode }) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { selectedLocation } = useLocations();

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            let query = supabase
                .from(APPOINTMENTS_TABLE)
                .select('*')
                .order('appointment_time', { ascending: true });

            if (selectedLocation) {
                query = query.ilike('location', selectedLocation.name);
            }

            const { data, error } = await query;

            if (error) throw error;

            let mappedData = (data || []).map(apt => {
                const s = (apt.status || 'booked').toLowerCase();
                return { ...apt, status: s };
            });

            setAppointments(mappedData);
        } catch (err: any) {
            console.error('Error fetching appointments:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedLocation]);

    useEffect(() => {
        fetchAppointments();

        const channel = supabase
            .channel('appointments-global-sync')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: APPOINTMENTS_TABLE,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newStatus = (payload.new.status || 'booked').toLowerCase();
                        const newApt = { ...payload.new, status: newStatus } as Appointment;
                        
                        window.dispatchEvent(new CustomEvent('appointment-booked', { detail: newApt }));

                        if (!selectedLocation || newApt.location === selectedLocation.name) {
                            setAppointments((current) => [...current, newApt]);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const newStatus = (payload.new.status || 'booked').toLowerCase();
                        const updatedApt = { ...payload.new, status: newStatus } as Appointment;
                        
                        setAppointments((current) => {
                            const oldApt = current.find(a => a.id === payload.new.id);
                            const isNewSmsCancel = payload.new.canceled_via_sms === true && (!oldApt || !oldApt.canceled_via_sms);
                            const isStatusCancel = updatedApt.status === 'cancelled' && (!oldApt || oldApt.status !== 'cancelled');
                            const isNewConfirm = payload.new.confirmation_status === 'CONFIRMED' && (!oldApt || oldApt.confirmation_status !== 'CONFIRMED');
                            const isNewFollowUp = payload.new.follow_up_response && (!oldApt || !oldApt.follow_up_response);

                            if (isNewSmsCancel || isStatusCancel) {
                                window.dispatchEvent(new CustomEvent('appointment-cancelled', { 
                                    detail: { ...updatedApt, canceled_via_sms: payload.new.canceled_via_sms } 
                                }));
                            }

                            if (isNewConfirm) {
                                window.dispatchEvent(new CustomEvent('appointment-confirmed', { 
                                    detail: updatedApt 
                                }));
                            }

                            if (isNewFollowUp) {
                                window.dispatchEvent(new CustomEvent('follow-up-received', { 
                                    detail: updatedApt 
                                }));
                            }
                            return current.map((apt) => (apt.id === payload.new.id ? updatedApt : apt));
                        });
                    } else if (payload.eventType === 'DELETE') {
                        setAppointments((current) => current.filter((apt) => apt.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchAppointments, selectedLocation]);

    const addAppointment = async (appointment: Partial<Appointment>) => {
        const { data, error } = await supabase
            .from(APPOINTMENTS_TABLE)
            .insert([{ ...appointment, location: selectedLocation?.name }])
            .select();
        if (error) throw error;
        return data;
    };

    const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
        // Optimistic UI Update
        setAppointments(current => current.map(apt => apt.id === id ? { ...apt, ...updates } : apt));

        const { data, error } = await supabase
            .from(APPOINTMENTS_TABLE)
            .update(updates)
            .eq('id', id)
            .select();
            
        if (error) {
            fetchAppointments(); // Revert on failure
            throw error;
        }
        return data;
    };

    const deleteAppointment = async (id: string) => {
        // Optimistic UI Update
        setAppointments(current => current.filter(apt => apt.id !== id));

        const { error } = await supabase
            .from(APPOINTMENTS_TABLE)
            .delete()
            .eq('id', id);
            
        if (error) {
            fetchAppointments(); // Revert on failure
            throw error;
        }
    };

    return (
        <AppointmentContext.Provider value={{
            appointments,
            loading,
            error,
            refresh: fetchAppointments,
            addAppointment,
            updateAppointment,
            deleteAppointment
        }}>
            {children}
        </AppointmentContext.Provider>
    );
}

export function useAppointmentContext() {
    const context = useContext(AppointmentContext);
    if (context === undefined) {
        throw new Error('useAppointmentContext must be used within an AppointmentProvider');
    }
    return context;
}
