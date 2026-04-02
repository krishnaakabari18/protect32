const dashboardModel = require('../models/dashboardModel');

const dashboardController = {
    // Get all dashboard data
    getDashboard: async (req, res) => {
        try {
            const [
                statistics,
                monthlyAppointments,
                monthlyRevenue,
                recentAppointments,
                recentPatients,
                appointmentStatusBreakdown,
                topProviders,
                paymentStatusBreakdown
            ] = await Promise.all([
                dashboardModel.getStatistics(),
                dashboardModel.getMonthlyAppointments(),
                dashboardModel.getMonthlyRevenue(),
                dashboardModel.getRecentAppointments(5),
                dashboardModel.getRecentPatients(5),
                dashboardModel.getAppointmentStatusBreakdown(),
                dashboardModel.getTopProviders(5),
                dashboardModel.getPaymentStatusBreakdown()
            ]);

            res.json({
                success: true,
                data: {
                    statistics,
                    charts: {
                        monthlyAppointments,
                        monthlyRevenue
                    },
                    recent: {
                        appointments: recentAppointments,
                        patients: recentPatients
                    },
                    breakdowns: {
                        appointmentStatus: appointmentStatusBreakdown,
                        paymentStatus: paymentStatusBreakdown
                    },
                    topProviders
                }
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch dashboard data'
            });
        }
    },

    // Get statistics only
    getStatistics: async (req, res) => {
        try {
            const statistics = await dashboardModel.getStatistics();
            
            res.json({
                success: true,
                data: statistics
            });
        } catch (error) {
            console.error('Error fetching statistics:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch statistics'
            });
        }
    }
};

module.exports = dashboardController;
