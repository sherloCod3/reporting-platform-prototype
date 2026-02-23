'use client';

import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import { useRef, useEffect } from 'react';

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
  height = '400px',
  readOnly = false,
  onExecute
}: SqlEditorProps) {
  const { theme } = useTheme();

  const onExecuteRef = useRef(onExecute);

  useEffect(() => {
    onExecuteRef.current = onExecute;
  }, [onExecute]);

  const editorRef = useRef<{
    layout: () => void;
    addCommand: (keybinding: number, handler: () => void) => void;
    updateOptions: (options: Record<string, unknown>) => void;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  const handleEditorMount = (editor: unknown, monaco: unknown) => {
    const typedEditor = editor as {
      layout: () => void;
      addCommand: (keybinding: number, handler: () => void) => void;
      updateOptions: (options: Record<string, unknown>) => void;
    };
    const typedMonaco = monaco as {
      KeyMod: { CtrlCmd: number };
      KeyCode: { Enter: number };
      editor: {
        defineTheme: (
          themeName: string,
          themeData: Record<string, unknown>
        ) => void;
        setTheme: (themeName: string) => void;
      };
      languages: {
        setLanguageConfiguration: (
          languageId: string,
          configuration: Record<string, unknown>
        ) => void;
      };
    };

    editorRef.current = typedEditor;

    // Define a custom theme that matches our OKLCH color scale
    typedMonaco.editor.defineTheme('qreports-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c4b5fd' }, // Soft purple/blue
        { token: 'string', foreground: '86efac' },
        { token: 'number', foreground: 'fca5a5' }
      ],
      colors: {
        // Approximating oklch(0.18 0.035 265) which is roughly #181926
        'editor.background': '#181926',
        // Approximating oklch(0.22 0.04 265) for lines/gutters #202230
        'editor.lineHighlightBackground': '#202230',
        'editorLineNumber.foreground': '#64748b',
        'editorIndentGuide.background': '#2d3348',
        'editorIndentGuide.activeBackground': '#434c67'
      }
    });

    typedMonaco.editor.defineTheme('qreports-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#f8fafc',
        'editor.lineHighlightBackground': '#f1f5f9',
        'editorLineNumber.foreground': '#94a3b8'
      }
    });

    setTimeout(() => {
      typedMonaco.editor.setTheme(
        theme === 'dark' ? 'qreports-dark' : 'qreports-light'
      );
    }, 0);

    typedMonaco.languages.setLanguageConfiguration('mysql', {
      comments: {
        lineComment: '--',
        blockComment: ['/*', '*/']
      },
      brackets: [
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: "'", close: "'" },
        { open: '`', close: '`' }
      ]
    });

    typedEditor.addCommand(
      typedMonaco.KeyMod.CtrlCmd | typedMonaco.KeyCode.Enter,
      () => {
        onExecuteRef.current?.();
      }
    );

    typedEditor.updateOptions({
      fontSize: 13,
      lineHeight: 20,
      minimap: { enabled: true, side: 'right', size: 'fit' },
      scrollBeyondLastLine: false,
      wordWrap: 'off',
      formatOnPaste: true,
      formatOnType: true,
      autoIndent: 'full',
      tabSize: 2,
      renderWhitespace: 'selection',
      renderLineHighlight: 'all',
      cursorBlinking: 'smooth',
      smoothScrolling: true,
      cursorSmoothCaretAnimation: 'on',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      }
    });

    typedEditor.layout();
  };

  // Add effect to change theme dynamically
  useEffect(() => {
    const monacoWindow = window as unknown as {
      monaco?: { editor: { setTheme: (t: string) => void } };
    };
    if (editorRef.current && monacoWindow.monaco) {
      monacoWindow.monaco.editor.setTheme(
        theme === 'dark' ? 'qreports-dark' : 'qreports-light'
      );
    }
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="border rounded-md overflow-hidden bg-background h-full w-full"
    >
      <Editor
        height={height}
        defaultLanguage="mysql"
        value={value}
        onChange={handleEditorChange}
        theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
        onMount={handleEditorMount}
        options={{
          readOnly,
          minimap: { enabled: true, side: 'right', size: 'fit' },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: false,
          wordWrap: 'off',
          padding: { top: 12, bottom: 12 },
          renderWhitespace: 'selection',
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          cursorSmoothCaretAnimation: 'on',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true
          }
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
