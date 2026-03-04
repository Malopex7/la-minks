const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const getSecretKey = () => {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) {
        console.warn('PAYSTACK_SECRET_KEY is not defined in environment variables.');
    }
    return key;
};

export const initializeTransaction = async (data) => {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${getSecretKey()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(`Paystack error: ${responseData.message}`);
    }

    return responseData;
};

export const verifyTransaction = async (reference) => {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${getSecretKey()}`,
        },
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(`Paystack error: ${responseData.message}`);
    }

    return responseData;
};
