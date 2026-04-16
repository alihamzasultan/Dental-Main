import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type UserRole = 'Admin' | 'Read-Only Staff';

interface SimpleUser {
    id: string;
    email: string;
    role: UserRole;
}

interface AuthContextType {
    user: SimpleUser | null;
    role: UserRole;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<SimpleUser | null>(null);
    const [role, setRole] = useState<UserRole>('Admin');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session in localStorage
        const storedUser = localStorage.getItem('clinic_auth_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setRole(parsedUser.role);
            } catch (e) {
                console.error('Failed to parse stored user', e);
                localStorage.removeItem('clinic_auth_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        // Simple hardcoded check
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const newUser: SimpleUser = {
                id: 'admin-1',
                email: ADMIN_EMAIL,
                role: 'Admin'
            };
            setUser(newUser);
            setRole('Admin');
            localStorage.setItem('clinic_auth_user', JSON.stringify(newUser));
        } else if (email.includes('staff') && password === 'staff123') {
            const newUser: SimpleUser = {
                id: 'staff-1',
                email: email,
                role: 'Read-Only Staff'
            };
            setUser(newUser);
            setRole('Read-Only Staff');
            localStorage.setItem('clinic_auth_user', JSON.stringify(newUser));
        } else {
            throw new Error('Invalid login credentials');
        }
    };

    const logout = () => {
        setUser(null);
        setRole('Read-Only Staff');
        localStorage.removeItem('clinic_auth_user');
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
