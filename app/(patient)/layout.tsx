'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, getUser as getUserData } from '@/utils/auth';

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = getAuthToken();
        const userData = getUserData();

        if (!token || !userData) {
            router.push('/auth/boxed-signin');
            return;
        }

        // Check if user is a patient
        if (userData.user_type !== 'patient') {
            router.push('/auth/boxed-signin');
            return;
        }

        setUser(userData);
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Patient Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                Welcome, {user.first_name} {user.last_name}
                            </div>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('user');
                                    router.push('/auth/boxed-signin');
                                }}
                                className="btn btn-outline-danger btn-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Patient Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <a
                            href="/patient/dashboard"
                            className="border-b-2 border-transparent hover:border-primary py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                            Dashboard
                        </a>
                        <a
                            href="/patient/family"
                            className="border-b-2 border-transparent hover:border-primary py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                            Family Members
                        </a>
                        <a
                            href="/patient/profile"
                            className="border-b-2 border-transparent hover:border-primary py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                            My Profile
                        </a>
                        <a
                            href="/patient/appointments"
                            className="border-b-2 border-transparent hover:border-primary py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                            Appointments
                        </a>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}