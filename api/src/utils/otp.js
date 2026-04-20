const crypto = require('crypto');

class OTPUtil {
  static generate(length = 6) {
    // In test mode, always return the test OTP
    if (process.env.OTP_TEST_MODE === 'true' && process.env.OTP_TEST_CODE) {
      console.log('🔐 TEST MODE: Using default OTP:', process.env.OTP_TEST_CODE);
      return process.env.OTP_TEST_CODE;
    }
    
    // Generate random OTP for production
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
    // Test mode: just log the OTP
    if (process.env.OTP_TEST_MODE === 'true') {
      console.log(`📱 TEST MODE - OTP for ${phoneNumber}: ${otp}`);
      return true;
    }

    // ── WhatsApp via aiadrika.in ──────────────────────────────────────────
    const instanceId   = process.env.WHATSAPP_INSTANCE_ID;
    const accessToken  = process.env.WHATSAPP_ACCESS_TOKEN;

    if (instanceId && accessToken) {
      try {
        // Strip country code prefix if present, keep last 10 digits
        const mobile = phoneNumber.replace(/\D/g, '').slice(-10);
        const message = encodeURIComponent(
          `Your OTP is *${otp}*. Valid for ${process.env.OTP_EXPIRE_MINUTES || 10} minutes. Do not share with anyone.`
        );
        const sendUrl = `https://aiadrika.in/api/send?number=91${mobile}&type=text&message=${message}&instance_id=${instanceId}&access_token=${accessToken}`;

        const fetchWithTimeout = async (url, timeout = 10000) => {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), timeout);
          try {
            const res = await fetch(url, { signal: controller.signal });
            return await res.text();
          } catch (err) {
            console.log('WhatsApp fetch error:', err.message);
            return '';
          } finally {
            clearTimeout(id);
          }
        };

        // Reconnect for stability
        await fetch(`https://aiadrika.in/api/reconnect?instance_id=${instanceId}&access_token=${accessToken}`)
          .catch(() => {});
        await new Promise(r => setTimeout(r, 1500));

        // Retry up to 3 times
        for (let i = 1; i <= 3; i++) {
          const text = await fetchWithTimeout(sendUrl);
          if (text && text.includes('remoteJid')) {
            console.log(`✅ WhatsApp OTP sent to ${mobile}`);
            return true;
          }
          if (text && text.includes('not been activated')) {
            console.error('❌ WhatsApp not connected');
            break;
          }
          if (!text || text.trim() === '') {
            await fetch(`https://aiadrika.in/api/reconnect?instance_id=${instanceId}&access_token=${accessToken}`)
              .catch(() => {});
            await new Promise(r => setTimeout(r, 2000));
          }
        }
        console.warn('⚠️ WhatsApp delivery failed, falling through');
      } catch (err) {
        console.error('WhatsApp OTP error:', err.message);
      }
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
        return true;
      } catch (error) {
        console.error('❌ SMS sending failed:', error);
      }
    }

    // Dev fallback: log OTP
    console.log(`📱 DEV MODE - OTP for ${phoneNumber}: ${otp}`);
    return true;
  }

  static async sendEmail(email, otp) {
    // Email implementation
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
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
    
    // For development: just log the OTP
    console.log(`OTP for ${email}: ${otp}`);
    return true;
  }
}

module.exports = OTPUtil;
