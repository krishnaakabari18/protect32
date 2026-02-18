const pool = require('../config/database');

class AuthModel {
  // OTP Operations
  static async createOTP(userId, mobileNumber, otpCode, purpose) {
    const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRE_MINUTES) * 60 * 1000);
    const query = `
      INSERT INTO otp_verifications (user_id, mobile_number, otp_code, purpose, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, mobileNumber, otpCode, purpose, expiresAt]);
    return result.rows[0];
  }

  static async verifyOTP(mobileNumber, otpCode, purpose) {
    const query = `
      SELECT * FROM otp_verifications 
      WHERE mobile_number = $1 AND otp_code = $2 AND purpose = $3 
      AND is_verified = false AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 1
    `;
    const result = await pool.query(query, [mobileNumber, otpCode, purpose]);
    return result.rows[0];
  }

  static async markOTPVerified(id) {
    const query = 'UPDATE otp_verifications SET is_verified = true WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async incrementOTPAttempts(id) {
    const query = 'UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Refresh Token Operations
  static async createRefreshToken(userId, token, deviceInfo, ipAddress) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const query = `
      INSERT INTO refresh_tokens (user_id, token, device_info, ip_address, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, token, deviceInfo, ipAddress, expiresAt]);
    return result.rows[0];
  }

  static async findRefreshToken(token) {
    const query = `
      SELECT * FROM refresh_tokens 
      WHERE token = $1 AND is_revoked = false AND expires_at > NOW()
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  static async revokeRefreshToken(token) {
    const query = `
      UPDATE refresh_tokens 
      SET is_revoked = true, revoked_at = NOW() 
      WHERE token = $1 
      RETURNING *
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  static async revokeAllUserTokens(userId) {
    const query = `
      UPDATE refresh_tokens 
      SET is_revoked = true, revoked_at = NOW() 
      WHERE user_id = $1 AND is_revoked = false
      RETURNING *
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Social Login
  static async findOrCreateSocialUser(provider, socialId, email, profile) {
    const field = `${provider}_id`;
    
    // Check if user exists with social ID
    let query = `SELECT * FROM users WHERE ${field} = $1`;
    let result = await pool.query(query, [socialId]);
    
    if (result.rows[0]) {
      return result.rows[0];
    }

    // Check if user exists with email
    if (email) {
      query = 'SELECT * FROM users WHERE email = $1';
      result = await pool.query(query, [email]);
      
      if (result.rows[0]) {
        // Update with social ID
        query = `UPDATE users SET ${field} = $1 WHERE id = $2 RETURNING *`;
        result = await pool.query(query, [socialId, result.rows[0].id]);
        return result.rows[0];
      }
    }

    // Create new user
    query = `
      INSERT INTO users (email, ${field}, first_name, last_name, user_type, is_verified, profile_picture)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      email || null,
      socialId,
      profile.firstName || '',
      profile.lastName || '',
      'patient',
      true,
      profile.picture || null
    ];
    result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = AuthModel;
