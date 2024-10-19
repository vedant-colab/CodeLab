import express from 'express';
import { sanitizeBody } from '../middleware/sanitizeBody.middleware';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';


export const homePageController = async (req: express.Request, res: express.Response, _next: express.NextFunction) => {
    try {
        res.status(200).json({
            message: 'Api hit successfully'
        })
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(500).json({
                message: `Error occured: ${error}`
            })
        }
    }
};

