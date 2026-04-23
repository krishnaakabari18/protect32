const AppointmentModel = require('../models/appointmentModel');
const pool = require('../config/database');

class AppointmentController {

  static async createAppointment(req, res) {
    try {
      const appointmentData = { ...req.body };
      const paymentMethod = appointmentData.payment_method || 'cash';
      const { patient_id, provider_id, appointment_date, start_time, end_time } = appointmentData;

      if (!patient_id || !provider_id || !appointment_date || !start_time || !end_time) {
        return res.status(400).json({ error: 'patient_id, provider_id, appointment_date, start_time, end_time are required' });
      }

      const amount = parseFloat(appointmentData.estimated_cost ?? appointmentData.amount ?? 0) || 0;
      if (isNaN(amount) || amount < 0) {
        return res.status(400).json({ error: 'Amount must be a valid number (0 or greater).' });
      }

      const patientCheck = await pool.query('SELECT id FROM patients WHERE id = $1', [patient_id]);
      if (!patientCheck.rows[0]) {
        return res.status(400).json({ error: 'Selected patient does not have a patient profile. Please complete patient registration first.' });
      }

      const providerCheck = await pool.query('SELECT id FROM providers WHERE id = $1', [provider_id]);
      if (!providerCheck.rows[0]) {
        return res.status(400).json({ error: 'Selected provider does not have a provider profile. Please complete provider registration first.' });
      }

      if (paymentMethod === 'cash') {
        appointmentData.payment_status = 'pending';
        appointmentData.is_paid = false;
      }

      const appointment = await AppointmentModel.create(appointmentData);

      if (paymentMethod === 'cash') {
        await pool.query(
          'INSERT INTO payments (patient_id, provider_id, appointment_id, amount, payment_method, payment_status, is_paid, payment_date) VALUES ($1,$2,$3,$4,$5,$6,false,NOW())',
          [appointment.patient_id, appointment.provider_id, appointment.id, amount, 'cash', 'pending']
        );
      }

      res.status(201).json({ success: true, message: 'Appointment created successfully', data: appointment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  static async getAllAppointments(req, res) {
    try {
      const { patient_id, provider_id, status, date, from_date, to_date, search, page = 1, limit = 10 } = req.query;
      const filters = {};
      if (patient_id) filters.patient_id = patient_id;
      if (provider_id) filters.provider_id = provider_id;
      if (status)     filters.status = status;
      if (date)       filters.date = date;
      if (from_date)  filters.from_date = from_date;
      if (to_date)    filters.to_date = to_date;
      if (search)     filters.search = search;
      filters.page  = page;
      filters.limit = limit;

      const { rows, total } = await AppointmentModel.findAll(filters);
      const pageNum = parseInt(page), limitNum = parseInt(limit);

      res.json({
        data: rows,
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAppointmentById(req, res) {
    try {
      const appointment = await AppointmentModel.findById(req.params.id);
      if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

      // For cash: also fetch payment record
      let paymentRecord = null;
      if (appointment.payment_method === 'cash') {
        const pr = await pool.query(
          `SELECT id, amount, payment_status, is_paid, payment_date, received_at
           FROM payments WHERE appointment_id = $1 LIMIT 1`,
          [req.params.id]
        );
        paymentRecord = pr.rows[0] || null;
      }

      res.json({ data: { ...appointment, payment_record: paymentRecord } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateAppointment(req, res) {
    try {
      const appointment = await AppointmentModel.update(req.params.id, req.body);
      if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

      const payMethod = appointment.payment_method || 'cash';

      // When appointment is COMPLETED → update payment status
      if (req.body.status === 'Completed') {
        if (payMethod === 'cash') {
          // Cash: update payments table → PAID + update appointment payment_status
          await pool.query(
            `UPDATE payments SET payment_status='paid', is_paid=true, received_at=NOW()
             WHERE appointment_id=$1`,
            [req.params.id]
          );
          await pool.query(
            `UPDATE appointments SET payment_status='paid', is_paid=true WHERE id=$1`,
            [req.params.id]
          );
        } else if (payMethod === 'online') {
          // Online: payment already done — just sync appointment payment_status
          await pool.query(
            `UPDATE appointments SET payment_status='paid', is_paid=true WHERE id=$1`,
            [req.params.id]
          );
        }
      }

      res.json({ success: true, message: 'Appointment updated successfully', data: appointment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteAppointment(req, res) {
    try {
      const appointment = await AppointmentModel.delete(req.params.id);
      if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
      res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AppointmentController;
