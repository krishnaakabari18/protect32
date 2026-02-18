const PatientModel = require('../models/patientModel');

class PatientController {
  static async create(req, res) {
    try {
      const patient = await PatientModel.create(req.body);
      res.status(201).json({ message: 'Patient created successfully', data: patient });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const patients = await PatientModel.findAll();
      
      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedData = patients.slice(startIndex, endIndex);
      
      res.json({ 
        data: paginatedData,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: patients.length,
          totalPages: Math.ceil(patients.length / limitNum)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const patient = await PatientModel.findById(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.json({ data: patient });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const patient = await PatientModel.update(req.params.id, req.body);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.json({ message: 'Patient updated successfully', data: patient });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async addFamilyMember(req, res) {
    try {
      const member = await PatientModel.addFamilyMember(req.params.id, req.body);
      res.status(201).json({ message: 'Family member added successfully', data: member });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getFamilyMembers(req, res) {
    try {
      const members = await PatientModel.getFamilyMembers(req.params.id);
      res.json({ data: members });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PatientController;
