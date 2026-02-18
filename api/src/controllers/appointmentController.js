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
      const { patient_id, provider_id, status, date, page = 1, limit = 10 } = req.query;
      const filters = {};
      if (patient_id) filters.patient_id = patient_id;
      if (provider_id) filters.provider_id = provider_id;
      if (status) filters.status = status;
      if (date) filters.date = date;

      const appointments = await AppointmentModel.findAll(filters);
      
      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedData = appointments.slice(startIndex, endIndex);
      
      res.json({ 
        data: paginatedData,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: appointments.length,
          totalPages: Math.ceil(appointments.length / limitNum)
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
