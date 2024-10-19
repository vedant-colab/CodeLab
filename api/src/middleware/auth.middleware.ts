import jwt, { JwtPayload } from 'jsonwebtoken';
import express from "express";
import { JWT_SECRET_KEY } from '../config';
import { PrismaClient } from '@prisma/client';
import { TokenDetails } from '../interfaces/interface';

const prisma = new PrismaClient();

export const userAuthentication = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader ? authHeader.split(' ')[1] : null;
        if (token || token != null) {
            const isVerified = jwt.verify(token, JWT_SECRET_KEY) as TokenDetails;
            // console.log(isVerified, isVerified.userId)
            if (isVerified && isVerified.username) {
                // Query to find the session based on token and userId
                const session = await prisma.session.findFirst({
                    where: {
                        token: token,
                        // userId: isVerified.username, // Matches the `userId` from the verified token
                        isActive: true, // Ensure the session is active
                    },
                    include: {
                        user: true, // Include the related user
                    },
                });

                // Check if session is found and valid
                if (session && new Date() < session.expiresAt) {
                    // Attach user to request object for downstream use
                    // req.user = session.user; 
                    return next(); // User is authenticated, move to the next middleware
                } else {
                    return res.status(401).json({ message: 'Session not found or expired' });
                }
            }
            return res.status(401).json({ message: 'User not verified' });
        }
        else{
            return res.status(401).json({ message: 'Invalid or missing token' });
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(403).json({
                error_code: '1',
                message: `Error occurred: ${error.message}`,
            });
        }
    }
};
