import React from "react";
import Editor from "@monaco-editor/react";

interface MonacoEditorProps {
  height?: string;
  language?: string;
  theme?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  height = "90vh",
  language = "javascript",
  theme = "vs-dark",
  value = "// Write your code here",
  onChange,
}) => {
  return (
    <Editor
      height={height}
      language={language}
      theme={theme}
      value={value}
      onChange={onChange}
      options={{
        selectOnLineNumbers: true,
        automaticLayout: true,
        minimap: { enabled: false },
      }}
    />
  );
};

export default MonacoEditor;
