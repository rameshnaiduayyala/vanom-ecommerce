import React from "react";

/**
 * Clean Read-Only Tiptap / Rich-Text Content Viewer.
 * Renders HTML created with Tiptap with full typography, table, color & highlight styles.
 */
export function TiptapViewer({ content = "", className = "" }) {
  if (!content) return null;

  const isHtml =
    content &&
    (content.includes("<p>") ||
      content.includes("<ul>") ||
      content.includes("<h1>") ||
      content.includes("<h2>") ||
      content.includes("<h3>") ||
      content.includes("<ol>") ||
      content.includes("<table>") ||
      content.includes("<span>") ||
      content.includes("<strong>"));

  if (isHtml) {
    return (
      <div
        className={`tiptap text-sm text-slate-700 leading-relaxed max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className={`text-sm text-slate-700 leading-relaxed whitespace-pre-line ${className}`}>
      {content}
    </div>
  );
}

export default TiptapViewer;
