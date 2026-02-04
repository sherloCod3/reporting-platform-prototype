"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  readOnly?: boolean;
  onExecute?: () => void;
}

export function SqlEditor({
  value,
  onChange,
  height = "400px",
  readOnly = false,
  onExecute,
}: SqlEditorProps) {
  const { theme } = useTheme();

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "");
  };

  const handleEditorMount = (editor: unknown, monaco: unknown) => {
    // Type assertion for Monaco editor instance
    const typedEditor = editor as {
      addCommand: (keybinding: number, handler: () => void) => void;
      updateOptions: (options: Record<string, unknown>) => void;
    };
    const typedMonaco = monaco as {
      KeyMod: { CtrlCmd: number };
      KeyCode: { Enter: number };
      languages: {
        setLanguageConfiguration: (
          languageId: string,
          configuration: Record<string, unknown>,
        ) => void;
      };
    };

    // Configure SQL language features
    typedMonaco.languages.setLanguageConfiguration("mysql", {
      comments: {
        lineComment: "--",
        blockComment: ["/*", "*/"],
      },
      brackets: [
        ["[", "]"],
        ["(", ")"],
      ],
      autoClosingPairs: [
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: "'", close: "'" },
        { open: "`", close: "`" },
      ],
    });

    // Add keyboard shortcut for execute (Ctrl+Enter or Cmd+Enter)
    typedEditor.addCommand(
      typedMonaco.KeyMod.CtrlCmd | typedMonaco.KeyCode.Enter,
      () => {
        onExecute?.();
      },
    );

    // Configure editor options for large queries (IDE-like)
    typedEditor.updateOptions({
      fontSize: 13,
      lineHeight: 20,
      minimap: { enabled: true, side: "right", size: "fit" },
      scrollBeyondLastLine: false,
      wordWrap: "off", // Better for large queries
      formatOnPaste: true,
      formatOnType: true,
      autoIndent: "full",
      tabSize: 2,
      renderWhitespace: "selection",
      renderLineHighlight: "all",
      cursorBlinking: "smooth",
      smoothScrolling: true,
      cursorSmoothCaretAnimation: "on",
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
    });
  };

  return (
    <div className="border rounded-md overflow-hidden bg-white dark:bg-slate-900 h-full w-full">
      <Editor
        height={height}
        defaultLanguage="mysql"
        value={value}
        onChange={handleEditorChange}
        theme={theme === "dark" ? "vs-dark" : "vs-light"}
        onMount={handleEditorMount}
        options={{
          readOnly,
          minimap: { enabled: true, side: "right", size: "fit" },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "off",
          padding: { top: 12, bottom: 12 },
          renderWhitespace: "selection",
          renderLineHighlight: "all",
          cursorBlinking: "smooth",
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        }
      />
    </div>
  );
}
