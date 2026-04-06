const fetch = require('node-fetch');

const BASE_URL = 'https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1';

// Test data
const specialties = [
    {
        name: "Endodontist",
        description: "Root canal treatment specialist",
        is_active: true
    },
    {
        name: "Periodontist",
        description: "Gum disease and dental implants specialist",
        is_active: true
    },
    {
        name: "Prosthodontist",
        description: "Dental prosthetics and restoration specialist",
        is_active: true
    },
    {
        name: "OMFS",
        description: "Oral and Maxillofacial Surgery specialist",
        is_active: true
    },
    {
        name: "Orthodontist",
        description: "Teeth alignment and braces specialist",
        is_active: true
    },
    {
        name: "Pedodontist",
        description: "Pediatric dentistry specialist",
        is_active: true
    }
];

async function testSpecialtiesAPI() {
    try {
        // First, login to get token
        console.log('=== LOGGING IN ===');
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
                email: 'admin@protect32.com',
                password: 'admin123'
            })
        });

        const loginData = await loginResponse.json();
        
        if (!loginData.success) {
            console.error('Login failed:', loginData);
            return;
        }

        const token = loginData.token;
        console.log('✓ Login successful');
        console.log('Token:', token.substring(0, 20) + '...\n');

        // Create specialties
        console.log('=== CREATING SPECIALTIES ===');
        for (const specialty of specialties) {
            console.log(`\nCreating: ${specialty.name}`);
            console.log('Data:', JSON.stringify(specialty, null, 2));
            
            const createResponse = await fetch(`${BASE_URL}/specialties`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(specialty)
            });

            const createData = await createResponse.json();
            
            if (createData.success) {
                console.log('✓ Created successfully');
                console.log('ID:', createData.data.id);
            } else {
                console.log('✗ Failed:', createData.error);
            }
        }

        // List all specialties
        console.log('\n\n=== LISTING ALL SPECIALTIES ===');
        const listResponse = await fetch(`${BASE_URL}/specialties?limit=100`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
            }
        });

        const listData = await listResponse.json();
        
        if (listData.success) {
            console.log(`\n✓ Found ${listData.data.length} specialties:\n`);
            listData.data.forEach((spec, index) => {
                console.log(`${index + 1}. ${spec.name}`);
                console.log(`   ID: ${spec.id}`);
                console.log(`   Description: ${spec.description || 'N/A'}`);
                console.log(`   Status: ${spec.is_active ? 'Active' : 'Inactive'}`);
                console.log('');
            });

            console.log('Pagination:', listData.pagination);
        } else {
            console.log('✗ Failed to list:', listData.error);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the test
testSpecialtiesAPI();
