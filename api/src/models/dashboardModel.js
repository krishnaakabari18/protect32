const pool = require('../config/database');

const dashboardModel = {
    // Get dashboard statistics
    getStatistics: async () => {
        const query = `
            SELECT 
                -- Total Appointments
                (SELECT COUNT(*) FROM appointments) as total_appointments,
                (SELECT COUNT(*) FROM appointments WHERE status = 'Scheduled') as pending_appointments,
                (SELECT COUNT(*) FROM appointments WHERE status = 'Completed') as completed_appointments,
                (SELECT COUNT(*) FROM appointments WHERE status = 'Cancelled') as cancelled_appointments,
                (SELECT COUNT(*) FROM appointments WHERE appointment_date >= CURRENT_DATE) as upcoming_appointments,
                
                -- Total Patients
                (SELECT COUNT(*) FROM patients) as total_patients,
                (SELECT COUNT(*) FROM patients WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_patients_this_month,
                (SELECT COUNT(*) FROM patients WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_patients_this_week,
                
                -- Total Providers
                (SELECT COUNT(*) FROM providers WHERE status = 'Active') as active_providers,
                
                -- Total Payments/Settlements
                (SELECT COUNT(*) FROM payments) as total_payments,
                (SELECT COUNT(*) FROM payments WHERE status = 'Pending') as pending_payments,
                (SELECT COUNT(*) FROM payments WHERE status = 'Completed') as completed_payments,
                (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'Completed') as total_revenue,
                (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'Pending') as pending_revenue,
                
                -- Total Treatment Plans
                (SELECT COUNT(*) FROM treatment_plans) as total_treatment_plans,
                (SELECT COUNT(*) FROM treatment_plans WHERE status = 'Active') as active_treatment_plans,
                (SELECT COUNT(*) FROM treatment_plans WHERE status = 'Completed') as completed_treatment_plans,
                
                -- Total Prescriptions
                (SELECT COUNT(*) FROM prescriptions) as total_prescriptions,
                (SELECT COUNT(*) FROM prescriptions WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as prescriptions_this_month,
                
                -- Total Documents
                (SELECT COUNT(*) FROM documents) as total_documents,
                
                -- Total Reviews
                (SELECT COUNT(*) FROM reviews) as total_reviews,
                (SELECT COALESCE(AVG(rating), 0) FROM reviews) as average_rating,
                
                -- Total Plans
                (SELECT COUNT(*) FROM plans WHERE is_active = true) as active_plans
        `;
        
        const result = await pool.query(query);
        return result.rows[0];
    },

    // Get monthly appointments data for chart
    getMonthlyAppointments: async () => {
        const query = `
            SELECT 
                TO_CHAR(appointment_date, 'Mon') as month,
                EXTRACT(MONTH FROM appointment_date) as month_num,
                COUNT(*) as count
            FROM appointments
            WHERE appointment_date >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY month, month_num
            ORDER BY month_num
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    // Get monthly revenue data for chart
    getMonthlyRevenue: async () => {
        const query = `
            SELECT 
                TO_CHAR(payment_date, 'Mon') as month,
                EXTRACT(MONTH FROM payment_date) as month_num,
                COALESCE(SUM(amount), 0) as total
            FROM payments
            WHERE payment_date >= CURRENT_DATE - INTERVAL '12 months'
            AND status = 'Completed'
            GROUP BY month, month_num
            ORDER BY month_num
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    // Get recent appointments
    getRecentAppointments: async (limit = 5) => {
        const query = `
            SELECT 
                a.id,
                a.appointment_date,
                a.appointment_time,
                a.status,
                a.reason,
                p.first_name || ' ' || p.last_name as patient_name,
                pr.first_name || ' ' || pr.last_name as provider_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN providers pr ON a.provider_id = pr.id
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
            LIMIT $1
        `;
        
        const result = await pool.query(query, [limit]);
        return result.rows;
    },

    // Get recent patients
    getRecentPatients: async (limit = 5) => {
        const query = `
            SELECT 
                id,
                first_name,
                last_name,
                email,
                phone,
                created_at
            FROM patients
            ORDER BY created_at DESC
            LIMIT $1
        `;
        
        const result = await pool.query(query, [limit]);
        return result.rows;
    },

    // Get appointment status breakdown
    getAppointmentStatusBreakdown: async () => {
        const query = `
            SELECT 
                status,
                COUNT(*) as count
            FROM appointments
            GROUP BY status
            ORDER BY count DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    // Get top providers by appointments
    getTopProviders: async (limit = 5) => {
        const query = `
            SELECT 
                pr.id,
                pr.first_name || ' ' || pr.last_name as name,
                pr.specialization,
                COUNT(a.id) as appointment_count
            FROM providers pr
            LEFT JOIN appointments a ON pr.id = a.provider_id
            WHERE pr.status = 'Active'
            GROUP BY pr.id, pr.first_name, pr.last_name, pr.specialization
            ORDER BY appointment_count DESC
            LIMIT $1
        `;
        
        const result = await pool.query(query, [limit]);
        return result.rows;
    },

    // Get payment status breakdown
    getPaymentStatusBreakdown: async () => {
        const query = `
            SELECT 
                status,
                COUNT(*) as count,
                COALESCE(SUM(amount), 0) as total_amount
            FROM payments
            GROUP BY status
            ORDER BY count DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }
};

module.exports = dashboardModel;
