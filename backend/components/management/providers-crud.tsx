'use client';
import IconLayoutGrid from '@/components/icon/icon-layout-grid';
import IconListCheck from '@/components/icon/icon-list-check';
import IconSearch from '@/components/icon/icon-search';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS, BASE_URL } from '@/config/api.config';

const ProvidersCRUD = () => {
    const [addModal, setAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [providers, setProviders] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const [params, setParams] = useState<any>({
        id: null,
        user_id: '',
        specialty: '',
        experience_years: '',
        clinic_name: '',
        contact_number: '',
        location: '',
        about: '',
        clinic_photos: [],
        clinic_video_url: '',
        availability: '',
    });
    
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    useEffect(() => {
        fetchProviders();
        fetchUsers();
    }, [pagination.page, pagination.limit]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            
            // First, get all provider users
            const usersResponse = await fetch(`${API_ENDPOINTS.users}?user_type=provider&limit=1000`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            const usersData = await usersResponse.json();
            
            if (!usersResponse.ok) {
                console.error('Error fetching users:', usersData);
                return;
            }
            
            // Get all existing providers
            const providersResponse = await fetch(`${API_ENDPOINTS.providers}?limit=1000`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            
            const providersData = await providersResponse.json();
            
            if (providersResponse.ok && providersData.data) {
                // Get IDs of users who already have provider records
                const existingProviderIds = providersData.data.map((p: any) => p.id);
                
                // Filter out users who already have provider records
                const availableUsers = (usersData.data || []).filter(
                    (user: any) => !existingProviderIds.includes(user.id)
                );
                
                setUsers(availableUsers);
                console.log('Available users for provider creation:', availableUsers.length);
            } else {
                setUsers(usersData.data || []);
            }
        } catch (error: any) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            const response = await fetch(`${API_ENDPOINTS.providers}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setProviders(data.data || []);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            } else {
                showMessage(data.error || 'Failed to fetch providers', 'error');
            }
        } catch (error: any) {
            showMessage('Error fetching providers: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const searchProviders = () => {
        if (!search) {
            fetchProviders();
            return;
        }
        
        const filtered = providers.filter((provider: any) => {
            return (
                provider.specialty?.toLowerCase().includes(search.toLowerCase()) ||
                provider.clinic_name?.toLowerCase().includes(search.toLowerCase()) ||
                provider.first_name?.toLowerCase().includes(search.toLowerCase()) ||
                provider.last_name?.toLowerCase().includes(search.toLowerCase())
            );
        });
        
        setProviders(filtered);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            searchProviders();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const changeValue = (e: any) => {
        const { value, id, type, checked } = e.target;
        setParams({ ...params, [id]: type === 'checkbox' ? checked : value });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setUploadedPhotos(files);
        }
    };

    const validateForm = () => {
        if (!params.user_id) {
            showMessage('Please select a provider', 'error');
            return false;
        }
        if (!params.specialty) {
            showMessage('Specialty is required', 'error');
            return false;
        }
        if (!params.clinic_name) {
            showMessage('Clinic name is required', 'error');
            return false;
        }
        if (!params.contact_number) {
            showMessage('Contact number is required', 'error');
            return false;
        }
        if (!params.location) {
            showMessage('Location is required', 'error');
            return false;
        }
        return true;
    };

    const saveProvider = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('id', params.user_id);
            formData.append('specialty', params.specialty);
            formData.append('experience_years', params.experience_years || '0');
            formData.append('clinic_name', params.clinic_name);
            formData.append('contact_number', params.contact_number);
            formData.append('location', params.location);
            if (params.about) formData.append('about', params.about);
            if (params.clinic_video_url) formData.append('clinic_video_url', params.clinic_video_url);
            if (params.availability) formData.append('availability', params.availability);
            
            // Add photos
            uploadedPhotos.forEach((photo) => {
                formData.append('clinic_photos', photo);
            });

            const url = params.id ? `${API_ENDPOINTS.providers}/${params.id}` : API_ENDPOINTS.providers;
            const method = params.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(`Provider has been ${params.id ? 'updated' : 'created'} successfully.`);
                setAddModal(false);
                fetchProviders();
                fetchUsers(); // Refresh the users list to remove the newly created provider
                setUploadedPhotos([]);
            } else {
                showMessage(data.error || 'Operation failed', 'error');
            }
        } catch (error: any) {
            showMessage('Error: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (mode: 'create' | 'edit' | 'view', provider: any = null) => {
        setModalMode(mode);
        
        // Refresh users list when opening create modal
        if (mode === 'create') {
            fetchUsers();
        }
        
        if (provider) {
            setParams({
                id: provider.id,
                user_id: provider.id,
                specialty: provider.specialty || '',
                experience_years: provider.experience_years || '',
                clinic_name: provider.clinic_name || '',
                contact_number: provider.contact_number || '',
                location: provider.location || '',
                about: provider.about || '',
                clinic_photos: provider.clinic_photos || [],
                clinic_video_url: provider.clinic_video_url || '',
                availability: provider.availability || '',
            });
        } else {
            setParams({
                id: null,
                user_id: '',
                specialty: '',
                experience_years: '',
                clinic_name: '',
                contact_number: '',
                location: '',
                about: '',
                clinic_photos: [],
                clinic_video_url: '',
                availability: '',
            });
        }
        setUploadedPhotos([]);
        setAddModal(true);
    };

    const deleteProvider = async (provider: any) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete this provider?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${API_ENDPOINTS.providers}/${provider.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true',
                    },
                });

                if (response.ok) {
                    showMessage('Provider has been deleted successfully.');
                    fetchProviders();
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

    const getUserName = (userId: string) => {
        const user = users.find(u => u.id === userId);
        return user ? `${user.first_name} ${user.last_name}` : userId;
    };

    const isYouTubeUrl = (url: string) => {
        if (!url) return false;
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getYouTubeEmbedUrl = (url: string) => {
        if (!url) return '';
        if (url.includes('embed/')) return url;
        const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        return `https://www.youtube.com/embed/${videoId}`;
    };

    const openPhotoModal = (photo: string) => {
        setSelectedPhoto(photo);
        setPhotoModalOpen(true);
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl">Providers</h2>
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => openModal('create')}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Provider
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
                            placeholder="Search Providers"
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
                        <button onClick={fetchProviders} className="btn btn-primary w-full">
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
                                    <th>Provider Name</th>
                                    <th>Specialty</th>
                                    <th>Clinic Name</th>
                                    <th>Experience (Years)</th>
                                    <th>Location</th>
                                    <th>Created</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {providers.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-8">
                                            No providers found
                                        </td>
                                    </tr>
                                ) : (
                                    providers.map((provider: any, index: number) => (
                                        <tr key={provider.id}>
                                            <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                                            <td>
                                                {provider.first_name && provider.last_name 
                                                    ? `${provider.first_name} ${provider.last_name}`
                                                    : getUserName(provider.id)}
                                            </td>
                                            <td>{provider.specialty || '-'}</td>
                                            <td>{provider.clinic_name || '-'}</td>
                                            <td>{provider.experience_years || '-'}</td>
                                            <td>{provider.location || '-'}</td>
                                            <td>{provider.created_at ? new Date(provider.created_at).toLocaleDateString() : '-'}</td>
                                            <td>
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-outline-info"
                                                        onClick={() => openModal('view', provider)}
                                                    >
                                                        <IconEye className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => openModal('edit', provider)}
                                                    >
                                                        <IconPencil className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => deleteProvider(provider)}
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

            {/* Modal */}
            <Transition appear show={addModal} as={Fragment}>
                <Dialog as="div" open={addModal} onClose={() => setAddModal(false)} className="relative z-50">
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
                                <DialogPanel className="panel w-full max-w-3xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setAddModal(false)}
                                        className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {modalMode === 'create' ? 'Add Provider' : modalMode === 'edit' ? 'Edit Provider' : 'View Provider'}
                                    </div>
                                    <div className="p-5">
                                        {modalMode === 'view' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name</label>
                                                    <p className="text-gray-900 dark:text-white">{getUserName(params.user_id)}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                                                    <p className="text-gray-900 dark:text-white">{params.specialty || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                                                    <p className="text-gray-900 dark:text-white">{params.clinic_name || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                                                    <p className="text-gray-900 dark:text-white">{params.experience_years || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                                    <p className="text-gray-900 dark:text-white">{params.contact_number || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                                    <p className="text-gray-900 dark:text-white">{params.location || '-'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                                                    <p className="text-gray-900 dark:text-white">{params.about || '-'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                                                    <p className="text-gray-900 dark:text-white">{params.availability || '-'}</p>
                                                </div>
                                                
                                                {/* Clinic Photos */}
                                                {params.clinic_photos && params.clinic_photos.length > 0 && (
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Photos</label>
                                                        <div className="grid grid-cols-4 gap-3">
                                                            {params.clinic_photos.map((photo: string, index: number) => (
                                                                <div key={index} className="relative group">
                                                                    <img 
                                                                        src={`${BASE_URL}/${photo}`} 
                                                                        alt={`Clinic ${index + 1}`}
                                                                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity border-2 border-gray-200 hover:border-primary"
                                                                        onClick={() => openPhotoModal(photo)}
                                                                    />
                                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                                                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                                                                            Click to view
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Clinic Video */}
                                                {params.clinic_video_url && (
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Video</label>
                                                        {isYouTubeUrl(params.clinic_video_url) ? (
                                                            <div className="relative" style={{ paddingBottom: '56.25%' }}>
                                                                <iframe
                                                                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                                                                    src={getYouTubeEmbedUrl(params.clinic_video_url)}
                                                                    frameBorder="0"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                ></iframe>
                                                            </div>
                                                        ) : (
                                                            <video 
                                                                controls 
                                                                className="w-full rounded-lg"
                                                                src={params.clinic_video_url}
                                                            >
                                                                Your browser does not support the video tag.
                                                            </video>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <form>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="mb-5">
                                                        <label htmlFor="user_id">Select Provider *</label>
                                                        <select
                                                            id="user_id"
                                                            className="form-select"
                                                            value={params.user_id}
                                                            onChange={changeValue}
                                                            disabled={modalMode === 'edit'}
                                                        >
                                                            <option value="">Select Provider</option>
                                                            {users.map(user => (
                                                                <option key={user.id} value={user.id}>
                                                                    {user.first_name} {user.last_name} ({user.email})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="specialty">Specialty *</label>
                                                        <input
                                                            id="specialty"
                                                            type="text"
                                                            placeholder="e.g., Orthodontist"
                                                            className="form-input"
                                                            value={params.specialty}
                                                            onChange={changeValue}
                                                        />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="clinic_name">Clinic Name *</label>
                                                        <input
                                                            id="clinic_name"
                                                            type="text"
                                                            placeholder="Enter clinic name"
                                                            className="form-input"
                                                            value={params.clinic_name}
                                                            onChange={changeValue}
                                                        />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="experience_years">Years of Experience</label>
                                                        <input
                                                            id="experience_years"
                                                            type="number"
                                                            placeholder="Enter years"
                                                            className="form-input"
                                                            value={params.experience_years}
                                                            onChange={changeValue}
                                                        />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="contact_number">Contact Number *</label>
                                                        <input
                                                            id="contact_number"
                                                            type="text"
                                                            placeholder="Enter contact number"
                                                            className="form-input"
                                                            value={params.contact_number}
                                                            onChange={changeValue}
                                                        />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="location">Location *</label>
                                                        <input
                                                            id="location"
                                                            type="text"
                                                            placeholder="Enter location"
                                                            className="form-input"
                                                            value={params.location}
                                                            onChange={changeValue}
                                                        />
                                                    </div>
                                                    <div className="mb-5 col-span-2">
                                                        <label htmlFor="about">About</label>
                                                        <textarea
                                                            id="about"
                                                            rows={3}
                                                            placeholder="Enter about information"
                                                            className="form-textarea resize-none"
                                                            value={params.about}
                                                            onChange={changeValue}
                                                        />
                                                    </div>
                                                    <div className="mb-5 col-span-2">
                                                        <label htmlFor="clinic_video_url">Clinic Video URL</label>
                                                        <input
                                                            id="clinic_video_url"
                                                            type="url"
                                                            placeholder="https://youtube.com/..."
                                                            className="form-input"
                                                            value={params.clinic_video_url}
                                                            onChange={changeValue}
                                                        />
                                                    </div>
                                                    <div className="mb-5 col-span-2">
                                                        <label htmlFor="clinic_photos">Clinic Photos</label>
                                                        <input
                                                            id="clinic_photos"
                                                            type="file"
                                                            multiple
                                                            accept="image/*"
                                                            className="form-input"
                                                            onChange={handlePhotoUpload}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Photos will be organized in: uploads/provider/YYYY/MM/DD/
                                                        </p>
                                                        {uploadedPhotos.length > 0 && (
                                                            <div className="mt-2">
                                                                <p className="text-sm">Selected: {uploadedPhotos.length} photo(s)</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-8 flex items-center justify-end gap-3">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddModal(false)}>
                                                        Cancel
                                                    </button>
                                                    <button type="button" className="btn btn-primary" onClick={saveProvider} disabled={loading}>
                                                        {loading ? 'Saving...' : modalMode === 'create' ? 'Add' : 'Update'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Photo Lightbox Modal */}
            <Transition appear show={photoModalOpen} as={Fragment}>
                <Dialog as="div" open={photoModalOpen} onClose={() => setPhotoModalOpen(false)} className="relative z-[60]">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/90" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="relative max-w-5xl">
                                    <button
                                        onClick={() => setPhotoModalOpen(false)}
                                        className="absolute -top-12 right-0 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition-colors"
                                        title="Close"
                                    >
                                        <IconX className="w-6 h-6" />
                                    </button>
                                    {selectedPhoto && (
                                        <img 
                                            src={`${BASE_URL}/${selectedPhoto}`} 
                                            alt="Clinic"
                                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                                        />
                                    )}
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ProvidersCRUD;
