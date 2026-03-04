import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.PAYSTACK_SECRET_KEY || 'sk_test_123';

const payload = {
    event: 'charge.success',
    data: {
        id: 302961,
        domain: 'test',
        status: 'success',
        reference: 'xyz',
        amount: 50000,
        message: null,
        gateway_response: 'Successful',
        paid_at: '2020-09-09T14:31:01.000Z',
        created_at: '2020-09-09T14:30:57.000Z',
        channel: 'card',
        currency: 'ZAR',
        ip_address: '127.0.0.1',
        metadata: {
            bookingId: 'some_booking_id_here' // We will replace with a real or fake unconfirmed booking
        }
    }
};

const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(payload)).digest('hex');

console.log('Testing webhook with mock data...');
console.log('Computed Hash:', hash);

fetch('http://localhost:5001/api/payments/paystack/webhook', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': hash
    },
    body: JSON.stringify(payload) // Must match EXACTLY what's signed
}).then(res => res.text())
    .then(text => console.log('Response:', text))
    .catch(err => console.error('Error:', err));
