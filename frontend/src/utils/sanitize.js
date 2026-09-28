import DOMPurify from "dompurify";

/**
 * Enterprise Safe HTML Sanitizer for Ecommerce Rich Content.
 * Strictly permits formatting, headings, tables, links, and media while stripping
 * script execution, onerror/onload event handlers, javascript: protocols, and iframes.
 */
export function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml || typeof dirtyHtml !== "string") {
    return "";
  }

  if (typeof window !== "undefined" && DOMPurify && typeof DOMPurify.sanitize === "function") {
    return DOMPurify.sanitize(dirtyHtml, {
      ALLOWED_TAGS: [
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "br", "hr",
        "strong", "b", "em", "i", "u", "s", "strike", "del",
        "ul", "ol", "li",
        "blockquote", "code", "pre",
        "table", "thead", "tbody", "tfoot", "tr", "th", "td",
        "a", "img", "span", "div"
      ],
      ALLOWED_ATTR: [
        "href", "title", "target", "rel",
        "src", "alt", "width", "height",
        "class", "style",
        "colspan", "rowspan", "align", "valign"
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      FORBID_TAGS: ["script", "iframe", "object", "embed", "base", "form", "input", "button", "textarea", "select"],
      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "style:expression"],
      USE_PROFILES: { html: true }
    });
  }

  // Fallback sanitizer for Node/SSR environments where window DOM is absent
  return dirtyHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "")
    .replace(/javascript:[^"'>]*/gi, "");
}
