import sanitizeHtml from "sanitize-html";

/**
 * Sanitize admin-authored rich-text/HTML before storing it. The blog renders
 * this content with dangerouslySetInnerHTML, so it must never contain scripts,
 * event handlers, or dangerous URL schemes.
 */
export function sanitizeRichText(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr", "blockquote", "pre", "code",
      "strong", "em", "b", "i", "u", "s", "span",
      "ul", "ol", "li",
      "a", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      span: ["class"],
      "*": ["dir"],
    },
    // Only safe URL schemes; blocks javascript:, data: (except images), etc.
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      // Force external links to be safe.
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
    },
  });
}
