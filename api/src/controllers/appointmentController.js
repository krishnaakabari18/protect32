const AppointmentModel = require('../models/appointmentModel');

class AppointmentController {
  static async createAppointment(req, res) {
    try {
      const appointment = await AppointmentModel.create(req.body);
      res.status(201).json({ message: 'Appointment created successfully', data: appointment });
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
      if (status) filters.status = status;
      if (date) filters.date = date;
      if (from_date) filters.from_date = from_date;
      if (to_date) filters.to_date = to_date;
      if (search) filters.search = search;
      filters.page  = page;
      filters.limit = limit;

      const { rows, total } = await AppointmentModel.findAll(filters);

      const pageNum  = parseInt(page);
      const limitNum = parseInt(limit);

      res.json({
        data: rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAppointmentById(req, res) {
    try {
      const appointment = await AppointmentModel.findById(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.json({ data: appointment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateAppointment(req, res) {
    try {
      const appointment = await AppointmentModel.update(req.params.id, req.body);
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.json({ message: 'Appointment updated successfully', data: appointment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteAppointment(req, res) {
    try {
      const appointment = await AppointmentModel.delete(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AppointmentController;
