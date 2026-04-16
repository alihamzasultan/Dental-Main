import { useState, useEffect, useCallback } from 'react';
import { useAppointmentContext } from '../contexts/AppointmentContext';
import { useLocations } from '../contexts/LocationContext';

export type CallOutcome = 'resolved' | 'transferred' | 'abandoned' | 'booked' | 'cancelled' | 'rescheduled' | 'completed';

export interface CallLog {
    id: string;
    created_at: string;
    caller_number: string;
    duration: string;
    intent_detected: string;
    outcome: CallOutcome;
    location?: string;
}

// Helper to generate realistic durations
const getRandomDuration = () => {
    const min = 45; // seconds
    const max = 240; // 4 minutes
    const totalSeconds = Math.floor(Math.random() * (max - min + 1)) + min;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}s`;
};

export function useCallLogs() {
    const { appointments, loading, error, refresh } = useAppointmentContext();
    const [callLogs, setCallLogs] = useState<CallLog[]>([]);
    const { selectedLocation } = useLocations();

    const mapAppointmentsToLogs = useCallback(() => {
        const mappedLogs: CallLog[] = appointments.map(apt => ({
            id: apt.id,
            created_at: apt.created_at,
            caller_number: apt.phone || 'Unknown',
            duration: getRandomDuration(),
            intent_detected: apt.reason_for_visit || 'General Inquiry',
            outcome: (apt.status as CallOutcome) || 'booked',
            location: apt.location
        }));
        setCallLogs(mappedLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }, [appointments]);

    useEffect(() => {
        mapAppointmentsToLogs();
    }, [mapAppointmentsToLogs]);

    return { callLogs, loading, error, refresh };
}
