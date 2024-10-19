import dotenv from 'dotenv';
import jwt  from "jsonwebtoken";

dotenv.config({ path: 'E:\\Projects\\MultiUserCodeEditor\\api\\.env'})
export const port: number = 3000;
export const urlPath: string = `${process.env.basePath}/${process.env.appVersion}`
if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY is not defined in environment variables');
  }
export const JWT_SECRET_KEY: jwt.Secret  = process.env.JWT_SECRET_KEY;

