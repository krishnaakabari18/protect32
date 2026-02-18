const crypto = require('crypto');

class OTPUtil {
  static generate(length = 6) {
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
    // Twilio implementation
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        
        await client.messages.create({
          body: `Your OTP is: ${otp}. Valid for ${process.env.OTP_EXPIRE_MINUTES} minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        });
        return true;
      } catch (error) {
        console.error('SMS sending failed:', error);
        return false;
      }
    }
    
    // For development: just log the OTP
    console.log(`OTP for ${phoneNumber}: ${otp}`);
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
