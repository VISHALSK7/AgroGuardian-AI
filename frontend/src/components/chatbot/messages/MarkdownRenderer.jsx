import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const CodeBlock = ({ children, className }) => {
  const [copied, setCopied] = useState(false);
  const language = className ? className.replace('language-', '') : '';
  const code = String(children).replace(/\n$/, '');
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-[var(--ag-border-soft)] bg-[var(--ag-surface-container)]">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--ag-surface-high)] border-b border-[var(--ag-border-soft)]">
        <span className="text-xs font-mono text-[var(--ag-text-muted)]">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="text-[var(--ag-text-muted)] hover:text-[var(--ag-text)] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          {copied ? (
            <><Check size={14} className="text-green-500 dark:text-green-400" /><span className="text-[10px] text-green-500 dark:text-green-400">Copied!</span></>
          ) : (
            <><Copy size={14} /><span className="text-[10px]">Copy code</span></>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-green-700 dark:text-emerald-300 bg-transparent">{code}</code>
      </div>
    </div>
  );
};

const MarkdownRenderer = ({ content }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`prose ${isLight ? '' : 'prose-invert'} max-w-none 
      prose-p:leading-relaxed prose-p:text-[var(--ag-text-secondary)] prose-p:my-2
      prose-headings:text-[var(--ag-text)] prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-4
      prose-a:text-green-600 dark:prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-[var(--ag-text)] prose-strong:font-bold
      prose-ul:my-4 prose-li:my-1 prose-li:text-[var(--ag-text-secondary)]
      prose-code:text-green-700 dark:prose-code:text-emerald-400 prose-code:bg-green-500/10 dark:prose-code:bg-emerald-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
    `}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            return !inline ? (
              <CodeBlock className={className}>{children}</CodeBlock>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
