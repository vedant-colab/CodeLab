import { Server } from "socket.io";
import { spawn } from "child_process";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { httpServer } from "../app";

// Create WebSocket Server
export const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Ensure temp directory exists
const tempDir = path.join(__dirname, '..', 'temp');
fs.mkdir(tempDir, { recursive: true }).catch(console.error);

io.on("connect_error", (err) => {
  console.log(`Connection error: ${err.message}`);
});

io.on('connection', (socket) => {
  console.log('A user connected with ID:', socket.id);

  socket.on('connect_error', (error) => {
    console.log('Socket connection error:', error);
  });

  socket.on('error', (error) => {
    console.log('Socket error:', error);
  });

  socket.on('codeChange', (code) => {
    socket.broadcast.emit('codeUpdate', code);
  });

  socket.on('executeCode', async (data) => {
    console.log('Received code execution request from:', socket.id);
    
    const code = typeof data === 'string' ? data : data.code;
    const fileName = `${uuidv4()}.js`;
    const filePath = path.join(tempDir, fileName);

    try {
      // Write code to temporary file
      await fs.writeFile(filePath, code);
      console.log('Code file written:', filePath);

      const child = spawn('node', [filePath], { 
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      // Collecting child process output
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('error', (error) => {
        console.log('Child process error:', error);
        socket.emit('executionResult', { 
          success: false, 
          result: `Execution error: ${error.message}`
        });
      });

      // Handling process close and cleanup
      child.on('close', async (code) => {
        console.log('Child process exited with code:', code);
        try {
          await fs.unlink(filePath);
          console.log('Temp file deleted:', filePath);
        } catch (err) {
          console.error('Error deleting temp file:', err);
        }

        const success = code === 0;
        const result = success 
          ? (output || 'Code executed successfully')
          : (errorOutput || 'Code execution failed with non-zero exit code');

        socket.emit('executionResult', { success, result });
      });

    } catch (error: any) {
      console.error('Execution error:', error);
      socket.emit('executionResult', { 
        success: false, 
        result: `Server error: ${error.message}`
      });

      // Cleanup the file even on error
      try {
        await fs.unlink(filePath);
        console.log('Temp file deleted after error:', filePath);
      } catch (err) {
        console.error('Error deleting temp file after error:', err);
      }
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
  });
});
