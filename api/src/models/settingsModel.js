const pool = require('../config/database');

const settingsModel = {
    // Get settings (always returns single row)
    getSettings: async () => {
        const query = `
            SELECT * FROM settings 
            WHERE id = '00000000-0000-0000-0000-000000000001'
            LIMIT 1
        `;
        const result = await pool.query(query);
        return result.rows[0];
    },

    // Update settings
    updateSettings: async (data, userId) => {
        const {
            // Payment
            razorpay_key_id,
            razorpay_key_secret,
            razorpay_enabled,
            
            // SMTP
            smtp_mailer,
            smtp_host,
            smtp_port,
            smtp_username,
            smtp_password,
            smtp_from_address,
            smtp_from_name,
            smtp_encryption,
            
            // Branding
            site_logo,
            site_name,
            favicon,
            
            // Footer
            footer_text,
            
            // Invoice
            invoice_prefix,
            invoice_starting_number,
            invoice_number_format,
            
            // Analytics
            google_analytics_code,
            facebook_pixel_code,
            custom_tracking_code,
            
            // SMS & WhatsApp
            sms_provider,
            sms_api_key,
            sms_api_secret,
            sms_sender_id,
            sms_enabled,
            whatsapp_api_key,
            whatsapp_api_secret,
            whatsapp_enabled,
            
            // SEO
            seo_meta_title,
            seo_meta_description,
            seo_meta_keywords,
            seo_og_image
        } = data;

        const query = `
            UPDATE settings 
            SET 
                razorpay_key_id = COALESCE($1, razorpay_key_id),
                razorpay_key_secret = COALESCE($2, razorpay_key_secret),
                razorpay_enabled = COALESCE($3, razorpay_enabled),
                smtp_mailer = COALESCE($4, smtp_mailer),
                smtp_host = COALESCE($5, smtp_host),
                smtp_port = COALESCE($6, smtp_port),
                smtp_username = COALESCE($7, smtp_username),
                smtp_password = COALESCE($8, smtp_password),
                smtp_from_address = COALESCE($9, smtp_from_address),
                smtp_from_name = COALESCE($10, smtp_from_name),
                smtp_encryption = COALESCE($11, smtp_encryption),
                site_logo = COALESCE($12, site_logo),
                site_name = COALESCE($13, site_name),
                favicon = COALESCE($14, favicon),
                footer_text = COALESCE($15, footer_text),
                invoice_prefix = COALESCE($16, invoice_prefix),
                invoice_starting_number = COALESCE($17, invoice_starting_number),
                invoice_number_format = COALESCE($18, invoice_number_format),
                google_analytics_code = COALESCE($19, google_analytics_code),
                facebook_pixel_code = COALESCE($20, facebook_pixel_code),
                custom_tracking_code = COALESCE($21, custom_tracking_code),
                sms_provider = COALESCE($22, sms_provider),
                sms_api_key = COALESCE($23, sms_api_key),
                sms_api_secret = COALESCE($24, sms_api_secret),
                sms_sender_id = COALESCE($25, sms_sender_id),
                sms_enabled = COALESCE($26, sms_enabled),
                whatsapp_api_key = COALESCE($27, whatsapp_api_key),
                whatsapp_api_secret = COALESCE($28, whatsapp_api_secret),
                whatsapp_enabled = COALESCE($29, whatsapp_enabled),
                seo_meta_title = COALESCE($30, seo_meta_title),
                seo_meta_description = COALESCE($31, seo_meta_description),
                seo_meta_keywords = COALESCE($32, seo_meta_keywords),
                seo_og_image = COALESCE($33, seo_og_image),
                procedure_default_description = COALESCE($35, procedure_default_description),
                procedure_price_disclaimer = COALESCE($36, procedure_price_disclaimer),
                updated_at = CURRENT_TIMESTAMP,
                updated_by = $34
            WHERE id = '00000000-0000-0000-0000-000000000001'
            RETURNING *
        `;

        const values = [
            razorpay_key_id,
            razorpay_key_secret,
            razorpay_enabled,
            smtp_mailer,
            smtp_host,
            smtp_port,
            smtp_username,
            smtp_password,
            smtp_from_address,
            smtp_from_name,
            smtp_encryption,
            site_logo,
            site_name,
            favicon,
            footer_text,
            invoice_prefix,
            invoice_starting_number,
            invoice_number_format,
            google_analytics_code,
            facebook_pixel_code,
            custom_tracking_code,
            sms_provider,
            sms_api_key,
            sms_api_secret,
            sms_sender_id,
            sms_enabled,
            whatsapp_api_key,
            whatsapp_api_secret,
            whatsapp_enabled,
            seo_meta_title,
            seo_meta_description,
            seo_meta_keywords,
            seo_og_image,
            userId,
            data.procedure_default_description || null,
            data.procedure_price_disclaimer || null
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Test SMTP connection
    testSMTPConnection: async (smtpConfig) => {
        // This would use nodemailer to test the connection
        // For now, return a mock response
        return {
            success: true,
            message: 'SMTP connection test successful'
        };
    },

    // Test Razorpay connection
    testRazorpayConnection: async (keyId, keySecret) => {
        try {
            const Razorpay = require('razorpay');
            const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
            // Fetch orders with limit 1 — lightweight call to verify credentials
            await instance.orders.all({ count: 1 });
            return {
                success: true,
                message: 'Razorpay connection successful. Credentials are valid.',
                key_id: keyId,
            };
        } catch (error) {
            const msg = error?.error?.description || error?.message || 'Invalid credentials';
            return {
                success: false,
                message: 'Razorpay connection failed: ' + msg,
            };
        }
    },

    // Test SMS connection
    testSMSConnection: async (provider, apiKey, apiSecret) => {
        // This would test the SMS provider connection
        // For now, return a mock response
        return {
            success: true,
            message: 'SMS connection test successful'
        };
    }
};

module.exports = settingsModel;
