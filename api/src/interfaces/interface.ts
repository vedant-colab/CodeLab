import { JwtPayload } from "jsonwebtoken";
export interface SanitizeOptions {
    allowedFields: string[];
  }

export interface TokenDetails extends JwtPayload {
    userId: number; // Matching the userId type from your schema (Int)
}

export interface Linelock {
  lineNumber: number;
  userId: string;
  username: string;
  timestamp: number;
}

export interface EditorState {
  content: string;
  version: number;
  locks: Linelock[];
}