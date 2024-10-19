import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as monaco from 'monaco-editor';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useSocket } from '@/hooks/useSocket';
import { initMonaco } from './MonacoEditor';

interface Linelock {
  lineNumber: number;
  userId: string;
  username: string;
  timestamp: number;
}

interface EditorState {
  content: string;
  version: number;
  locks: Linelock[];
}

const EditorPage: React.FC = () => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const terminalCardRef = useRef<HTMLDivElement | null>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    content: '// Type your JavaScript code here\nconsole.log("Hello, World!");',
    version: 0,
    locks: []
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomIdParam = params.get('roomId');
    if (!roomIdParam) {
      navigate('/room-selection');
    } else {
      setRoomId(roomIdParam);
    }
  }, [location, navigate]);
  
  const writeToTerminal = (text: string) => {
    terminalInstance.current?.write(text);
  };

  const { socket, isConnected, error } = useSocket(roomId, writeToTerminal);

  const updateLineDecorations = () => {
    if (!monacoRef.current) return;

    const decorations = editorState.locks.map(lock => ({
      range: new monaco.Range(lock.lineNumber, 1, lock.lineNumber, 1),
      options: {
        isWholeLine: true,
        className: 'locked-line',
        glyphMarginClassName: 'locked-line-glyph',
        hoverMessage: { value: `Locked by ${lock.username}` }
      }
    }));

    monacoRef.current.deltaDecorations([], decorations);
  };

  useEffect(() => {
    initMonaco();
    if (editorRef.current) {
      monacoRef.current = monaco.editor.create(editorRef.current, {
        value: editorState.content,
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        glyphMargin: true,
      });

      const style = document.createElement('style');
      style.textContent = `
        .locked-line { background: rgba(255, 0, 0, 0.1); }
        .locked-line-glyph { background: rgba(255, 0, 0, 0.5); width: 5px !important; }
      `;
      document.head.appendChild(style);

      monacoRef.current.onDidChangeModelContent((event) => {
        if (!socket) return;

        const changes = event.changes.map(change => ({
          ...change,
          locks: editorState.locks
        }));

        socket.emit('codeChange', {
          changes,
          version: editorState.version + 1,
          roomId
        });
      });

      monacoRef.current.onDidChangeCursorPosition((event) => {
        if (!socket) return;

        const lineNumber = event.position.lineNumber;
        const isLineLocked = editorState.locks.some(lock => 
          lock.lineNumber === lineNumber && lock.userId !== socket.id
        );

        if (isLineLocked) {
          monacoRef.current?.deltaDecorations([], [{
            range: new monaco.Range(lineNumber, 1, lineNumber, 1),
            options: {
              isWholeLine: true,
              hoverMessage: { value: 'This line is locked by another user' }
            }
          }]);
        } else {
          socket.emit('requestLineLock', {
            lineNumber,
            userId: socket.id,
            roomId
          });
        }
      });
    }

    if (terminalRef.current) {
      terminalInstance.current = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        theme: {
          background: '#1e1e1e'
        },
        convertEol: true,
        scrollback: 1000,
      });
      
      fitAddon.current = new FitAddon();
      terminalInstance.current.loadAddon(fitAddon.current);
      terminalInstance.current.open(terminalRef.current);
      fitAddon.current.fit();
      terminalInstance.current.writeln(`Terminal initialized. Connecting to room ${roomId}...`);
    }

    const handleResize = () => {
      if (fitAddon.current) {
        fitAddon.current.fit();
      }
    };
    window.addEventListener('resize', handleResize);

    if (socket) {
      socket.on('editorStateUpdate', (newState: EditorState) => {
        setEditorState(newState);
        if (monacoRef.current && newState.content !== monacoRef.current.getValue()) {
          monacoRef.current.setValue(newState.content);
        }
        updateLineDecorations();
      });

      socket.on('lockGranted', (lock: Linelock) => {
        setEditorState(prev => ({
          ...prev,
          locks: [...prev.locks, lock]
        }));
        updateLineDecorations();
      });

      socket.on('lockReleased', (lineNumber: number) => {
        setEditorState(prev => ({
          ...prev,
          locks: prev.locks.filter(lock => lock.lineNumber !== lineNumber)
        }));
        updateLineDecorations();
      });
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
      }
      if (terminalInstance.current) {
        terminalInstance.current.dispose();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [socket, isConnected, roomId]);

  const handleSave = () => {
    if (monacoRef.current && socket) {
      const code = monacoRef.current.getValue();
      socket.emit('saveCode', { code, roomId });
      console.log('Saved code for room:', roomId);
    }
  };

  const handleReset = () => {
    setIsResetDialogOpen(true);
  };

  const confirmReset = () => {
    if (monacoRef.current && socket) {
      const defaultCode = '// Type your code here';
      monacoRef.current.setValue(defaultCode);
      socket.emit('resetCode', { code: defaultCode, roomId });
    }
    if (terminalInstance.current) {
      terminalInstance.current.clear();
      terminalInstance.current.write('Terminal reset.\r\n$ ');
    }
    setIsResetDialogOpen(false);
  };

  const handleExecute = async () => {
    if (!isConnected) {
      writeToTerminal('\r\nError: Not connected to server\r\n$ ');
      return;
    }

    if (monacoRef.current && socket) {
      const code = monacoRef.current.getValue();
      writeToTerminal('\r\nExecuting code...\r\n');
      
      try {
        socket.emit('executeCode', { code, roomId });
        terminalCardRef.current?.scrollIntoView({ behavior: 'smooth' });
      } catch (error) {
        writeToTerminal(`\r\nError sending code to server: ${error}\r\n$ `);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Monaco Editor - Room {roomId}</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={editorRef} style={{ height: '400px', border: '1px solid #ccc' }}></div>
          <div className="mt-4 flex justify-between items-center">
            <Button onClick={handleExecute}>Execute</Button>
            <div>
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" className="ml-2" onClick={handleReset}>Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card ref={terminalCardRef}>
        <CardHeader>
          <CardTitle>Terminal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64 overflow-hidden">
            <div ref={terminalRef} className="w-full h-full"></div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to reset?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will clear all your current code and terminal output. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditorPage;