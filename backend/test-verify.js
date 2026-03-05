// Test Script: Register unverified user, try login, and then verify.
const registerData = {
    firstName: 'Test',
    lastName: 'Verifier',
    email: `test_verify_${Date.now()}@laminks.com`,
    password: 'password123'
};

const runTest = async () => {
    try {
        console.log('\n1. Registering new user...');
        const regRes = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });
        const regJson = await regRes.json();
        console.log('Registration Response:', regJson);

        console.log('\n2. Attempting to log in immediately (should fail)...');
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: registerData.email, password: registerData.password })
        });
        const loginJson = await loginRes.json();
        console.log('Login Response:', loginRes.status, loginJson);

        console.log('\n✅ Script complete. Please look at the backend terminal to see the Ethereal Preview URL.');
    } catch (e) {
        console.error(e);
    }
};

runTest();
