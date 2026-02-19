'use client';
import IconLayoutGrid from '@/components/icon/icon-layout-grid';
import IconListCheck from '@/components/icon/icon-list-check';
import IconSearch from '@/components/icon/icon-search';
import IconUser from '@/components/icon/icon-user';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS, BASE_URL } from '@/config/api.config';

const ComponentsAppsContactsUsers = () => {
    const [addContactModal, setAddContactModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    
    // Pagination state
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    // Form state
    const [defaultParams] = useState({
        id: null,
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        user_type: 'patient',
        mobile_number: '',
        date_of_birth: '',
        address: '',
        is_active: true,
        profile_picture: null,
    });
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));
    const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, pagination.limit, filterType]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filterType && { user_type: filterType }),
            });

            const response = await fetch(`${API_ENDPOINTS.users}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setUsers(data.data || []);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            } else {
                showMessage(data.error || 'Failed to fetch users', 'error');
            }
        } catch (error: any) {
            showMessage('Error fetching users: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const searchUsers = () => {
        if (!search) {
            fetchUsers();
            return;
        }
        
        const filtered = users.filter((user: any) => {
            const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
            const searchLower = search.toLowerCase();
            return fullName.includes(searchLower) || 
                   user.email?.toLowerCase().includes(searchLower) ||
                   user.mobile_number?.includes(search);
        });
        
        setUsers(filtered);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            searchUsers();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const changeValue = (e: any) => {
        const { value, id, type, checked } = e.target;
        setParams({ ...params, [id]: type === 'checkbox' ? checked : value });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                showMessage('File size must be less than 5MB', 'error');
                return;
            }
            
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showMessage('Only JPEG, PNG, GIF, and WebP images are allowed', 'error');
                return;
            }
            
            setUploadedPhoto(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleUserStatus = async (user: any) => {
        try {
            const token = localStorage.getItem('auth_token');
            const formData = new FormData();
            formData.append('is_active', (!user.is_active).toString());
            
            const response = await fetch(`${API_ENDPOINTS.users}/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                body: formData,
            });

            if (response.ok) {
                showMessage(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully.`);
                fetchUsers();
            } else {
                const data = await response.json();
                showMessage(data.error || 'Operation failed', 'error');
            }
        } catch (error: any) {
            showMessage('Error: ' + error.message, 'error');
        }
    };

    const saveUser = async () => {
        if (!params.first_name) {
            showMessage('First name is required.', 'error');
            return;
        }
        if (!params.last_name) {
            showMessage('Last name is required.', 'error');
            return;
        }
        if (!params.email) {
            showMessage('Email is required.', 'error');
            return;
        }
        if (!params.id && !params.password) {
            showMessage('Password is required for new users.', 'error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const url = params.id ? `${API_ENDPOINTS.users}/${params.id}` : API_ENDPOINTS.users;
            const method = params.id ? 'PUT' : 'POST';

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('first_name', params.first_name);
            formData.append('last_name', params.last_name);
            formData.append('email', params.email);
            formData.append('user_type', params.user_type);
            if (params.mobile_number) formData.append('mobile_number', params.mobile_number);
            if (params.date_of_birth) formData.append('date_of_birth', params.date_of_birth);
            if (params.address) formData.append('address', params.address);
            
            // Add password for new users
            if (!params.id && params.password) {
                formData.append('password', params.password);
            }
            
            // Add is_active for existing users
            if (params.id) {
                formData.append('is_active', params.is_active.toString());
            }
            
            // Add profile picture if uploaded
            if (uploadedPhoto) {
                formData.append('profile_picture', uploadedPhoto);
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                    // DON'T set Content-Type - browser will set it with boundary for FormData
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(`User has been ${params.id ? 'updated' : 'created'} successfully.`);
                setAddContactModal(false);
                fetchUsers();
                setUploadedPhoto(null);
                setPhotoPreview(null);
            } else {
                showMessage(data.error || 'Operation failed', 'error');
            }
        } catch (error: any) {
            showMessage('Error: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const editUser = (user: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        setUploadedPhoto(null);
        setPhotoPreview(null);
        
        if (user) {
            setParams({
                id: user.id,
                email: user.email,
                password: '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                user_type: user.user_type || 'patient',
                mobile_number: user.mobile_number || '',
                date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
                address: user.address || '',
                is_active: user.is_active !== false,
                profile_picture: user.profile_picture || null,
            });
        }
        setAddContactModal(true);
    };

    const deleteUser = async (user: any) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete ${user.first_name} ${user.last_name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${API_ENDPOINTS.users}/${user.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true',
                    },
                });

                if (response.ok) {
                    showMessage('User has been deleted successfully.');
                    fetchUsers();
                } else {
                    const data = await response.json();
                    showMessage(data.error || 'Delete failed', 'error');
                }
            } catch (error: any) {
                showMessage('Error: ' + error.message, 'error');
            }
        }
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    const getUserTypeBadge = (type: string) => {
        const badges: any = {
            admin: 'badge bg-danger',
            provider: 'badge bg-primary',
            patient: 'badge bg-success',
        };
        return badges[type] || 'badge bg-secondary';
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl">Users Management</h2>
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => editUser()}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add User
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${viewMode === 'list' && 'bg-primary text-white'}`} onClick={() => setViewMode('list')}>
                                <IconListCheck />
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${viewMode === 'grid' && 'bg-primary text-white'}`} onClick={() => setViewMode('grid')}>
                                <IconLayoutGrid />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search Users" 
                            className="peer form-input py-2 ltr:pr-11 rtl:pl-11" 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                        />
                        <button type="button" className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="panel mt-5 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">User Type</label>
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setPagination({ ...pagination, page: 1 });
                            }}
                            className="form-select"
                        >
                            <option value="">All Types</option>
                            <option value="admin">Admin</option>
                            <option value="provider">Provider</option>
                            <option value="patient">Patient</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Items per page</label>
                        <select
                            value={pagination.limit}
                            onChange={(e) => setPagination({ ...pagination, limit: Number(e.target.value), page: 1 })}
                            className="form-select"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={fetchUsers} className="btn btn-primary w-full">
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="panel mt-5 flex items-center justify-center p-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <span className="ml-3">Loading...</span>
                </div>
            )}

            {!loading && viewMode === 'list' && (
                <div className="panel mt-5 overflow-hidden border-0 p-0">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Type</th>
                                    <th>Mobile</th>
                                    <th>Status</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user: any, index: number) => (
                                        <tr key={user.id}>
                                            <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    {user.profile_picture ? (
                                                        <img 
                                                            src={`${BASE_URL}${user.profile_picture}`} 
                                                            alt={user.first_name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            onError={(e: any) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                                            {user.first_name?.[0]}{user.last_name?.[0]}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold">{user.first_name} {user.last_name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={getUserTypeBadge(user.user_type)}>
                                                    {user.user_type}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap">{user.mobile_number || '-'}</td>
                                            <td>
                                                <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        type="button" 
                                                        className={`btn btn-sm ${user.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                        onClick={() => toggleUserStatus(user)}
                                                        title={user.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {user.is_active ? '🔒' : '✓'}
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => editUser(user)}
                                                    >
                                                        <IconPencil className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => deleteUser(user)}
                                                    >
                                                        <IconTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t p-4">
                            <div className="text-sm">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    disabled={pagination.page === 1}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            className={`btn btn-sm ${pagination.page === pageNum ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setPagination({ ...pagination, page: pageNum })}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    disabled={pagination.page === pagination.totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!loading && viewMode === 'grid' && (
                <div className="mt-5 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {users.length === 0 ? (
                        <div className="col-span-full text-center py-8">
                            No users found
                        </div>
                    ) : (
                        users.map((user: any) => (
                            <div className="panel overflow-hidden" key={user.id}>
                                <div className="flex items-center justify-between mb-5">
                                    {user.profile_picture ? (
                                        <img 
                                            src={`${BASE_URL}${user.profile_picture}`} 
                                            alt={user.first_name}
                                            className="w-16 h-16 rounded-full object-cover"
                                            onError={(e: any) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                                            {user.first_name?.[0]}{user.last_name?.[0]}
                                        </div>
                                    )}
                                    <span className={getUserTypeBadge(user.user_type)}>
                                        {user.user_type}
                                    </span>
                                </div>
                                <h5 className="text-lg font-semibold mb-2">{user.first_name} {user.last_name}</h5>
                                <p className="text-white-dark mb-4">{user.email}</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center">
                                        <span className="font-semibold w-20">Mobile:</span>
                                        <span className="text-white-dark">{user.mobile_number || '-'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold w-20">Status:</span>
                                        <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {user.address && (
                                        <div className="flex">
                                            <span className="font-semibold w-20">Address:</span>
                                            <span className="text-white-dark flex-1">{user.address}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-5 flex gap-2">
                                    <button 
                                        type="button" 
                                        className={`btn ${user.is_active ? 'btn-outline-warning' : 'btn-outline-success'} flex-1`}
                                        onClick={() => toggleUserStatus(user)}
                                    >
                                        {user.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-primary flex-1"
                                        onClick={() => editUser(user)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-danger flex-1"
                                        onClick={() => deleteUser(user)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Transition appear show={addContactModal} as={Fragment}>
                <Dialog as="div" open={addContactModal} onClose={() => setAddContactModal(false)} className="relative z-50">
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="panel w-full max-w-2xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setAddContactModal(false)}
                                        className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {params.id ? 'Edit User' : 'Add User'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="mb-5">
                                                    <label htmlFor="first_name">First Name *</label>
                                                    <input 
                                                        id="first_name" 
                                                        type="text" 
                                                        placeholder="Enter First Name" 
                                                        className="form-input" 
                                                        value={params.first_name} 
                                                        onChange={(e) => changeValue(e)} 
                                                    />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="last_name">Last Name *</label>
                                                    <input 
                                                        id="last_name" 
                                                        type="text" 
                                                        placeholder="Enter Last Name" 
                                                        className="form-input" 
                                                        value={params.last_name} 
                                                        onChange={(e) => changeValue(e)} 
                                                    />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="email">Email *</label>
                                                    <input 
                                                        id="email" 
                                                        type="email" 
                                                        placeholder="Enter Email" 
                                                        className="form-input" 
                                                        value={params.email} 
                                                        onChange={(e) => changeValue(e)}
                                                        disabled={!!params.id}
                                                    />
                                                </div>
                                                {!params.id && (
                                                    <div className="mb-5">
                                                        <label htmlFor="password">Password *</label>
                                                        <input 
                                                            id="password" 
                                                            type="password" 
                                                            placeholder="Enter Password" 
                                                            className="form-input" 
                                                            value={params.password} 
                                                            onChange={(e) => changeValue(e)} 
                                                        />
                                                    </div>
                                                )}
                                                <div className="mb-5">
                                                    <label htmlFor="user_type">User Type *</label>
                                                    <select 
                                                        id="user_type" 
                                                        className="form-select" 
                                                        value={params.user_type} 
                                                        onChange={(e) => changeValue(e)}
                                                    >
                                                        <option value="patient">Patient</option>
                                                        <option value="provider">Provider</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="mobile_number">Mobile Number</label>
                                                    <input 
                                                        id="mobile_number" 
                                                        type="text" 
                                                        placeholder="Enter Mobile Number" 
                                                        className="form-input" 
                                                        value={params.mobile_number} 
                                                        onChange={(e) => changeValue(e)} 
                                                    />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="date_of_birth">Date of Birth</label>
                                                    <input 
                                                        id="date_of_birth" 
                                                        type="date" 
                                                        className="form-input" 
                                                        value={params.date_of_birth} 
                                                        onChange={(e) => changeValue(e)} 
                                                    />
                                                </div>
                                                {params.id && (
                                                    <div className="mb-5 flex items-center">
                                                        <label className="inline-flex cursor-pointer">
                                                            <input 
                                                                id="is_active"
                                                                type="checkbox" 
                                                                className="form-checkbox" 
                                                                checked={params.is_active}
                                                                onChange={(e) => changeValue(e)} 
                                                            />
                                                            <span className="ltr:ml-2 rtl:mr-2">Active</span>
                                                        </label>
                                                    </div>
                                                )}
                                                <div className="mb-5 col-span-2">
                                                    <label htmlFor="address">Address</label>
                                                    <textarea
                                                        id="address"
                                                        rows={3}
                                                        placeholder="Enter Address"
                                                        className="form-textarea resize-none"
                                                        value={params.address}
                                                        onChange={(e) => changeValue(e)}
                                                    ></textarea>
                                                </div>
                                                <div className="mb-5 col-span-2">
                                                    <label htmlFor="profile_picture">Profile Picture</label>
                                                    <input
                                                        id="profile_picture"
                                                        type="file"
                                                        accept="image/*"
                                                        className="form-input"
                                                        onChange={handlePhotoUpload}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        JPEG, PNG, GIF, or WebP - Max 5MB
                                                    </p>
                                                    
                                                    {/* Show preview of newly selected photo */}
                                                    {photoPreview && (
                                                        <div className="mt-3">
                                                            <p className="text-sm mb-2">New Photo Preview:</p>
                                                            <img 
                                                                src={photoPreview} 
                                                                alt="Preview" 
                                                                className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                                                            />
                                                        </div>
                                                    )}
                                                    
                                                    {/* Show existing photo if editing and no new photo selected */}
                                                    {params.profile_picture && !photoPreview && (
                                                        <div className="mt-3">
                                                            <p className="text-sm mb-2">Current Photo:</p>
                                                            <img 
                                                                src={`${BASE_URL}${params.profile_picture}`} 
                                                                alt="Current" 
                                                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-8 flex items-center justify-end gap-3">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary" onClick={saveUser} disabled={loading}>
                                                    {loading ? 'Saving...' : params.id ? 'Update' : 'Add'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ComponentsAppsContactsUsers;
