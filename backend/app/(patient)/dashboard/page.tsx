'use client';
import { useEffect, useState } from 'react';
import { getUserData } from '@/utils/auth';

export default function PatientDashboard() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = getUserData();
        setUser(userData);
    }, []);

    if (!user) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Welcome, {user.first_name} {user.last_name}!
                    </h2>
                    <p className="text-gray-600">
                        Manage your family members, view appointments, and update your profile information.
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm">👨‍👩‍👧‍👦</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">Family Members</h3>
                                <p className="text-sm text-gray-500">Manage your family information</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <a
                                href="/patient/family"
                                className="btn btn-primary w-full"
                            >
                                Manage Family
                            </a>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm">👤</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">My Profile</h3>
                                <p className="text-sm text-gray-500">Update your personal information</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <a
                                href="/patient/profile"
                                className="btn btn-outline-primary w-full"
                            >
                                View Profile
                            </a>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm">📅</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
                                <p className="text-sm text-gray-500">View your upcoming appointments</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <a
                                href="/patient/appointments"
                                className="btn btn-outline-primary w-full"
                            >
                                View Appointments
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Patient Information Summary */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Your Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Mobile Number</dt>
                            <dd className="mt-1 text-sm text-gray-900">{user.mobile_number}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                            <dd className="mt-1 text-sm text-gray-900 capitalize">{user.user_type}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {new Date(user.created_at).toLocaleDateString()}
                            </dd>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}