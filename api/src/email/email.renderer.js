import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import mjml2html from "mjml";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.join(__dirname, "templates");
const logoFilePath = path.resolve(__dirname, "../../assets/logo.png");

function resolveLogoUrl() {
  const assetBase = (env.assetPublicUrl || "").replace(/\/$/, "");
  const isLocalhost = !assetBase || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(assetBase);
  if (isLocalhost && fs.existsSync(logoFilePath)) {
    return "cid:vanom-logo";
  }
  return `${assetBase}/logo.png`;
}

// Cache compiled template functions for fast in-memory execution
const templateCache = new Map();

// Register all reusable partials under templates/common/ (e.g. cta-button.html -> commonCtaButton)
const commonDir = path.join(templatesDir, "common");
if (fs.existsSync(commonDir)) {
  for (const fileName of fs.readdirSync(commonDir)) {
    if (!fileName.endsWith(".html")) continue;
    const baseName = fileName.replace(/\.html$/, "");
    const camelName = baseName.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
    const partialName = `common${camelName.charAt(0).toUpperCase()}${camelName.slice(1)}`;
    const partialSource = fs.readFileSync(path.join(commonDir, fileName), "utf-8");
    Handlebars.registerPartial(partialName, Handlebars.compile(partialSource));
  }
}

// Load base layout
const baseLayoutPath = path.join(templatesDir, "layouts", "base.html");
let baseLayoutTemplate = null;
function getBaseLayout() {
  if (!baseLayoutTemplate) {
    const baseSource = fs.readFileSync(baseLayoutPath, "utf-8");
    baseLayoutTemplate = Handlebars.compile(baseSource);
  }
  return baseLayoutTemplate;
}

/**
 * Loads and compiles an MJML sub-template, wrapping it in the base MJML layout,
 * and compiling to clean, bulletproof email HTML using MJML.
 *
 * @param {string} relativeTemplatePath e.g. "auth/welcome.html"
 * @param {object} data Variables passed to Handlebars
 * @returns {Promise<{ html: string, text: string }>}
 */
export async function renderEmail(relativeTemplatePath, data = {}) {
  const normalizedPath = relativeTemplatePath.replace(/\\/g, "/");

  let compiled = templateCache.get(normalizedPath);
  if (!compiled) {
    const fullPath = path.join(templatesDir, normalizedPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Email template not found: ${fullPath}`);
    }
    const templateSource = fs.readFileSync(fullPath, "utf-8");
    compiled = Handlebars.compile(templateSource);
    templateCache.set(normalizedPath, compiled);
  }

  // Merge default globals
  const viewData = {
    currentYear: new Date().getFullYear(),
    logoUrl: resolveLogoUrl(),
    storeUrl: env.clientUrl || "http://localhost:5173",
    ...data,
  };

  // 1. Render child template to MJML markup
  const bodyContent = compiled(viewData);

  // 2. Wrap within Base Layout
  const baseLayout = getBaseLayout();
  const fullMjml = baseLayout({
    ...viewData,
    bodyContent,
  });

  // 3. Compile MJML to responsive HTML email (mjml function returns a Promise or object)
  const result = await mjml2html(fullMjml, {
    validationLevel: "soft",
    minify: false,
  });
  const html = result?.html || "";

  if (result?.errors && result.errors.length > 0 && process.env.NODE_ENV !== "production") {
    result.errors.forEach((err) => console.warn(`[mjml-warning] ${err.formattedMessage}`));
  }

  // 4. Generate plain text fallback
  const text = (data.preview ? `${data.preview}\n\n` : "") +
    html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  return { html, text };
}
