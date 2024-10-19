import express from 'express';
import { sanitizeBody } from '../middleware/sanitizeBody.middleware';
import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export const executeCode = async (req: express.Request, res: express.Response, _next: express.NextFunction) => {
  try {
    const { code } = req.body;
    const fileName = `${uuidv4()}.js`;
    const filePath = path.join(__dirname, '..', 'temp', fileName);

    // Write the code to a temporary file
    await fs.writeFile(filePath, code);

    // Execute the code
    const child = spawn('node', [filePath]);

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', async (code) => {
      // Delete the temporary file
      await fs.unlink(filePath);

      if (code === 0) {
        res.status(200).json({ output });
      } else {
        res.status(400).json({ error: errorOutput });
      }
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'An unknown error occurred' });
  }
};

export const roomAssign = async(req: express.Request, res: express.Response, _next: express.NextFunction) =>{
  try {
    const {roomId} = req.body;
    const rooms = new Map();
    
  } catch(error: unknown) {
    if(error instanceof Error){
      return res.status(500).json({error: "An unknown error occured"})
    }
  }
}