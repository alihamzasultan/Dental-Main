import { useState, useEffect, useCallback } from 'react';
import { supabase, CLOSING_HOURS_TABLE, WEEKLY_HOURS_TABLE, TIMINGS_AND_SETTINGS_TABLE } from '../lib/supabase';

const SETTINGS_STORAGE_KEY = 'clinic_settings_v1';

export interface ClinicSettings {
    id?: string;
    reminder_timing: string;
    reminder_channels: string[];
    reminder_template: string;
    followup_timing: string;
    followup_channels: string[];
    followup_template: string;
    followup_enabled: boolean;
    business_hours: any;
    after_hours_behavior: 'voicemail' | 'callback' | 'message';
    holidays: string[];
    appointment_types: {
        id: string;
        name: string;
        duration: number;
        color: string;
        pre_buffer?: number;
        post_buffer?: number;
    }[];
    slot_duration: number;
    buffer_time: number;
    db_id?: string | number;
}

const DEFAULT_SETTINGS: ClinicSettings = {
    reminder_timing: '24h',
    reminder_channels: ['sms', 'email'],
    reminder_template: "Hi {{ $json['Customer Name'] }}, this is a friendly reminder from SmileCraft Family Dental & Orthodontics. You have an appointment tomorrow, {{ DateTime.fromISO($json['Booking Date']).toFormat('MMM d, yyyy') }} at {{ DateTime.fromISO($json['Booking Date']).toFormat('h:mm a') }} for . Please call us if you need to reschedule. We look forward to seeing you!",
    followup_timing: '1d',
    followup_channels: ['sms'],
    followup_template: 'Hi {{ $json[\'Customer Name\'] }}, how was your visit? We appreciate your feedback.',
    followup_enabled: true,
    business_hours: {
        monday: { open: '08:00', close: '18:00', enabled: true },
        tuesday: { open: '08:00', close: '18:00', enabled: true },
        wednesday: { open: '08:00', close: '18:00', enabled: true },
        thursday: { open: '08:00', close: '18:00', enabled: true },
        friday: { open: '08:00', close: '18:00', enabled: true },
        saturday: { open: '09:00', close: '14:00', enabled: true },
        sunday: { open: '00:00', close: '00:00', enabled: false },
    },
    after_hours_behavior: 'callback',
    holidays: ['2026-01-01', '2026-07-04', '2026-11-26', '2026-12-25'],
    appointment_types: [
        { id: '1', name: 'Cleaning', duration: 30, color: '#10b981', pre_buffer: 5, post_buffer: 5 },
        { id: '2', name: 'Consultation', duration: 15, color: '#3b82f6', pre_buffer: 0, post_buffer: 5 },
        { id: '3', name: 'Root Canal', duration: 60, color: '#ef4444', pre_buffer: 10, post_buffer: 10 },
        { id: '4', name: 'Whitening', duration: 45, color: '#fbbf24', pre_buffer: 5, post_buffer: 5 },
    ],
    slot_duration: 15,
    buffer_time: 10,
};

// Helpers for time formatting
function timingToHours(timing: string): number {
    if (timing === '12h') return 12;
    if (timing === '24h') return 24;
    if (timing === '48h') return 48;
    if (timing === '1w') return 168; // 7 * 24
    return 24;
}

function hoursToTiming(hours: number): string {
    if (hours === 12) return '12h';
    if (hours === 24) return '24h';
    if (hours === 48) return '48h';
    if (hours === 168) return '1w';
    return '24h';
}

function followupToHours(timing: string): number {
    if (timing === '1h') return 1;
    if (timing === '4h') return 4;
    if (timing === '1d') return 24;
    if (timing === '3d') return 72;
    return 24;
}

function hoursToFollowup(hours: number): string {
    if (hours === 1) return '1h';
    if (hours === 4) return '4h';
    if (hours === 24) return '1d';
    if (hours === 72) return '3d';
    return '1d';
}

function formatTimeToDB(timeStr: string): string {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'pm' : 'am';
    const h = hours % 12 || 12;
    return `${h}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function parseTimeFromDB(rangeStr: string): { open: string, close: string, enabled: boolean } {
    if (!rangeStr || rangeStr.toLowerCase() === 'closed') {
        return { open: '08:00', close: '18:00', enabled: false };
    }
    
    const parts = rangeStr.split('-').map(s => s.trim().toLowerCase());
    if (parts.length !== 2) return { open: '08:00', close: '18:00', enabled: false };

    const parse = (time: string) => {
        const match = time.match(/(\d+)(?::(\d+))?\s*(am|pm)/i);
        if (!match) return '08:00';
        let h = parseInt(match[1]);
        const m = match[2] || '00';
        const p = match[3].toLowerCase();
        if (p === 'pm' && h < 12) h += 12;
        if (p === 'am' && h === 12) h = 0;
        return `${h.toString().padStart(2, '0')}:${m.padStart(2, '0')}`;
    };

    return { open: parse(parts[0]), close: parse(parts[1]), enabled: true };
}

export function useSettings() {
    const [settings, setSettings] = useState<ClinicSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
            let parsed = stored ? JSON.parse(stored) : {};
            
            // Fetch holidays from Supabase (single row)
            const { data: holidayRows, error: holidayError } = await supabase
                .from(CLOSING_HOURS_TABLE)
                .select('holiday')
                .limit(1);
            
            if (holidayError) throw holidayError;
            
            let holidays: string[] = [];
            if (holidayRows && holidayRows.length > 0) {
                const holidayStr = holidayRows[0].holiday || '';
                holidays = holidayStr.split(',').filter(Boolean).map((s: string) => s.trim()).sort();
            }

            // Fetch business hours from Supabase (single row)
            const { data: matrixRows, error: matrixError } = await supabase
                .from(WEEKLY_HOURS_TABLE)
                .select('*')
                .limit(1);
            
            let business_hours = parsed.business_hours || DEFAULT_SETTINGS.business_hours;
            
            if (!matrixError && matrixRows && matrixRows.length > 0) {
                const row = matrixRows[0];
                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                const fetchedHours: any = {};
                days.forEach(day => {
                    if (row[day.toLowerCase()]) {
                        fetchedHours[day] = parseTimeFromDB(row[day.toLowerCase()]);
                    }
                });
                business_hours = { ...business_hours, ...fetchedHours };
            }

            // Fetch channels and timings from timings_and_settings (single row)
            const { data: channelRows } = await supabase
                .from(TIMINGS_AND_SETTINGS_TABLE)
                .select('*')
                .limit(1);
            
            let reminder_channels = parsed.reminder_channels || DEFAULT_SETTINGS.reminder_channels;
            let reminder_timing = parsed.reminder_timing || DEFAULT_SETTINGS.reminder_timing;
            let followup_enabled = parsed.followup_enabled ?? DEFAULT_SETTINGS.followup_enabled;
            let followup_timing = parsed.followup_timing || DEFAULT_SETTINGS.followup_timing;
            let db_id = undefined;

            if (channelRows && channelRows.length > 0) {
                const row = channelRows[0];
                db_id = row.id;
                
                // Map channels
                reminder_channels = [];
                if (row.send_sms) reminder_channels.push('sms');
                if (row.send_email) reminder_channels.push('email');
                
                // Map timing
                if (row.appointment_reminder_timing) {
                    reminder_timing = hoursToTiming(row.appointment_reminder_timing);
                }

                // Map follow-up
                if (row.follow_up_enabled !== null && row.follow_up_enabled !== undefined) {
                    followup_enabled = row.follow_up_enabled;
                }
                if (row.follow_up_timing) {
                    followup_timing = hoursToFollowup(row.follow_up_timing);
                }
            }

            // Merge with defaults and Supabase holidays
            setSettings({
                ...DEFAULT_SETTINGS,
                ...parsed,
                holidays,
                business_hours,
                reminder_channels,
                reminder_timing,
                followup_enabled,
                followup_timing,
                db_id,
                appointment_types: parsed.appointment_types || DEFAULT_SETTINGS.appointment_types
            });
        } catch (err: any) {
            console.error('Error fetching settings:', err);
            setSettings(DEFAULT_SETTINGS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSettings = async (updates: Partial<ClinicSettings>) => {
        const next = { ...(settings || DEFAULT_SETTINGS), ...updates };
        try {
            // Handle Channels, Timing, and Follow-ups update in Supabase
            if (updates.reminder_channels || updates.reminder_timing || updates.followup_enabled !== undefined || updates.followup_timing) {
                const upsertData: any = {};
                
                // Reminder Channels
                if (updates.reminder_channels) {
                    upsertData.send_sms = updates.reminder_channels.includes('sms');
                    upsertData.send_email = updates.reminder_channels.includes('email');
                } else if (settings?.reminder_channels) {
                    upsertData.send_sms = settings.reminder_channels.includes('sms');
                    upsertData.send_email = settings.reminder_channels.includes('email');
                }

                // Reminder Timing
                if (updates.reminder_timing) {
                    upsertData.appointment_reminder_timing = timingToHours(updates.reminder_timing);
                } else if (settings?.reminder_timing) {
                    upsertData.appointment_reminder_timing = timingToHours(settings.reminder_timing);
                }

                // Follow-ups
                if (updates.followup_enabled !== undefined) {
                    upsertData.follow_up_enabled = updates.followup_enabled;
                } else if (settings?.followup_enabled !== undefined) {
                    upsertData.follow_up_enabled = settings.followup_enabled;
                }

                if (updates.followup_timing) {
                    upsertData.follow_up_timing = followupToHours(updates.followup_timing);
                } else if (settings?.followup_timing) {
                    upsertData.follow_up_timing = followupToHours(settings.followup_timing);
                }

                const targetId = updates.db_id || settings?.db_id;
                
                if (targetId) {
                    await supabase.from(TIMINGS_AND_SETTINGS_TABLE).update(upsertData).eq('id', targetId);
                } else {
                    const { data: existing } = await supabase.from(TIMINGS_AND_SETTINGS_TABLE).select('id').limit(1);
                    if (existing && existing.length > 0) {
                        await supabase.from(TIMINGS_AND_SETTINGS_TABLE).update(upsertData).eq('id', existing[0].id);
                    } else {
                        await supabase.from(TIMINGS_AND_SETTINGS_TABLE).insert([upsertData]);
                    }
                }
            }

            // Handle Business Hours Matrix update in Supabase
            if (updates.business_hours) {
                const row: any = {};
                Object.entries(updates.business_hours).forEach(([day, hours]: [string, any]) => {
                    row[day.toLowerCase()] = hours.enabled 
                        ? `${formatTimeToDB(hours.open)} - ${formatTimeToDB(hours.close)}`
                        : 'Closed';
                });

                const { data: existing } = await supabase.from(WEEKLY_HOURS_TABLE).select('id').limit(1);
                if (existing && existing.length > 0) {
                    await supabase.from(WEEKLY_HOURS_TABLE).update(row).eq('id', existing[0].id);
                } else {
                    await supabase.from(WEEKLY_HOURS_TABLE).insert([row]);
                }
            }

            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
            setSettings(next);
            return { error: null };
        } catch (err: any) {
            return { error: err };
        }
    };

    const addHoliday = async (date: string) => {
        try {
            if (!settings) throw new Error('Settings not loaded');
            
            const newHolidays = [...settings.holidays, date].sort();
            const holidayStr = newHolidays.join(',');

            // Upsert to the first row (we'll use a fixed ID like 1 if possible, 
            // but since we don't know the schema, we'll fetch then update or insert)
            const { data: existing } = await supabase.from(CLOSING_HOURS_TABLE).select('id').limit(1);
            
            let result;
            if (existing && existing.length > 0) {
                result = await supabase
                    .from(CLOSING_HOURS_TABLE)
                    .update({ holiday: holidayStr })
                    .eq('id', existing[0].id);
            } else {
                result = await supabase
                    .from(CLOSING_HOURS_TABLE)
                    .insert([{ holiday: holidayStr }]);
            }
            
            if (result.error) throw result.error;
            
            setSettings(prev => prev ? { ...prev, holidays: newHolidays } : prev);
            return { error: null };
        } catch (err: any) {
            console.error('Error adding holiday:', err);
            return { error: err.message };
        }
    };

    const removeHoliday = async (date: string) => {
        try {
            if (!settings) throw new Error('Settings not loaded');
            
            const newHolidays = settings.holidays.filter(h => h !== date);
            const holidayStr = newHolidays.join(',');

            const { data: existing } = await supabase.from(CLOSING_HOURS_TABLE).select('id').limit(1);
            
            if (existing && existing.length > 0) {
                const { error } = await supabase
                    .from(CLOSING_HOURS_TABLE)
                    .update({ holiday: holidayStr })
                    .eq('id', existing[0].id);
                
                if (error) throw error;
            }
            
            setSettings(prev => prev ? { ...prev, holidays: newHolidays } : prev);
            return { error: null };
        } catch (err: any) {
            console.error('Error removing holiday:', err);
            return { error: err.message };
        }
    };

    return { settings, loading, error, updateSettings, addHoliday, removeHoliday };
}
