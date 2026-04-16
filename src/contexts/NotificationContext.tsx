import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Notification {
    id: string;
    type: 'CONFIRMED' | 'CANCELLED' | 'POSITIVE' | 'NEGATIVE' | 'INFO' | 'NEW_BOOKING';
    message: string;
    patientName?: string;
    timestamp: string;
    isRead: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const addNotification = (n: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => {
        const newNotification: Notification = {
            ...n,
            id: Math.random().toString(36).substr(2, 9),
            isRead: false,
            timestamp: new Date().toISOString()
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
