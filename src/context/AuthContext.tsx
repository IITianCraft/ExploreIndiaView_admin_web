import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { app } from '@/config/firebase';
import type { User } from 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('AuthProvider: useEffect started');
        let unsubscribe: (() => void) | undefined;

        try {
            if (!app) {
                console.error('AuthProvider: Firebase app is undefined');
                setLoading(false);
                return;
            }
            const auth = getAuth(app);
            console.log('AuthProvider: initialized auth instance', auth);

            unsubscribe = onAuthStateChanged(auth, (user) => {
                console.log('AuthProvider: auth state changed', user ? 'logged in' : 'logged out');
                setUser(user);
                setLoading(false);
            }, (error) => {
                console.error('AuthProvider: onAuthStateChanged error', error);
                setLoading(false);
            });

        } catch (error) {
            console.error('AuthProvider: CRASHED during init', error);
            setLoading(false);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white gap-4 flex-col">
                <LoadingSpinner />
                <p className="text-slate-400 animate-pulse">Initializing Authentication...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
