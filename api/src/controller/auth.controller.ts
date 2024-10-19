import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config";
// import { Prisma } from "@prisma/client";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
// import moment from "moment";
const prisma = new PrismaClient()
import moment from 'moment-timezone';


export const tokenCreationController = async(req: express.Request, res: express.Response , _next: express.NextFunction)=>{
    try{
        const {username, password} = req.body;
        const useragent = req.headers['user-agent'] || '';
        const user = await prisma.user.findUnique({
            where: {
              username: username,
            },
          });
        if(!user){
            return res.status(401).json({
                Error_code: '1',
                messsage: 'User id or password is invalid'
            })
        }
        const isValidPassword = await bcrypt.compare(password,user.password)
        if(!isValidPassword){
            return res.status(401).json([{
                Error_code: '1',
                messsage: 'User id or password is invalid'
            }])
        }
        const session = await prisma.session.findFirst({
            where: {
                isActive: true,
                user: { username },
            },
        });

        if (session) {
            // return res.status(401).json({ message: 'Invalid or inactive session' });
            const deactivateTken = await prisma.session.update({
                where: {
                    id: session.id
                },
                data: {
                    isActive: false
                }
            }) 
        }
        const token = jwt.sign({username, password}, JWT_SECRET_KEY, { expiresIn: '1h' });
        await prisma.session.create({
            data: {
              userId: user.id,
              token,
              createdAt: moment().tz("Asia/Kolkata").toDate(), // Convert current time to IST
              expiresAt: moment().tz("Asia/Kolkata").add(1, 'hour').toDate(), // Expire 1 hour from now in IST // 1 hour expiration
              isActive: true,
              userAgent : useragent, // Store user agent
            },
          });
          res.status(200).json([{
            Error_code : '0',
            token: token }]);
    } catch(error: unknown){
        if(error instanceof Error){
            return res.status(500).json({
                Error_code: '1',
                message: `Error occured: ${error}`
            });
        }
    }

};

export const validateTokenController = async (req: express.Request, res: express.Response, _next: express.NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token
        if (!token) {
            return res.status(401).json({ message: 'Token is missing' });
        }

        // Verify the token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Extract user details from the decoded token
        const { username } = decodedToken as { username: string };

        // Check if token is active in the database
        const session = await prisma.session.findFirst({
            where: {
                token: token,
                isActive: true,
                user: { username },
            },
        });

        if (!session) {
            return res.status(401).json({ message: 'Invalid or inactive session' });
        }

        res.status(200).json({ message: 'Token is valid' });
    } catch (error: unknown) {
        res.status(500).json({ message: `Error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
};

export const logoutController = async (req: express.Request, res: express.Response, _next: express.NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token
        if (!token) {
            return res.status(401).json({ message: 'Token is missing' });
        }

        // Find the session associated with the token
        const session = await prisma.session.findFirst({
            where: {
                token: token,
                isActive: true, // Ensure we are working with an active session
            },
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found or already inactive' });
        }

        // Update the session's `isActive` flag to `false`
        await prisma.session.update({
            where: { id: session.id },
            data: { isActive: false },
        });

        return res.status(200).json({ message: 'Successfully logged out, session is now inactive' });
    } catch (error: unknown) {
        return res.status(500).json({ message: `Error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
};