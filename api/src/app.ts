  import express from "express";
  import { createServer } from "http";
  import { urlPath, port } from "./config";
  import { router } from "./router/index.router";
  import useragent from "express-useragent";
  import { Authrouter } from "./router/auth.routes";
  import cors from "cors";
  import { EditorRouter } from "./router/editor.router";
  import { Server } from "socket.io";
  import { spawn } from "child_process";
  import { v4 as uuidv4 } from "uuid";
  import fs from "fs/promises";
  import path from "path";
  import { EditorState, Linelock } from "./interfaces/interface";

  const app = express();
  const httpServer = createServer(app);

  app.use(express.json());
  app.use(
    cors({
      origin: ["http://localhost:5173", "http://127.0.0.1:5500"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(router);
  app.use(`${urlPath}/auth`, Authrouter);
  app.use(`${urlPath}/editor`, EditorRouter);
  app.use(useragent.express());

  httpServer.listen(port, () => {
    console.log("Server listening on port:", port);
  });

  const LOCK_TIMEOUT = 30000;

  export const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5500",
      ],
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
  });

  let editorState: EditorState = {
    content: '// Type your JavaScript code here\nconsole.log("Hello, World!");',
    version: 0,
    locks: [],
  };

  setInterval(() => {
    const now = Date.now();
    const expiredLocks = editorState.locks.filter(
      (lock : any) => now - lock.timestamp > LOCK_TIMEOUT
    );

    if (expiredLocks.length > 0) {
      editorState.locks = editorState.locks.filter(
        (lock : any) => now - lock.timestamp <= LOCK_TIMEOUT
      );
      io.emit("editorStateUpdate", editorState);
    }
  }, 5000);

  // Ensure temp directory exists
  const tempDir = path.join(__dirname, "..", "temp");
  fs.mkdir(tempDir, { recursive: true }).catch(console.error);

  io.on("connect_error", (err) => {
    console.log(`Connection error: ${err.message}`);
  });

  const rooms = new Map();

  io.on("connection", (socket) => {
    console.log("A user connected with ID:", socket.id);

  const roomId = socket.handshake.query.roomId as string;
  
  if (!roomId || !rooms.has(roomId)) {
    console.log('Invalid room ID:', roomId);
    socket.disconnect();
    return;
  }

    socket.join(roomId);

    let editorState = rooms.get(roomId) || { content: '', version: 0, locks: [] };

    socket.emit("editorStateUpdate", editorState);

    socket.on("connect_error", (error) => {
      console.log("Socket connection error:", error);
    });

    socket.on("error", (error) => {
      console.log("Socket error:", error);
    });

    socket.on("requestLineLock", ({ lineNumber, userId }) => {
      // Check if line is already locked
      const existingLock = editorState.locks.find(
        (lock : any) => lock.lineNumber === lineNumber && lock.userId !== userId
      );

      if (!existingLock) {
        // Grant lock
        const newLock: Linelock = {
          lineNumber,
          userId,
          username: `User ${socket.id.slice(0, 4)}`,
          timestamp: Date.now(),
        };

        editorState.locks = [
          ...editorState.locks.filter((lock : any) => lock.lineNumber !== lineNumber),
          newLock,
        ];

        io.to(roomId).emit('lockGranted', newLock);
      }
    });

    socket.on("codeChange", ({ changes, version }) => {
      // Verify user has necessary locks
      const hasValidLocks = changes.every((change : any) => {
        const lineNumber = change.range.startLineNumber;
        const lock = editorState.locks.find((l: any) => l.lineNumber === lineNumber);
        return !lock || lock.userId === socket.id;
      });

      if (!hasValidLocks) {
        // Reject changes and force client to sync
        socket.emit("editorStateUpdate", editorState);
        return;
      }

      if (version > editorState.version) {
        editorState = {
          ...editorState,
          content: applyChanges(editorState.content, changes),
          version,
        };
        rooms.set(roomId, editorState);
        socket.to(roomId).emit('editorStateUpdate', editorState);
      
      }
    });

    socket.on("executeCode", async (data) => {
      console.log("Received code execution request from:", socket.id);

      const code = typeof data === "string" ? data : data.code;
      const fileName = `${uuidv4()}.js`;
      const filePath = path.join(tempDir, fileName);

      try {
        // Write code to temporary file
        await fs.writeFile(filePath, code);
        console.log("Code file written:", filePath);

        const child = spawn("node", [filePath], {
          timeout: 5000,
          stdio: ["pipe", "pipe", "pipe"],
        });

        let output = "";
        let errorOutput = "";

        // Collecting child process output
        child.stdout.on("data", (data) => {
          output += data.toString();
        });

        child.stderr.on("data", (data) => {
          errorOutput += data.toString();
        });

        child.on("error", (error) => {
          console.log("Child process error:", error);
          socket.emit("executionResult", {
            success: false,
            result: `Execution error: ${error.message}`,
          });
        });

        // Handling process close and cleanup
        child.on("close", async (code) => {
          console.log("Child process exited with code:", code);
          try {
            await fs.unlink(filePath);
            console.log("Temp file deleted:", filePath);
          } catch (err) {
            console.error("Error deleting temp file:", err);
          }

          const success = code === 0;
          const result = success
            ? output || "Code executed successfully"
            : errorOutput || "Code execution failed with non-zero exit code";

          socket.emit("executionResult", { success, result });
        });
      } catch (error: any) {
        console.error("Execution error:", error);
        socket.emit("executionResult", {
          success: false,
          result: `Server error: ${error.message}`,
        });

        // Cleanup the file even on error
        try {
          await fs.unlink(filePath);
          console.log("Temp file deleted after error:", filePath);
        } catch (err) {
          console.error("Error deleting temp file after error:", err);
        }
      }
    });

    socket.on("disconnect", (reason) => {
      editorState.locks = editorState.locks.filter(
        (lock : any) => lock.userId !== socket.id
      );
      rooms.set(roomId, editorState);
      io.to(roomId).emit('editorStateUpdate', editorState);
    });
  });

  function applyChanges(content: string, changes: any[]): string {
    // Sort changes in reverse order to avoid position shifts
    const sortedChanges = [...changes].sort(
      (a, b) => b.range.startLineNumber - a.range.startLineNumber
    );

    let lines = content.split("\n");

    for (const change of sortedChanges) {
      const { range, text } = change;
      const startLine = range.startLineNumber - 1;
      const endLine = range.endLineNumber - 1;

      const newLines = text.split("\n");
      lines.splice(startLine, endLine - startLine + 1, ...newLines);
    }

    return lines.join("\n");
  }

  export { httpServer };
