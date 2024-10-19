import express from 'express';
import { executeCode, roomAssign } from '../controller/editor.controller';
export const EditorRouter = express.Router();

EditorRouter.post('/compile-code', executeCode)
EditorRouter.post("/create-room", roomAssign)