'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthWrapperProps {
    children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication on mount and route changes
        const checkAuth = () => {
            const token = localStorage.getItem('auth_token');
            const user = localStorage.getItem('user');

            if (!token || !user) {
                // Not authenticated, redirect to login
                router.push('/auth/boxed-signin');
                return;
            }

            try {
                const userData = JSON.parse(user);
                
                // Check if user is admin
                if (userData.user_type !== 'admin') {
                    // Not an admin, clear storage and redirect
                    localStorage.clear();
                    document.cookie = 'auth_token=; path=/; max-age=0';
                    router.push('/auth/boxed-signin');
                    return;
                }

                setIsAuthenticated(true);
            } catch (error) {
                // Invalid user data, clear and redirect
                localStorage.clear();
                document.cookie = 'auth_token=; path=/; max-age=0';
                router.push('/auth/boxed-signin');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [pathname, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};

export default AuthWrapper;
