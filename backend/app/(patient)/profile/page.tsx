'use client';
import { useEffect, useState } from 'react';
import { getUserData } from '@/utils/auth';

export default function PatientProfile() {
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600">View and manage your personal information</p>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">First Name</dt>
                            <dd className="mt-1 text-sm text-gray-900">{user.first_name}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                            <dd className="mt-1 text-sm text-gray-900">{user.last_name}</dd>
                        </div>
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
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.is_active 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Email Verified</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.is_verified 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {user.is_verified ? 'Verified' : 'Pending'}
                                </span>
                            </dd>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="/patient/family"
                            className="btn btn-primary"
                        >
                            Manage Family Members
                        </a>
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => alert('Profile editing coming soon!')}
                        >
                            Edit Profile
                        </button>
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => alert('Password change coming soon!')}
                        >
                            Change Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}