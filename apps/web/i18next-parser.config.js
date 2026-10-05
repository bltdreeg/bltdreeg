const fs = require("node:fs");
const path = require("node:path");

const PRESERVE_UNUSED_PREFIXES_FILE = path.join(
  __dirname,
  "i18n-preserve-unused-prefixes.json"
);

function loadPreserveUnusedPrefixes() {
  try {
    const raw = fs.readFileSync(PRESERVE_UNUSED_PREFIXES_FILE, "utf8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter((p) => typeof p === "string" && p.trim().length > 0);
  } catch {
    return [];
  }
}

const preserveUnusedPrefixes = loadPreserveUnusedPrefixes();
const PRUNE_UNUSED_KEYS = false;

function isKeyPreserved(key) {
  return preserveUnusedPrefixes.some(
    (prefix) => key === prefix || key.startsWith(`${prefix}.`)
  );
}

module.exports = {
  input: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!src/i18n/**"],
  // ponytail: NEVER point this at src/i18n/messages/*.json directly.
  // i18next-parser can't see the namespace prefix passed to next-intl's
  // useTranslations("some.scope") — it only sees the bare key in t("key"),
  // so every scoped key gets rewritten as a duplicate empty key at the
  // JSON root, and any {count, plural, ...} ICU value gets exploded into
  // broken empty _zero/_one/_two/_few/_many/_other siblings. Both already
  // happened once and had to be cleaned up by hand. Scan into a throwaway
  // folder and treat it as a "what's new" report, not a file to merge in.
  output: ".i18n-scan/$LOCALE.json",
  locales: ["ar", "en"],
  defaultNamespace: "translation",
  defaultValue: "",
  keySeparator: false, // flat dotted keys, don't split "a.b" into nested a: { b }
  namespaceSeparator: false,
  lexers: {
    ts: ["JavascriptLexer"],
    tsx: ["JsxLexer"],
  },
  // keepRemoved: keys i18next-parser would otherwise drop because it no
  // longer finds a matching t() call. true keeps everything; here we only
  // keep prefixes explicitly listed in i18n-preserve-unused-prefixes.json.
  keepRemoved: PRUNE_UNUSED_KEYS ? (key) => isKeyPreserved(key) : true,
  sort: false,
  createOldCatalogs: false,
  failOnWarnings: false,
  verbose: false,
};
