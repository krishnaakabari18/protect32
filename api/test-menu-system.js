const pool = require('./src/config/database');

async function testMenuSystem() {
    try {
        console.log('=== TESTING MENU SYSTEM ===\n');

        // Check if menus table exists
        console.log('1. Checking if menus table exists...');
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'menus'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            console.log('❌ Menus table does NOT exist!');
            console.log('\nPlease run:');
            console.log('psql -U postgres -d protect32 -f database/create-menu-system.sql');
            return;
        }
        console.log('✓ Menus table exists\n');

        // Check if user_permissions table exists
        console.log('2. Checking if user_permissions table exists...');
        const permTableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'user_permissions'
            );
        `);
        
        if (!permTableCheck.rows[0].exists) {
            console.log('❌ User_permissions table does NOT exist!');
            return;
        }
        console.log('✓ User_permissions table exists\n');

        // Count menus
        console.log('3. Counting menus in database...');
        const menuCount = await pool.query('SELECT COUNT(*) FROM menus');
        console.log(`✓ Found ${menuCount.rows[0].count} menus\n`);

        // List all menus
        console.log('4. Listing all menus:');
        const menus = await pool.query('SELECT name, label, path, sort_order, is_active FROM menus ORDER BY sort_order');
        menus.rows.forEach((menu, index) => {
            const status = menu.is_active ? '✓' : '✗';
            console.log(`   ${status} ${index + 1}. ${menu.label} (${menu.name}) - ${menu.path}`);
        });
        console.log('');

        // Check if specialties menu exists
        console.log('5. Checking for Specialties menu...');
        const specialtiesMenu = await pool.query(`SELECT * FROM menus WHERE name = 'specialties'`);
        if (specialtiesMenu.rows.length > 0) {
            console.log('✓ Specialties menu found!');
            console.log('   ID:', specialtiesMenu.rows[0].id);
            console.log('   Label:', specialtiesMenu.rows[0].label);
            console.log('   Path:', specialtiesMenu.rows[0].path);
            console.log('   Active:', specialtiesMenu.rows[0].is_active);
        } else {
            console.log('❌ Specialties menu NOT found!');
            console.log('\nPlease run:');
            console.log('psql -U postgres -d protect32 -f database/create-menu-system.sql');
        }
        console.log('');

        // Check permissions count
        console.log('6. Checking user permissions...');
        const permCount = await pool.query('SELECT COUNT(*) FROM user_permissions');
        console.log(`✓ Found ${permCount.rows[0].count} permission records\n`);

        // Check admin users
        console.log('7. Checking admin users...');
        const admins = await pool.query(`SELECT id, email, user_type FROM users WHERE user_type = 'admin'`);
        console.log(`✓ Found ${admins.rows.length} admin users:`);
        admins.rows.forEach(admin => {
            console.log(`   - ${admin.email} (${admin.id})`);
        });
        console.log('');

        // Check if admins have specialties permission
        if (specialtiesMenu.rows.length > 0) {
            console.log('8. Checking if admins have Specialties permission...');
            const adminPerms = await pool.query(`
                SELECT u.email, up.can_view, up.can_create, up.can_edit, up.can_delete
                FROM user_permissions up
                JOIN users u ON up.user_id = u.id
                WHERE up.menu_id = $1 AND u.user_type = 'admin'
            `, [specialtiesMenu.rows[0].id]);
            
            if (adminPerms.rows.length > 0) {
                console.log('✓ Admin permissions found:');
                adminPerms.rows.forEach(perm => {
                    console.log(`   - ${perm.email}: View=${perm.can_view}, Create=${perm.can_create}, Edit=${perm.can_edit}, Delete=${perm.can_delete}`);
                });
            } else {
                console.log('❌ No admin permissions found for Specialties!');
                console.log('\nRun this SQL to grant permissions:');
                console.log(`
INSERT INTO user_permissions (user_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT u.id, '${specialtiesMenu.rows[0].id}', true, true, true, true
FROM users u
WHERE u.user_type = 'admin'
ON CONFLICT (user_id, menu_id) DO NOTHING;
                `);
            }
        }

        console.log('\n=== TEST COMPLETE ===');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testMenuSystem();
