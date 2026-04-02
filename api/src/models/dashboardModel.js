const pool = require('../config/database');

const dashboardModel = {
    getStatistics: async () => {
        const result = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM appointments) as total_appointments,
                (SELECT COUNT(*) FROM appointments WHERE status = 'Upcoming') as pending_appointments,
                (SELECT COUNT(*) FROM appointments WHERE status = 'Completed') as completed_appointments,
                (SELECT COUNT(*) FROM appointments WHERE status = 'Cancelled') as cancelled_appointments,
                (SELECT COUNT(*) FROM appointments WHERE appointment_date >= CURRENT_DATE) as upcoming_appointments,

                (SELECT COUNT(*) FROM patients) as total_patients,
                (SELECT COUNT(*) FROM patients WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_patients_this_month,
                (SELECT COUNT(*) FROM patients WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_patients_this_week,

                (SELECT COUNT(*) FROM providers) as active_providers,

                (SELECT COUNT(*) FROM payments) as total_payments,
                (SELECT COUNT(*) FROM payments WHERE COALESCE(payment_status, status) = 'Pending') as pending_payments,
                (SELECT COUNT(*) FROM payments WHERE COALESCE(payment_status, status) IN ('Paid','Completed')) as completed_payments,
                (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE COALESCE(payment_status, status) IN ('Paid','Completed')) as total_revenue,
                (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE COALESCE(payment_status, status) = 'Pending') as pending_revenue,

                (SELECT COUNT(*) FROM treatment_plans) as total_treatment_plans,
                (SELECT COUNT(*) FROM treatment_plans WHERE status IN ('Proposed','Consented')) as active_treatment_plans,
                (SELECT COUNT(*) FROM treatment_plans WHERE status = 'Paid') as completed_treatment_plans,

                (SELECT COUNT(*) FROM prescriptions) as total_prescriptions,
                (SELECT COUNT(*) FROM prescriptions WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as prescriptions_this_month,

                (SELECT COUNT(*) FROM documents) as total_documents,

                (SELECT COUNT(*) FROM provider_reviews) as total_reviews,
                (SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) FROM provider_reviews) as average_rating,

                (SELECT COUNT(*) FROM plans WHERE is_active = true) as active_plans
        `);
        return result.rows[0];
    },

    getMonthlyAppointments: async () => {
        const result = await pool.query(`
            SELECT TO_CHAR(appointment_date, 'Mon') as month,
                   EXTRACT(MONTH FROM appointment_date) as month_num,
                   COUNT(*) as count
            FROM appointments
            WHERE appointment_date >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY month, month_num ORDER BY month_num
        `);
        return result.rows;
    },

    getMonthlyRevenue: async () => {
        const result = await pool.query(`
            SELECT TO_CHAR(payment_date, 'Mon') as month,
                   EXTRACT(MONTH FROM payment_date) as month_num,
                   COALESCE(SUM(amount), 0) as total
            FROM payments
            WHERE payment_date >= CURRENT_DATE - INTERVAL '12 months'
              AND COALESCE(payment_status, status) IN ('Paid','Completed')
            GROUP BY month, month_num ORDER BY month_num
        `);
        return result.rows;
    },

    getRecentAppointments: async (limit = 5) => {
        const result = await pool.query(`
            SELECT a.id,
                   TO_CHAR(a.appointment_date, 'YYYY-MM-DD') as appointment_date,
                   a.start_time as appointment_time,
                   a.status,
                   a.service as reason,
                   u1.first_name || ' ' || u1.last_name as patient_name,
                   COALESCE(p.full_name, u2.first_name || ' ' || u2.last_name) as provider_name
            FROM appointments a
            LEFT JOIN users u1 ON a.patient_id = u1.id
            LEFT JOIN providers p ON a.provider_id = p.id
            LEFT JOIN users u2 ON p.id = u2.id
            ORDER BY a.appointment_date DESC, a.start_time DESC
            LIMIT $1
        `, [limit]);
        return result.rows;
    },

    getRecentPatients: async (limit = 5) => {
        const result = await pool.query(`
            SELECT pat.id, u.first_name, u.last_name, u.email,
                   u.mobile_number as phone, pat.created_at
            FROM patients pat
            LEFT JOIN users u ON pat.id = u.id
            ORDER BY pat.created_at DESC
            LIMIT $1
        `, [limit]);
        return result.rows;
    },

    getAppointmentStatusBreakdown: async () => {
        const result = await pool.query(`
            SELECT status, COUNT(*) as count
            FROM appointments GROUP BY status ORDER BY count DESC
        `);
        return result.rows;
    },

    getTopProviders: async (limit = 5) => {
        const result = await pool.query(`
            SELECT p.id,
                   COALESCE(p.full_name, u.first_name || ' ' || u.last_name) as name,
                   p.specialty,
                   COUNT(a.id) as appointment_count
            FROM providers p
            LEFT JOIN users u ON p.id = u.id
            LEFT JOIN appointments a ON p.id = a.provider_id
            GROUP BY p.id, p.full_name, u.first_name, u.last_name, p.specialty
            ORDER BY appointment_count DESC
            LIMIT $1
        `, [limit]);
        return result.rows;
    },

    getPaymentStatusBreakdown: async () => {
        const result = await pool.query(`
            SELECT COALESCE(payment_status, status) as status,
                   COUNT(*) as count,
                   COALESCE(SUM(amount), 0) as total_amount
            FROM payments
            GROUP BY COALESCE(payment_status, status)
            ORDER BY count DESC
        `);
        return result.rows;
    }
};

module.exports = dashboardModel;
