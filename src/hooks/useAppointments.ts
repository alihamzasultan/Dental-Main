import { useAppointmentContext, Appointment, AppointmentStatus } from '../contexts/AppointmentContext';

export type { Appointment, AppointmentStatus };

export function useAppointments() {
    return useAppointmentContext();
}
