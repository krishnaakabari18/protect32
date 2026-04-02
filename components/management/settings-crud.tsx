'use client';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '@/config/api.config';
import IconSettings from '@/components/icon/icon-settings';
import IconDollarSign from '@/components/icon/icon-dollar-sign';
import IconMail from '@/components/icon/icon-mail';
import IconImage from '@/components/icon/icon-image';
import IconCode from '@/components/icon/icon-code';
import IconPhone from '@/components/icon/icon-phone';
import IconSearch from '@/components/icon/icon-search-engine';

const SettingsCRUD = () => {
    const [activeTab, setActiveTab] = useState('payment');
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [settings, setSettings] = useState<any>({
        // Payment
        razorpay_key_id: '',
        razorpay_key_secret: '',
        razorpay_enabled: false,
        
        // SMTP
        smtp_mailer: 'SMTP',
        smtp_host: '',
        smtp_port: 587,
        smtp_username: '',
        smtp_password: '',
        smtp_from_address: '',
        smtp_from_name: '',
        smtp_encryption: 'TLS',
        
        // Branding
        site_logo: '',
        site_name: 'Protect32',
        favicon: '',
        
        // Footer
        footer_text: 'Copyright © 2026, All rights reserved',
        
        // Invoice
        invoice_prefix: 'INV',
        invoice_starting_number: 1,
        invoice_number_format: '[prefix]-[number]',
        
        // Analytics
        google_analytics_code: '',
        facebook_pixel_code: '',
        custom_tracking_code: '',
        
        // SMS & WhatsApp
        sms_provider: '',
        sms_api_key: '',
        sms_api_secret: '',
        sms_sender_id: '',
        sms_enabled: false,
        whatsapp_api_key: '',
        whatsapp_api_secret: '',
        whatsapp_enabled: false,
        
        // SEO
        seo_meta_title: '',
        seo_meta_description: '',
        seo_meta_keywords: '',
        seo_og_image: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(API_ENDPOINTS.settings, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setSettings(data.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(API_ENDPOINTS.settings, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify(settings),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                Swal.fire('Success', 'Settings saved successfully', 'success');
                fetchSettings();
            } else {
                Swal.fire('Error', data.error || 'Failed to save settings', 'error');
            }
        } catch (error: any) {
            Swal.fire('Error', error.message || 'Failed to save settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const testConnection = async (type: 'smtp' | 'razorpay' | 'sms') => {
        setTesting(true);
        try {
            const token = localStorage.getItem('auth_token');
            let endpoint = '';
            let body = {};

            if (type === 'smtp') {
                endpoint = `${API_ENDPOINTS.settings}/test-smtp`;
                body = {
                    smtp_host: settings.smtp_host,
                    smtp_port: settings.smtp_port,
                    smtp_username: settings.smtp_username,
                    smtp_password: settings.smtp_password,
                    smtp_from_address: settings.smtp_from_address
                };
            } else if (type === 'razorpay') {
                endpoint = `${API_ENDPOINTS.settings}/test-razorpay`;
                body = {
                    razorpay_key_id: settings.razorpay_key_id,
                    razorpay_key_secret: settings.razorpay_key_secret
                };
            } else if (type === 'sms') {
                endpoint = `${API_ENDPOINTS.settings}/test-sms`;
                body = {
                    sms_provider: settings.sms_provider,
                    sms_api_key: settings.sms_api_key,
                    sms_api_secret: settings.sms_api_secret
                };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (data.success) {
                Swal.fire('Success', data.message, 'success');
            } else {
                Swal.fire('Error', data.error || 'Connection test failed', 'error');
            }
        } catch (error: any) {
            Swal.fire('Error', error.message || 'Connection test failed', 'error');
        } finally {
            setTesting(false);
        }
    };

    const renderPaymentTab = () => (
        <div className="space-y-6">
            <div className="panel">
                <h5 className="text-lg font-semibold mb-4">Razorpay Payment Gateway</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Razorpay Key ID</label>
                        <input
                            type="text"
                            name="razorpay_key_id"
                            value={settings.razorpay_key_id}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="rzp_test_xxxxx"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Razorpay Key Secret</label>
                        <input
                            type="password"
                            name="razorpay_key_secret"
                            value={settings.razorpay_key_secret}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter secret key"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="razorpay_enabled"
                                checked={settings.razorpay_enabled}
                                onChange={handleChange}
                                className="form-checkbox"
                            />
                            <span className="ml-2">Enable Razorpay Payments</span>
                        </label>
                    </div>
                    <div className="md:col-span-2">
                        <button
                            type="button"
                            onClick={() => testConnection('razorpay')}
                            disabled={testing}
                            className="btn btn-outline-primary"
                        >
                            {testing ? 'Testing...' : 'Test Razorpay Connection'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEmailTab = () => (
        <div className="space-y-6">
            <div className="panel">
                <h5 className="text-lg font-semibold mb-4">SMTP Email Configuration</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Mailer</label>
                        <select
                            name="smtp_mailer"
                            value={settings.smtp_mailer}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="SMTP">SMTP</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Host</label>
                        <input
                            type="text"
                            name="smtp_host"
                            value={settings.smtp_host}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="smtp-relay.brevo.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Port</label>
                        <input
                            type="number"
                            name="smtp_port"
                            value={settings.smtp_port}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="587"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                            type="text"
                            name="smtp_username"
                            value={settings.smtp_username}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="your-username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            name="smtp_password"
                            value={settings.smtp_password}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">From Address</label>
                        <input
                            type="email"
                            name="smtp_from_address"
                            value={settings.smtp_from_address}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="no-reply@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">From Name</label>
                        <input
                            type="text"
                            name="smtp_from_name"
                            value={settings.smtp_from_name}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Protect32"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Encryption</label>
                        <select
                            name="smtp_encryption"
                            value={settings.smtp_encryption}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="TLS">TLS</option>
                            <option value="SSL">SSL</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <button
                            type="button"
                            onClick={() => testConnection('smtp')}
                            disabled={testing}
                            className="btn btn-outline-primary"
                        >
                            {testing ? 'Testing...' : 'Test SMTP Connection'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBrandingTab = () => (
        <div className="space-y-6">
            <div className="panel">
                <h5 className="text-lg font-semibold mb-4">Site Branding</h5>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Site Logo</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="form-input"
                        />
                        <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x800px</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Site Name</label>
                        <input
                            type="text"
                            name="site_name"
                            value={settings.site_name}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Protect32"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Favicon</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="form-input"
                        />
                    </div>
                </div>
            </div>

            <div className="panel">
                <h5 className="text-lg font-semibold mb-4">Footer</h5>
                <div>
                    <label className="block text-sm font-medium mb-1">Footer Text</label>
                    <input
                        type="text"
                        name="footer_text"
                        value={settings.footer_text}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Copyright © 2026, All rights reserved"
                    />
                </div>
            </div>
        </div>
    );

    const renderInvoiceTab = () => (
        <div className="space-y-6">
            <div className="panel">
                <h5 className="text-lg font-semibold mb-4">Invoice Settings</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Invoice Prefix</label>
                        <input
                            type="text"
                            name="invoice_prefix"
                            value={settings.invoice_prefix}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="INV"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Starting Invoice Number</label>
                        <input
                            type="number"
                            name="invoice_starting_number"
                            value={settings.invoice_starting_number}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Invoice Number Format</label>
                        <input
                            type="text"
                            name="invoice_number_format"
                            value={settings.invoice_number_format}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="[prefix]-[number]"
                        />
                        <p className="text-xs text-gray-500 mt-1">Use [prefix] and [number]</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAnalyticsTab = () => (
        <div className="space-y-6">
            <div className="panel">
                <h5 className="text-lg font-semibold mb-4">Analytics & Tracking</h5>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Google Analytics Snippet</label>
                        <textarea
                            name="google_analytics_code"
                            value={settings.google_analytics_code}
                            onChange={handleChange}
                            rows={4}
                            className="form-textarea"
                            placeholder="Paste your Google Analytics code here"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Facebook Pixel Code</label>
                        <textarea
                            name="facebook_pixel_code"
                            value={settings.facebook_pixel_code}
                            onChange={handleChange}
                            rows={4}
                            className="form-textarea"
                            placeholder="Paste your Facebook Pixel code here"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Custom Tracking Code</label>
                        <textarea
                            name="custom_tracking_code"
                            value={settings.custom_tracking_code}
                            onChange={handleChange}
                            rows={4}
                            className="form-textarea"
                            placeholder="Paste any custom tracking code here"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSMSTab = () => (
        <div className="space-y-6">
            <div className="panel">
                <h5 className="text-lg font-semibold mb-4">SMS Configuration</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">SMS Provider</label>
                        <select
                            name="sms_provider"
                            value={settings.sms_provider}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="">Select Provider</option>
                            <option value="twilio">Twilio</option>
                            <option value="msg91">MSG91</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">API Key</label>
                        <input
                            type="text"
                            name="sms_api_key"
                            value={settings.sms_api_key}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter API key"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">API Secret</label>
                        <input
                            type="password"
                            name="sms_api_secret"
                            value={settings.sms_api_secret}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter API secret"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Sender ID</label>
                        <input
                            type="text"
                            name="sms_sender_id"
                            value={settings.sms_sender_id}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="PRTCT32"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="sms_enabled"
                                checked={settings.sms_enabled}
                                onChange={handleChange}
                                className="form-checkbox"
                            />
                            <span className="ml-2">Enable SMS Notifications</span>
                        </label>
                    </div>
                    <div className="md:col-span-2">
                        <button
                            type="button"
                            onClick={() => testConnection('sms')}
                            disabled={testing}
                            className="btn btn-outline-primary"
                        >
                            {testing ? 'Testing...' : 'Test SMS Connection'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="panel">
                <h5 className="text-lg font-semibold mb-4">WhatsApp Configuration</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">WhatsApp API Key</label>
                        <input
                            type="text"
                            name="whatsapp_api_key"
                            value={settings.whatsapp_api_key}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter API key"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">WhatsApp API Secret</label>
                        <input
                            type="password"
                            name="whatsapp_api_secret"
                            value={settings.whatsapp_api_secret}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter API secret"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="whatsapp_enabled"
                                checked={settings.whatsapp_enabled}
                                onChange={handleChange}
                                className="form-checkbox"
                            />
                            <span className="ml-2">Enable WhatsApp Notifications</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSEOTab = () => (
        <div className="space-y-6">
            <div className="panel">
                <h5 className="text-lg font-semibold mb-4">SEO Settings</h5>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Meta Title</label>
                        <input
                            type="text"
                            name="seo_meta_title"
                            value={settings.seo_meta_title}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Protect32 - Dental Management System"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Meta Description</label>
                        <textarea
                            name="seo_meta_description"
                            value={settings.seo_meta_description}
                            onChange={handleChange}
                            rows={3}
                            className="form-textarea"
                            placeholder="Enter meta description"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Meta Keywords</label>
                        <input
                            type="text"
                            name="seo_meta_keywords"
                            value={settings.seo_meta_keywords}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="dental, clinic, management, system"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Open Graph Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="form-input"
                        />
                        <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x630px</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const tabs = [
        { id: 'payment', label: 'Payment', icon: <IconDollarSign /> },
        { id: 'email', label: 'Email', icon: <IconMail /> },
        { id: 'branding', label: 'Branding', icon: <IconImage /> },
        { id: 'invoice', label: 'Invoice', icon: <IconSettings /> },
        { id: 'analytics', label: 'Analytics', icon: <IconCode /> },
        { id: 'sms', label: 'SMS & WhatsApp', icon: <IconPhone /> },
        { id: 'seo', label: 'SEO', icon: <IconSearch /> },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl">System Settings</h2>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="btn btn-primary"
                >
                    {loading ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <div className="panel">
                <div className="mb-5 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            className={`flex items-center gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${
                                activeTab === tab.id ? '!border-primary text-primary' : ''
                            }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="pt-5">
                    {activeTab === 'payment' && renderPaymentTab()}
                    {activeTab === 'email' && renderEmailTab()}
                    {activeTab === 'branding' && renderBrandingTab()}
                    {activeTab === 'invoice' && renderInvoiceTab()}
                    {activeTab === 'analytics' && renderAnalyticsTab()}
                    {activeTab === 'sms' && renderSMSTab()}
                    {activeTab === 'seo' && renderSEOTab()}
                </div>
            </div>
        </div>
    );
};

export default SettingsCRUD;
