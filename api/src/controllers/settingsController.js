const settingsModel = require('../models/settingsModel');

const settingsController = {
    // Get settings
    getSettings: async (req, res) => {
        try {
            const settings = await settingsModel.getSettings();
            
            // Hide sensitive data in response
            if (settings) {
                const sanitizedSettings = { ...settings };
                if (sanitizedSettings.razorpay_key_secret) {
                    sanitizedSettings.razorpay_key_secret = '***********';
                }
                if (sanitizedSettings.smtp_password) {
                    sanitizedSettings.smtp_password = '***********';
                }
                if (sanitizedSettings.sms_api_secret) {
                    sanitizedSettings.sms_api_secret = '***********';
                }
                if (sanitizedSettings.whatsapp_api_secret) {
                    sanitizedSettings.whatsapp_api_secret = '***********';
                }
                
                res.json({
                    success: true,
                    data: sanitizedSettings
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: 'Settings not found'
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch settings'
            });
        }
    },

    // Update settings
    updateSettings: async (req, res) => {
        try {
            const userId = req.user.id;
            const settings = await settingsModel.updateSettings(req.body, userId);
            
            // Hide sensitive data in response
            const sanitizedSettings = { ...settings };
            if (sanitizedSettings.razorpay_key_secret) {
                sanitizedSettings.razorpay_key_secret = '***********';
            }
            if (sanitizedSettings.smtp_password) {
                sanitizedSettings.smtp_password = '***********';
            }
            if (sanitizedSettings.sms_api_secret) {
                sanitizedSettings.sms_api_secret = '***********';
            }
            if (sanitizedSettings.whatsapp_api_secret) {
                sanitizedSettings.whatsapp_api_secret = '***********';
            }
            
            res.json({
                success: true,
                message: 'Settings updated successfully',
                data: sanitizedSettings
            });
        } catch (error) {
            console.error('Error updating settings:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update settings'
            });
        }
    },

    // Test SMTP connection
    testSMTP: async (req, res) => {
        try {
            const { smtp_host, smtp_port, smtp_username, smtp_password, smtp_from_address } = req.body;
            
            if (!smtp_host || !smtp_port || !smtp_username || !smtp_password) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required SMTP configuration'
                });
            }

            const result = await settingsModel.testSMTPConnection({
                host: smtp_host,
                port: smtp_port,
                username: smtp_username,
                password: smtp_password,
                from: smtp_from_address
            });

            res.json(result);
        } catch (error) {
            console.error('Error testing SMTP:', error);
            res.status(500).json({
                success: false,
                error: 'SMTP connection test failed',
                message: error.message
            });
        }
    },

    // Test Razorpay connection
    testRazorpay: async (req, res) => {
        try {
            const { razorpay_key_id, razorpay_key_secret } = req.body;
            
            if (!razorpay_key_id || !razorpay_key_secret) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing Razorpay credentials'
                });
            }

            const result = await settingsModel.testRazorpayConnection(razorpay_key_id, razorpay_key_secret);

            res.json(result);
        } catch (error) {
            console.error('Error testing Razorpay:', error);
            res.status(500).json({
                success: false,
                error: 'Razorpay connection test failed',
                message: error.message
            });
        }
    },

    // Test SMS connection
    testSMS: async (req, res) => {
        try {
            const { sms_provider, sms_api_key, sms_api_secret } = req.body;
            
            if (!sms_provider || !sms_api_key) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing SMS configuration'
                });
            }

            const result = await settingsModel.testSMSConnection(sms_provider, sms_api_key, sms_api_secret);

            res.json(result);
        } catch (error) {
            console.error('Error testing SMS:', error);
            res.status(500).json({
                success: false,
                error: 'SMS connection test failed',
                message: error.message
            });
        }
    }
};

module.exports = settingsController;
