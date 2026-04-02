'use client';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/config/api.config';
import IconCalendar from '@/components/icon/icon-calendar';
import IconUser from '@/components/icon/icon-user';
import IconDollarSign from '@/components/icon/icon-dollar-sign';
import IconCreditCard from '@/components/icon/icon-credit-card';
import IconFile from '@/components/icon/icon-file';
import IconNotes from '@/components/icon/icon-notes';
import IconStar from '@/components/icon/icon-star';
import IconUsers from '@/components/icon/icon-users';
import Link from 'next/link';

interface DashboardStats {
    total_appointments: number;
    pending_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
    upcoming_appointments: number;
    total_patients: number;
    new_patients_this_month: number;
    new_patients_this_week: number;
    active_providers: number;
    total_payments: number;
    pending_payments: number;
    completed_payments: number;
    total_revenue: number;
    pending_revenue: number;
    total_treatment_plans: number;
    active_treatment_plans: number;
    completed_treatment_plans: number;
    total_prescriptions: number;
    prescriptions_this_month: number;
    total_documents: number;
    total_reviews: number;
    average_rating: number;
    active_plans: number;
}

interface RecentAppointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason: string;
    patient_name: string;
    provider_name: string;
}

interface RecentPatient {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    created_at: string;
}

const ComponentsDashboardDental = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
    const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(API_ENDPOINTS.dashboard, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setStats(data.data.statistics);
                setRecentAppointments(data.data.recent.appointments || []);
                setRecentPatients(data.data.recent.patients || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            'Scheduled': 'primary',
            'Completed': 'success',
            'Cancelled': 'danger',
            'Pending': 'warning',
        };
        return colors[status] || 'secondary';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12 inline-block"></span>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <p className="text-gray-500">Welcome to Protect32 Dental Management System</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                {/* Total Appointments */}
                <div className="panel h-full">
                    <div className="flex items-center">
                        <div className="shrink-0 bg-primary/10 text-primary rounded-xl w-14 h-14 flex items-center justify-center">
                            <IconCalendar className="w-7 h-7" />
                        </div>
                        <div className="ltr:ml-4 rtl:mr-4 flex-1">
                            <p className="text-xl font-semibold text-primary">{stats?.total_appointments || 0}</p>
                            <h5 className="font-semibold text-sm">Total Appointments</h5>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                        <div>
                            <span className="text-success">Pending: {stats?.pending_appointments || 0}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Upcoming: {stats?.upcoming_appointments || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Total Patients */}
                <div className="panel h-full">
                    <div className="flex items-center">
                        <div className="shrink-0 bg-success/10 text-success rounded-xl w-14 h-14 flex items-center justify-center">
                            <IconUsers className="w-7 h-7" />
                        </div>
                        <div className="ltr:ml-4 rtl:mr-4 flex-1">
                            <p className="text-xl font-semibold text-success">{stats?.total_patients || 0}</p>
                            <h5 className="font-semibold text-sm">Total Patients</h5>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                        <div>
                            <span className="text-primary">New This Month: {stats?.new_patients_this_month || 0}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">This Week: {stats?.new_patients_this_week || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="panel h-full">
                    <div className="flex items-center">
                        <div className="shrink-0 bg-warning/10 text-warning rounded-xl w-14 h-14 flex items-center justify-center">
                            <IconDollarSign className="w-7 h-7" />
                        </div>
                        <div className="ltr:ml-4 rtl:mr-4 flex-1">
                            <p className="text-xl font-semibold text-warning">{formatCurrency(stats?.total_revenue || 0)}</p>
                            <h5 className="font-semibold text-sm">Total Revenue</h5>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                        <div>
                            <span className="text-danger">Pending: {formatCurrency(stats?.pending_revenue || 0)}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Completed: {stats?.completed_payments || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Pending Settlements */}
                <div className="panel h-full">
                    <div className="flex items-center">
                        <div className="shrink-0 bg-danger/10 text-danger rounded-xl w-14 h-14 flex items-center justify-center">
                            <IconCreditCard className="w-7 h-7" />
                        </div>
                        <div className="ltr:ml-4 rtl:mr-4 flex-1">
                            <p className="text-xl font-semibold text-danger">{stats?.pending_payments || 0}</p>
                            <h5 className="font-semibold text-sm">Pending Settlements</h5>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                        <div>
                            <span className="text-warning">Amount: {formatCurrency(stats?.pending_revenue || 0)}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Total: {stats?.total_payments || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                {/* Treatment Plans */}
                <div className="panel h-full">
                    <div className="flex items-center">
                        <div className="shrink-0 bg-info/10 text-info rounded-xl w-11 h-11 flex items-center justify-center">
                            <IconNotes className="w-6 h-6" />
                        </div>
                        <div className="ltr:ml-3 rtl:mr-3 flex-1">
                            <p className="text-lg font-semibold text-info">{stats?.total_treatment_plans || 0}</p>
                            <h5 className="font-semibold text-xs">Treatment Plans</h5>
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                        Active: {stats?.active_treatment_plans || 0} | Completed: {stats?.completed_treatment_plans || 0}
                    </div>
                </div>

                {/* Prescriptions */}
                <div className="panel h-full">
                    <div className="flex items-center">
                        <div className="shrink-0 bg-secondary/10 text-secondary rounded-xl w-11 h-11 flex items-center justify-center">
                            <IconFile className="w-6 h-6" />
                        </div>
                        <div className="ltr:ml-3 rtl:mr-3 flex-1">
                            <p className="text-lg font-semibold text-secondary">{stats?.total_prescriptions || 0}</p>
                            <h5 className="font-semibold text-xs">Prescriptions</h5>
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                        This Month: {stats?.prescriptions_this_month || 0}
                    </div>
                </div>

                {/* Documents */}
                <div className="panel h-full">
                    <div className="flex items-center">
                        <div className="shrink-0 bg-primary/10 text-primary rounded-xl w-11 h-11 flex items-center justify-center">
                            <IconFile className="w-6 h-6" />
                        </div>
                        <div className="ltr:ml-3 rtl:mr-3 flex-1">
                            <p className="text-lg font-semibold text-primary">{stats?.total_documents || 0}</p>
                            <h5 className="font-semibold text-xs">Documents</h5>
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                        Medical Records & Files
                    </div>
                </div>

                {/* Reviews */}
                <div className="panel h-full">
                    <div className="flex items-center">
                        <div className="shrink-0 bg-warning/10 text-warning rounded-xl w-11 h-11 flex items-center justify-center">
                            <IconStar className="w-6 h-6" />
                        </div>
                        <div className="ltr:ml-3 rtl:mr-3 flex-1">
                            <p className="text-lg font-semibold text-warning">{stats?.total_reviews || 0}</p>
                            <h5 className="font-semibold text-xs">Reviews</h5>
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                        Avg Rating: {Number(stats?.average_rating || 0).toFixed(1)} ⭐
                    </div>
                </div>
            </div>

            {/* Recent Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Appointments */}
                <div className="panel h-full">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg">Recent Appointments</h5>
                        <Link href="/management/appointments" className="text-primary hover:underline text-sm">
                            View All
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentAppointments.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No appointments found</p>
                        ) : (
                            recentAppointments.map((appointment) => (
                                <div key={appointment.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                                    <div className="flex-1">
                                        <h6 className="font-semibold text-sm">{appointment.patient_name}</h6>
                                        <p className="text-xs text-gray-500">{appointment.provider_name}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatDate(appointment.appointment_date)} at {appointment.appointment_time}
                                        </p>
                                    </div>
                                    <div>
                                        <span className={`badge bg-${getStatusColor(appointment.status)} text-xs`}>
                                            {appointment.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Patients */}
                <div className="panel h-full">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg">Recent Patients</h5>
                        <Link href="/management/patients" className="text-primary hover:underline text-sm">
                            View All
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentPatients.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No patients found</p>
                        ) : (
                            recentPatients.map((patient) => (
                                <div key={patient.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                                    <div className="flex-1">
                                        <h6 className="font-semibold text-sm">{patient.first_name} {patient.last_name}</h6>
                                        <p className="text-xs text-gray-500">{patient.email}</p>
                                        <p className="text-xs text-gray-400 mt-1">{patient.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">{formatDate(patient.created_at)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <Link href="/management/appointments" className="panel hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <IconCalendar className="w-8 h-8 text-primary mr-3" />
                        <div>
                            <h6 className="font-semibold">Appointments</h6>
                            <p className="text-xs text-gray-500">Manage appointments</p>
                        </div>
                    </div>
                </Link>

                <Link href="/management/patients" className="panel hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <IconUsers className="w-8 h-8 text-success mr-3" />
                        <div>
                            <h6 className="font-semibold">Patients</h6>
                            <p className="text-xs text-gray-500">Manage patients</p>
                        </div>
                    </div>
                </Link>

                <Link href="/management/treatment-plans" className="panel hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <IconNotes className="w-8 h-8 text-info mr-3" />
                        <div>
                            <h6 className="font-semibold">Treatment Plans</h6>
                            <p className="text-xs text-gray-500">View treatment plans</p>
                        </div>
                    </div>
                </Link>

                <Link href="/management/prescriptions" className="panel hover:shadow-lg transition-shadow">
                    <div className="flex items-center">
                        <IconFile className="w-8 h-8 text-warning mr-3" />
                        <div>
                            <h6 className="font-semibold">Prescriptions</h6>
                            <p className="text-xs text-gray-500">Manage prescriptions</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default ComponentsDashboardDental;
