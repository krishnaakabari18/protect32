const express = require('express');
const router = express.Router();

// Import all v1 routes
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const providerRoutes = require('./providerRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const planRoutes = require('./planRoutes');
const patientRoutes = require('./patientRoutes');
const paymentRoutes = require('./paymentRoutes');
const prescriptionRoutes = require('./prescriptionRoutes');
const notificationRoutes = require('./notificationRoutes');
const chatRoutes = require('./chatRoutes');
const documentRoutes = require('./documentRoutes');
const reviewRoutes = require('./reviewRoutes');
const treatmentPlanRoutes = require('./treatmentPlanRoutes');
const providerFeeRoutes = require('./providerFeeRoutes');
const procedureRoutes = require('./procedureRoutes');
const specialtyRoutes = require('./specialtyRoutes');
const supportTicketRoutes = require('./supportTicketRoutes');
const patientEducationRoutes = require('./patientEducationRoutes');
const educationImageRoutes = require('./educationImageRoutes');
const planFeatureRoutes = require('./planFeatureRoutes');
const cmsPageRoutes = require('./cmsPageRoutes');
const faqRoutes = require('./faqRoutes');
const statesCitiesRoutes = require('./statesCitiesRoutes');
const menuRoutes = require('./menuRoutes');
const dropdownRoutes = require('./dropdownRoutes');
const settingsRoutes = require('./settingsRoutes');
const dashboardRoutes = require('./dashboardRoutes');


// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/providers', providerRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/plans', planRoutes);
router.use('/patients', patientRoutes);
router.use('/payments', paymentRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chat', chatRoutes);
router.use('/documents', documentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/treatment-plans', treatmentPlanRoutes);
router.use('/provider-fees', providerFeeRoutes);
router.use('/procedures', procedureRoutes);
router.use('/specialties', specialtyRoutes);
router.use('/support-tickets', supportTicketRoutes);
router.use('/patient-education', patientEducationRoutes);
router.use('/education-images', educationImageRoutes);
router.use('/plan-features', planFeatureRoutes);
router.use('/cms-pages', cmsPageRoutes);
router.use('/faqs', faqRoutes);
router.use('/states-cities', statesCitiesRoutes);
router.use('/menus', menuRoutes);
router.use('/dropdowns', dropdownRoutes);
router.use('/settings', settingsRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
