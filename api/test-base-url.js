require('dotenv').config();

console.log('=== Environment Variables Test ===\n');
console.log('PORT:', process.env.PORT);
console.log('BASE_URL:', process.env.BASE_URL);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('\n=== URL Helper Test ===\n');

const { getBaseUrl, toAbsoluteUrl } = require('./src/utils/urlHelper');

console.log('getBaseUrl():', getBaseUrl());
console.log('\nTest conversions:');
console.log('uploads/users/123/profile.jpg →', toAbsoluteUrl('uploads/users/123/profile.jpg'));
console.log('/uploads/users/123/profile.jpg →', toAbsoluteUrl('/uploads/users/123/profile.jpg'));
console.log('http://localhost:8080/uploads/users/123/profile.jpg →', toAbsoluteUrl('http://localhost:8080/uploads/users/123/profile.jpg'));
