import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import monacoEditorPlugin, { IMonacoEditorOpts } from 'vite-plugin-monaco-editor'


import path from "path"

// const monacoEditorOptions: IMonacoEditorOpts = {
//   publicPath: 'monaco-editor',
//   customDistPath: (root: string, outDir: string) => {
//     return 'public/monaco-editor'
//   }
// }

export default defineConfig({
  plugins: [
    react(),
    // monacoEditorPlugin(monacoEditorOptions),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true
      }
    },
    fs: {
      strict: false
    },
  },
  optimizeDeps: {
    include: ['monaco-editor/esm/vs/editor/editor.worker']
  }
})
