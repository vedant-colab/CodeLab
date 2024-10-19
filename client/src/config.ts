import dotenv from 'dotenv';
dotenv.config()

export const base_url = import.meta.env.VITE_API_URL;
console.log('config');