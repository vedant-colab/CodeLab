import express from 'express';
import { sanitizeBody } from '../middleware/sanitizeBody.middleware';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signUpModel } from '../Sanitize Models/user.models';

const prisma = new PrismaClient();

export const signUpController = async(req: express.Request, res: express.Response ,_next: express.NextFunction)=>{
    try{
        req.body = sanitizeBody(signUpModel, req.body);
        const requiredFields = ['username', 'email', 'password'];
        const missingFields = requiredFields.filter((field: string) => !req.body[field]?.trim());
        if(missingFields.length > 0){
            return res.status(400).json({
                Error_code: '1',
                message: `The following fields are blank: ${missingFields.join(',')}`
            })
        }
        const existingUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: req.body.email },
                { username: req.body.username },
              ],
            },
          });
      
          if (existingUser) {
            return res.status(409).json({
              Error_code: '1',
              message: 'User with this email or username already exists',
            });
          }
        const saltRounds = 10
        const hashPassword : string = await bcrypt.hash(req.body.password, saltRounds)
        // const user = await prisma.user.create({
        //     data: {
        //         username: req.body.username,
        //         email: req.body.email,
        //         password: hashPassword,
        //       },
        // });
        const user = await prisma.$transaction([
            prisma.user.create({
                data: {
                            username: req.body.username,
                            email: req.body.email,
                            password: hashPassword,
                          },
            }),
        ])
        if(user){
            res.status(201).json([{
                Error_code: '0',
                message: 'User created successfully'
            }])
        }
    } catch(error: unknown){
        if(error instanceof Error){
            return res.status(500).json([{
                Error_code: '1',
                message: `Error creating user: ${error} `
            }]);
        }
    }
};

export const loginController = async(req: express.Request, res: express.Response, _next: express.NextFunction)=>{
    try{
        const {userid, password} = req.body;
        
    } catch(error: unknown){
        if(error instanceof Error){
            return res.status(500).json([{
                Error_code: '1',
                message: `Error occured: ${error}`
            }]);
        }
    }
}