const crypto = require('crypto'); // eslint-disable-line

class OTPUtil {
  static generate(length = 6) {
    if (process.env.OTP_TEST_MODE === 'true' && process.env.OTP_TEST_CODE) {
      return process.env.OTP_TEST_CODE;
    }
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  static getExpiryTime(minutes = 10) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  static async sendSMS(phoneNumber, otp) {
    if (process.env.OTP_TEST_MODE === 'true') {
      console.log(`📱 TEST MODE - OTP for ${phoneNumber}: ${otp}`);
      return { success: true, logs: [{ step: 'test_mode', response: 'skipped' }] };
    }

    // ── WhatsApp via aiadrika.in ──────────────────────────────────────────
    // Load from DB settings first, fall back to .env
    let instanceId  = process.env.WHATSAPP_INSTANCE_ID;
    let accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    let apiBaseUrl  = 'https://aiadrika.in/api';

    try {
      const pool = require('../config/database');
      const sr = await pool.query(
        'SELECT whatsapp_instance_id, whatsapp_access_token, whatsapp_api_url, whatsapp_enabled FROM settings LIMIT 1'
      );
      const s = sr.rows[0];
      if (s?.whatsapp_enabled === false) {
        console.log('[WhatsApp] Disabled in settings — skipping');
      } else {
        if (s?.whatsapp_instance_id) instanceId  = s.whatsapp_instance_id;
        if (s?.whatsapp_access_token) accessToken = s.whatsapp_access_token;
        if (s?.whatsapp_api_url)      apiBaseUrl  = s.whatsapp_api_url.replace(/\/+$/, '');
      }
    } catch (e) {
      console.warn('[WhatsApp] Could not load settings from DB, using .env:', e.message);
    }

    if (instanceId && accessToken) {
      //const mobile = phoneNumber.replace(/\D/g, '').slice(-10);
      let mobile = phoneNumber;
	    mobile = mobile.replace(/^\+/, ''); // better: remove only leading +
      const message = encodeURIComponent(
        `Your OTP is *${otp}*. Valid for ${process.env.OTP_EXPIRE_MINUTES || 10} minutes. Do not share with anyone.`
      );
      const sendUrl = `${apiBaseUrl}/send?number=${mobile}&type=text&message=${message}&instance_id=${instanceId}&access_token=${accessToken}`;
      const logs = [];

      const fetchText = async (url, timeout = 12000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
          const res = await fetch(url, { signal: controller.signal });
          return await res.text();
        } catch (err) {
          return '';
        } finally {
          clearTimeout(id);
        }
      };

      // Success: {"status":"success","message":{"key":{"remoteJid":"..."},"status":"SUCCESS"}}
      const isSuccess = (text) => {
        if (!text) return false;
        try {
          const json = JSON.parse(text);
          return (
            json.status === 'success' &&
            (
              (json.message?.key?.remoteJid) ||
              (json.message?.status === 'SUCCESS') ||
              (typeof json.message === 'string' && json.message === 'success')
            )
          );
        } catch {
          return text.includes('remoteJid') || text.includes('"SUCCESS"');
        }
      };

      const isInvalidated = (text) =>
        text && (text.includes('Invalidated') || text.includes('logged out'));

      // Send with up to 3 retries
      for (let i = 1; i <= 3; i++) {
        const text = await fetchText(sendUrl);
        logs.push({ step: `send_attempt_${i}`, response: text });
        console.log(`[WhatsApp] send attempt ${i} → ${text}`);

        if (isSuccess(text)) {
          console.log(`✅ WhatsApp OTP sent to ${mobile}`);
          return { success: true, logs };
        }

        if (isInvalidated(text)) {
          console.error('❌ WhatsApp instance not connected — scan QR at aiadrika.in');
          return { success: false, reason: 'instance_invalidated', logs };
        }

        if (text && text.includes('not been activated')) {
          console.error('❌ WhatsApp not activated');
          return { success: false, reason: 'not_activated', logs };
        }

        // Wait before retry
        if (i < 3) await new Promise(r => setTimeout(r, 2000));
      }

      console.warn('⚠️ WhatsApp delivery failed after 3 attempts');
      return { success: false, reason: 'max_retries', logs };
    }

    // ── Twilio fallback ───────────────────────────────────────────────────
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `Your OTP is: ${otp}. Valid for ${process.env.OTP_EXPIRE_MINUTES} minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber,
        });
        console.log(`✅ SMS sent to ${phoneNumber}`);
        return { success: true, logs: [{ step: 'twilio', response: 'sent' }] };
      } catch (error) {
        console.error('❌ SMS sending failed:', error);
      }
    }

    // Final fallback — log to console
    console.log(`📱 OTP FALLBACK - OTP for ${phoneNumber}: ${otp} (WhatsApp not connected)`);
    return { success: false, reason: 'no_provider', logs: [] };
  }

  static async sendEmail(email, otp) {
    try {
      const nodemailer = require('nodemailer');
      const pool = require('../config/database');

      // Load SMTP config from settings table (DB-driven)
      const settingsRow = await pool.query(
        'SELECT smtp_host, smtp_port, smtp_username, smtp_password, smtp_from_address, smtp_from_name, smtp_encryption FROM settings LIMIT 1'
      );
      const s = settingsRow.rows[0];

      // Fall back to .env if DB config not set
      const host       = s?.smtp_host       || process.env.EMAIL_HOST;
      const port       = parseInt(s?.smtp_port || process.env.EMAIL_PORT || 587);
      const user       = s?.smtp_username    || process.env.EMAIL_USER;
      const pass       = s?.smtp_password    || process.env.EMAIL_PASS;
      const fromAddr   = s?.smtp_from_address || user;
      const fromName   = s?.smtp_from_name   || 'Protect32';
      const encryption = (s?.smtp_encryption || 'TLS').toUpperCase();

      if (!host || !user || !pass) {
        console.warn('[Email] SMTP not configured — skipping email OTP');
        return false;
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: encryption === 'SSL' || port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });

      const expiry = process.env.OTP_EXPIRE_MINUTES || 10;

      await transporter.sendMail({
        from: `"${fromName}" <${fromAddr}>`,
        to: email,
        subject: 'Your OTP Code - Protect32',
        text: `Your OTP is: ${otp}. Valid for ${expiry} minutes. Do not share with anyone.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
            <h2 style="color:#4361ee;margin-bottom:8px;">Protect32</h2>
            <p style="color:#374151;font-size:15px;">Your One-Time Password (OTP) is:</p>
            <div style="background:#f3f4f6;border-radius:6px;padding:16px 24px;text-align:center;margin:16px 0;">
              <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#111827;">${otp}</span>
            </div>
            <p style="color:#6b7280;font-size:13px;">Valid for <strong>${expiry} minutes</strong>. Do not share this OTP with anyone.</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
            <p style="color:#9ca3af;font-size:12px;">If you did not request this OTP, please ignore this email.</p>
          </div>
        `,
      });

      console.log(`✅ Email OTP sent to ${email}`);
      return true;
    } catch (error) {
      console.error('[Email] OTP send failed:', error.message);
      return false;
    }
  }
}

module.exports = OTPUtil;
