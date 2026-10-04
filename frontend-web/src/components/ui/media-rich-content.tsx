"use client";

import React, { type ReactNode } from "react";

/** Safe image verification matching existing security rules */
function isSafeImageUrl(src: string): boolean {
  return (
    /^https?:\/\//i.test(src) ||
    /^\/api\/v1\/public\/media\/[a-fA-F0-9-]{36}$/.test(src)
  );
}

/** Safe link verification */
function isSafeLinkUrl(src: string): boolean {
  return (
    /^https?:\/\//i.test(src) ||
    /^\//.test(src) ||
    /^mailto:/i.test(src)
  );
}

/** Parse inline Markdown formatting: bold, italic, strike, code, link, image */
export function parseInlineMarkdown(text: string): ReactNode[] {
  if (!text) return [];

  const tokens: ReactNode[] = [];
  const regex =
    /(!\[([^\]\n]*)\]\(([^)\s]+)\))|(\[([^\]\n]+)\]\(([^)\s]+)\))|(`([^`\n]+)`)|(\*\*\*([^*]+)\*\*\*)|(\*\*([^*]+)\*\*)|(__([^_]+)__)|(\*([^*]+)\*)|(_([^_]+)_)|(~~([^~]+)~~)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }

    const [
      fullMatch,
      isImg,
      imgAlt,
      imgSrc,
      isLink,
      linkText,
      linkUrl,
      isCode,
      codeContent,
      ,
      boldItalicText,
      boldTextStar,
      boldTextUnder,
      italicTextStar,
      italicTextUnder,
      strikeText,
    ] = [
      match[0],
      match[1],
      match[2],
      match[3],
      match[4],
      match[5],
      match[6],
      match[7],
      match[8],
      match[9],
      match[10],
      match[12],
      match[14],
      match[16],
      match[18],
      match[20],
    ];

    const key = `inline-${match.index}-${lastIndex}`;

    if (isImg) {
      if (isSafeImageUrl(imgSrc)) {
        tokens.push(
          <span key={key} className="inline-block my-2 text-center max-w-full">
            <img
              src={imgSrc}
              alt={imgAlt || "Hình ảnh"}
              loading="lazy"
              className="max-h-[32rem] max-w-full rounded-xl border border-slate-200 dark:border-slate-800 object-contain inline-block shadow-xs"
            />
            {imgAlt && (
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 italic mt-1">
                {imgAlt}
              </span>
            )}
          </span>
        );
      } else {
        tokens.push(fullMatch);
      }
    } else if (isLink) {
      if (isSafeLinkUrl(linkUrl)) {
        tokens.push(
          <a
            key={key}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 underline underline-offset-2 font-medium transition-colors"
          >
            {parseInlineMarkdown(linkText)}
          </a>
        );
      } else {
        tokens.push(linkText);
      }
    } else if (isCode) {
      tokens.push(
        <code
          key={key}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 font-mono text-xs"
        >
          {codeContent}
        </code>
      );
    } else if (boldItalicText) {
      tokens.push(
        <strong
          key={key}
          className="font-bold italic text-slate-900 dark:text-slate-100"
        >
          {boldItalicText}
        </strong>
      );
    } else if (boldTextStar || boldTextUnder) {
      const bContent = boldTextStar || boldTextUnder;
      tokens.push(
        <strong
          key={key}
          className="font-bold text-slate-900 dark:text-slate-100"
        >
          {parseInlineMarkdown(bContent)}
        </strong>
      );
    } else if (italicTextStar || italicTextUnder) {
      const iContent = italicTextStar || italicTextUnder;
      tokens.push(
        <em key={key} className="italic text-slate-800 dark:text-slate-200">
          {parseInlineMarkdown(iContent)}
        </em>
      );
    } else if (strikeText) {
      tokens.push(
        <del key={key} className="line-through text-slate-400">
          {parseInlineMarkdown(strikeText)}
        </del>
      );
    } else {
      tokens.push(fullMatch);
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  return tokens;
}

/** Robust Markdown and Rich Media Content Renderer */
export function MediaRichContent({
  text,
  className = "",
}: {
  text?: string;
  className?: string;
}) {
  if (!text || !text.trim()) {
    return null;
  }

  const lines = text.split("\n");
  const elements: ReactNode[] = [];

  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = "";
  let inBlockquote = false;
  let blockquoteLines: string[] = [];
  let tableLines: string[] = [];

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const key = `list-${elements.length}`;
      if (listType === "ul") {
        elements.push(
          <ul
            key={key}
            className="list-disc list-outside ml-5 sm:ml-6 space-y-1.5 my-3 text-slate-700 dark:text-slate-300"
          >
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed pl-0.5">
                {parseInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol
            key={key}
            className="list-decimal list-outside ml-5 sm:ml-6 space-y-1.5 my-3 text-slate-700 dark:text-slate-300"
          >
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed pl-0.5">
                {parseInlineMarkdown(item)}
              </li>
            ))}
          </ol>
        );
      }
      listItems = [];
      listType = null;
    }
  };

  const flushBlockquote = () => {
    if (blockquoteLines.length > 0) {
      const key = `quote-${elements.length}`;
      elements.push(
        <blockquote
          key={key}
          className="border-l-4 border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 px-4 py-3 my-3.5 rounded-r-2xl text-slate-700 dark:text-slate-300 italic space-y-1"
        >
          {blockquoteLines.map((line, idx) => (
            <p key={idx} className="leading-relaxed text-sm">
              {parseInlineMarkdown(line)}
            </p>
          ))}
        </blockquote>
      );
      blockquoteLines = [];
      inBlockquote = false;
    }
  };

  const flushTable = () => {
    if (tableLines.length >= 2) {
      const key = `table-${elements.length}`;
      const headerRow = tableLines[0]
        .split("|")
        .map((c) => c.trim())
        .filter((c, i, arr) => (i === 0 && c === "" ? false : i === arr.length - 1 && c === "" ? false : true));
      
      const bodyRows = tableLines
        .slice(2)
        .map((row) =>
          row
            .split("|")
            .map((c) => c.trim())
            .filter((c, i, arr) => (i === 0 && c === "" ? false : i === arr.length - 1 && c === "" ? false : true))
        );

      elements.push(
        <div key={key} className="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-200">
              <tr>
                {headerRow.map((cell, idx) => (
                  <th key={idx} className="p-3 border-b border-slate-200 dark:border-slate-700">
                    {parseInlineMarkdown(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 text-slate-700 dark:text-slate-300">
                      {parseInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableLines = [];
    }
  };

  const flushCodeBlock = () => {
    if (codeBlockLines.length > 0) {
      const key = `codeblock-${elements.length}`;
      elements.push(
        <div
          key={key}
          className="my-4 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md text-xs font-mono"
        >
          {codeBlockLang && (
            <div className="bg-slate-800/80 px-4 py-1.5 text-[11px] text-slate-400 font-sans font-semibold uppercase tracking-wider border-b border-slate-700/50">
              {codeBlockLang}
            </div>
          )}
          <pre className="p-4 overflow-x-auto text-slate-100 leading-relaxed">
            <code>{codeBlockLines.join("\n")}</code>
          </pre>
        </div>
      );
      codeBlockLines = [];
      codeBlockLang = "";
      inCodeBlock = false;
    }
  };

  const flushAll = () => {
    flushList();
    flushBlockquote();
    flushTable();
    flushCodeBlock();
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Code block boundaries
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushAll();
        inCodeBlock = true;
        codeBlockLang = trimmed.substring(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Table rows
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList();
      flushBlockquote();
      tableLines.push(trimmed);
      return;
    } else if (tableLines.length > 0) {
      flushTable();
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      flushList();
      inBlockquote = true;
      blockquoteLines.push(trimmed.replace(/^>\s?/, ""));
      return;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    // Unordered list (* item, - item, + item)
    const ulMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (ulMatch) {
      if (listType === "ol") flushList();
      listType = "ul";
      listItems.push(ulMatch[1]);
      return;
    }

    // Ordered list (1. item, 2. item)
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (listType === "ul") flushList();
      listType = "ol";
      listItems.push(olMatch[1]);
      return;
    }

    // If it is not a list line, flush previous lists
    flushList();

    // Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      elements.push(
        <hr
          key={`hr-${index}`}
          className="my-6 border-slate-200 dark:border-slate-800"
        />
      );
      return;
    }

    // Headings
    if (trimmed.startsWith("#### ")) {
      elements.push(
        <h4
          key={`h4-${index}`}
          className="text-base font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2 tracking-tight"
        >
          {parseInlineMarkdown(trimmed.substring(5))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2.5 tracking-tight"
        >
          {parseInlineMarkdown(trimmed.substring(4))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${index}`}
          className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-6 mb-3 pb-1 border-b border-slate-200/80 dark:border-slate-800 tracking-tight"
        >
          {parseInlineMarkdown(trimmed.substring(3))}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1
          key={`h1-${index}`}
          className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-6 mb-3 tracking-tight"
        >
          {parseInlineMarkdown(trimmed.substring(2))}
        </h1>
      );
      return;
    }

    // Standalone Image block
    const standaloneImgMatch = trimmed.match(/^!\[([^\]\n]*)\]\(([^)\s]+)\)$/);
    if (standaloneImgMatch) {
      const alt = standaloneImgMatch[1];
      const src = standaloneImgMatch[2];
      if (isSafeImageUrl(src)) {
        elements.push(
          <figure key={`fig-${index}`} className="my-5 text-center">
            <img
              src={src}
              alt={alt || "Hình ảnh minh họa"}
              loading="lazy"
              className="max-h-[36rem] max-w-full rounded-2xl mx-auto border border-slate-200 dark:border-slate-800 object-contain shadow-sm"
            />
            {alt && (
              <figcaption className="text-xs text-slate-500 dark:text-slate-400 italic mt-2 font-normal">
                {alt}
              </figcaption>
            )}
          </figure>
        );
        return;
      }
    }

    // Paragraph
    if (trimmed) {
      elements.push(
        <p
          key={`p-${index}`}
          className="my-2.5 leading-relaxed text-slate-700 dark:text-slate-300 text-sm sm:text-base font-normal"
        >
          {parseInlineMarkdown(trimmed)}
        </p>
      );
    }
  });

  flushAll();

  return (
    <div className={`rich-markdown-content space-y-1 leading-relaxed ${className}`}>
      {elements}
    </div>
  );
}
