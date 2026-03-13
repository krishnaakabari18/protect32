/**
 * Test script for Procedures API
 * Run this after database migration to verify everything works
 * 
 * Usage: node test-procedures-api.js
 */

const BASE_URL = 'https://occupiable-milissa-ennuyante.ngrok-free.dev/api/v1';
// const BASE_URL = 'http://localhost:8080/api/v1';

// Replace with your actual auth token
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE';

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
};

async function testGetAllProcedures() {
  console.log('\n=== Test 1: Get All Procedures ===');
  try {
    const response = await fetch(`${BASE_URL}/procedures`, { headers });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log(`Total procedures: ${data.count}`);
      console.log('Sample procedure:', data.data[0]);
    } else {
      console.log('❌ Failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testGetByCategory() {
  console.log('\n=== Test 2: Get Procedures by Category ===');
  try {
    const response = await fetch(`${BASE_URL}/procedures/by-category`, { headers });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log(`Total categories: ${data.data.length}`);
      data.data.forEach(cat => {
        console.log(`- ${cat.category}: ${cat.procedures.length} procedures`);
      });
    } else {
      console.log('❌ Failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testGetCategories() {
  console.log('\n=== Test 3: Get All Categories ===');
  try {
    const response = await fetch(`${BASE_URL}/procedures/categories`, { headers });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      data.data.forEach(cat => {
        console.log(`- ${cat.category}: ${cat.count} procedures`);
      });
    } else {
      console.log('❌ Failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testSearchProcedures() {
  console.log('\n=== Test 4: Search Procedures (X-Ray) ===');
  try {
    const response = await fetch(`${BASE_URL}/procedures?search=X-Ray`, { headers });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log(`Found ${data.count} procedures`);
      data.data.forEach(proc => {
        console.log(`- ${proc.name} (${proc.category})`);
      });
    } else {
      console.log('❌ Failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testFilterByCategory() {
  console.log('\n=== Test 5: Filter by Category (Endodontic) ===');
  try {
    const response = await fetch(`${BASE_URL}/procedures?category=Endodontic`, { headers });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log(`Found ${data.count} procedures`);
      data.data.forEach(proc => {
        console.log(`- ${proc.name}`);
      });
    } else {
      console.log('❌ Failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testCreateProcedure() {
  console.log('\n=== Test 6: Create New Procedure ===');
  try {
    const newProcedure = {
      name: 'Test Procedure - ' + Date.now(),
      category: 'Diagnostic & Preventive',
      description: 'This is a test procedure'
    };
    
    const response = await fetch(`${BASE_URL}/procedures`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newProcedure)
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('Created procedure:', data.data);
      return data.data.id;
    } else {
      console.log('❌ Failed:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

async function testUpdateProcedure(id) {
  console.log('\n=== Test 7: Update Procedure ===');
  try {
    const updates = {
      description: 'Updated description - ' + Date.now()
    };
    
    const response = await fetch(`${BASE_URL}/procedures/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates)
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('Updated procedure:', data.data);
    } else {
      console.log('❌ Failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testDeleteProcedure(id) {
  console.log('\n=== Test 8: Delete Procedure ===');
  try {
    const response = await fetch(`${BASE_URL}/procedures/${id}`, {
      method: 'DELETE',
      headers
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('Deleted procedure');
    } else {
      console.log('❌ Failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Procedures API Tests...');
  console.log('Base URL:', BASE_URL);
  
  if (AUTH_TOKEN === 'YOUR_AUTH_TOKEN_HERE') {
    console.log('\n⚠️  WARNING: Please update AUTH_TOKEN in the script with your actual token!');
    console.log('You can get your token from localStorage in the browser console:');
    console.log('localStorage.getItem("auth_token")');
    return;
  }
  
  // Read-only tests
  await testGetAllProcedures();
  await testGetByCategory();
  await testGetCategories();
  await testSearchProcedures();
  await testFilterByCategory();
  
  // Write tests (create, update, delete)
  const newId = await testCreateProcedure();
  if (newId) {
    await testUpdateProcedure(newId);
    await testDeleteProcedure(newId);
  }
  
  console.log('\n✨ All tests completed!');
}

// Run tests
runAllTests();
