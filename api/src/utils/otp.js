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
    const instanceId  = process.env.WHATSAPP_INSTANCE_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (instanceId && accessToken) {
      //const mobile = phoneNumber.replace(/\D/g, '').slice(-10);
      let mobile = phoneNumber;
	    mobile = mobile.replace(/^\+/, ''); // better: remove only leading +
      const message = encodeURIComponent(
        `Your OTP is *${otp}*. Valid for ${process.env.OTP_EXPIRE_MINUTES || 10} minutes. Do not share with anyone.`
      );
      const sendUrl = `https://aiadrika.in/api/send?number=${mobile}&type=text&message=${message}&instance_id=${instanceId}&access_token=${accessToken}`;
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
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: false,
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your OTP Code',
          text: `Your OTP is: ${otp}. Valid for ${process.env.OTP_EXPIRE_MINUTES} minutes.`,
          html: `<p>Your OTP is: <strong>${otp}</strong></p><p>Valid for ${process.env.OTP_EXPIRE_MINUTES} minutes.</p>`
        });
        return true;
      } catch (error) {
        console.error('Email sending failed:', error);
        return false;
      }
    }
    console.log(`OTP for ${email}: ${otp}`);
    return true;
  }
}

module.exports = OTPUtil;
