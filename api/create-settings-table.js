const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'dentist_newdb',
    user: process.env.DB_USER || 'dentist',
    password: process.env.DB_PASS || 'dentist@345'
});

async function createSettingsTable() {
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, 'database', 'create-settings-table.sql'),
            'utf8'
        );

        await pool.query(sql);
        console.log('✓ Settings table created successfully');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating settings table:', error);
        process.exit(1);
    }
}

createSettingsTable();
