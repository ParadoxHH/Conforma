import axios from 'axios';

const API_URL = 'https://api.escrow-sandbox.com/2017-09-01'; // Sandbox URL

const apiClient = axios.create({
  baseURL: API_URL,
  auth: {
    username: process.env.ESCROW_API_EMAIL!,
    password: process.env.ESCROW_API_PASSWORD!,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createTransaction = async (jobData: any) => {
  const { title, description, totalPrice, homeowner, contractor } = jobData;

  const transactionData = {
    description: title,
    parties: [
      {
        role: 'buyer',
        customer: homeowner.email, // Assuming homeowner is the buyer
      },
      {
        role: 'seller',
        customer: contractor.email, // Assuming contractor is the seller
      },
    ],
    items: [
      {
        title: title,
        description: description,
        quantity: 1,
        type: 'general_merchandise',
        inspection_period: 259200, // 3 days in seconds
        price: totalPrice,
      },
    ],
    currency: 'usd',
  };

  try {
    const response = await apiClient.post('/transaction', transactionData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating Escrow.com transaction:', error.response?.data || error.message);
    throw new Error('Failed to create Escrow.com transaction.');
  }
};
