import { readFileSync, writeFileSync } from "node:fs";

const pagesUrl = process.env.SITE_URL;
if (!pagesUrl) {
  throw new Error("SITE_URL is required to build Quartz links");
}

const parsedUrl = new URL(pagesUrl);
const baseUrl = `${parsedUrl.host}${parsedUrl.pathname.replace(/\/$/, "")}`;
const quartzDir = process.env.QUARTZ_DIR ?? ".quartz";
const configPath = `${quartzDir}/quartz.config.ts`;
const source = readFileSync(configPath, "utf8");
const replacements = [
  [/baseUrl:\s*["'][^"']*["']/, `baseUrl: ${JSON.stringify(baseUrl)}`],
  [/pageTitle:\s*["'][^"']*["']/, 'pageTitle: "求是潮产品研发中心内训仓库"'],
  [/locale:\s*["'][^"']*["']/, 'locale: "zh-CN"'],
  [/analytics:\s*(?:\{\s*provider:\s*["']plausible["'],?\s*\}|null)/, "analytics: null"],
  [/fontOrigin:\s*["'](?:googleFonts|local)["']/, 'fontOrigin: "local"'],
  [/priority:\s*\["frontmatter",\s*(?:"git",\s*)?"filesystem"\]/, 'priority: ["frontmatter", "filesystem"]'],
  [/Plugin\.ObsidianFlavoredMarkdown\(\{\s*enableInHtmlEmbed:\s*false(?:,\s*mermaid:\s*false)?\s*\}\)/, "Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false, mermaid: false })"],
  [/ignorePatterns:\s*\["private",\s*"templates",\s*"\.obsidian"(?:,\s*"notes\/\*\*")?\]/, 'ignorePatterns: ["private", "templates", ".obsidian", "notes/**"]'],
];
let updated = source;
for (const [pattern, replacement] of replacements) {
  if (!pattern.test(updated)) {
    throw new Error(`Quartz config format changed: ${pattern}`);
  }
  updated = updated.replace(pattern, replacement);
}

updated = updated.replace(/Plugin\.CustomOgImages\(\),?/, "");
updated = updated.replace(/Plugin\.Latex\(\{\s*renderEngine:\s*["']katex["']\s*\}\),?/, "");
writeFileSync(configPath, updated);

const routes = {
  "求是潮产品研发中心内训仓库": "index",
  "product-operations/产品运营方向": "product-operations/index",
  "technical-development/技术研发方向": "technical-development/index",
  "产研内训方式与整体介绍": "training-overview",
  "组织与协作": "team-workflow",
};
const routePath = `${quartzDir}/quartz/util/path.ts`;
let routeSource = readFileSync(routePath, "utf8");
const slugOriginal = "let slug = sluggify(withoutFileExt)";
const slugReplacement = `let slug = (${JSON.stringify(routes)} as Record<string, string>)[withoutFileExt] ?? sluggify(withoutFileExt)`;
const slugConfigured = /let slug = .*?\?\? sluggify\(withoutFileExt\)/;
if (slugConfigured.test(routeSource)) {
  routeSource = routeSource.replace(slugConfigured, slugReplacement);
} else if (routeSource.includes(slugOriginal)) {
  routeSource = routeSource.replace(slugOriginal, slugReplacement);
} else {
  throw new Error("Quartz slug format changed");
}

const routeTargets = Object.fromEntries(
  Object.entries(routes).map(([file, slug]) => [`${file}.md`, slug]),
);
const linkOriginal = "let targetSlug = transformInternalLink(target)";
const linkReplacement = `const routeTarget = (${JSON.stringify(routeTargets)} as Record<string, FullSlug>)[decodeURIComponent(new URL(target, \`https://quartz.local/\${src}\`).pathname.slice(1))]
  if (routeTarget) return (resolveRelative(src, routeTarget) + splitAnchor(target)[1]) as RelativeURL
  let targetSlug = transformInternalLink(target)`;
const routeTargetStart = routeSource.indexOf("const routeTarget = ");
const targetSlugMarker = "  let targetSlug = transformInternalLink(target)";
const targetSlugStart = routeSource.indexOf(targetSlugMarker, routeTargetStart);
if (routeTargetStart >= 0 && targetSlugStart > routeTargetStart) {
  routeSource = `${routeSource.slice(0, routeTargetStart)}${linkReplacement}${routeSource.slice(targetSlugStart + targetSlugMarker.length)}`;
} else if (routeSource.includes(linkOriginal)) {
  routeSource = routeSource.replace(linkOriginal, linkReplacement);
} else {
  throw new Error("Quartz link format changed");
}
writeFileSync(routePath, routeSource);

const breadcrumbsPath = `${quartzDir}/quartz/components/Breadcrumbs.tsx`;
const breadcrumbs = readFileSync(breadcrumbsPath, "utf8");
const breadcrumbsPattern = /rootName:\s*["'][^"']*["']/;
if (!breadcrumbsPattern.test(breadcrumbs)) {
  throw new Error("Quartz breadcrumbs format changed");
}
const updatedBreadcrumbs = breadcrumbs.replace(
  breadcrumbsPattern,
  'rootName: "求是潮产品研发中心内训仓库"',
);
if (updatedBreadcrumbs !== breadcrumbs) writeFileSync(breadcrumbsPath, updatedBreadcrumbs);

const headPath = `${quartzDir}/quartz/components/Head.tsx`;
const head = readFileSync(headPath, "utf8");
const preconnect = '<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />';
if (head.includes(preconnect)) {
  writeFileSync(headPath, head.replace(preconnect, ""));
}

const handlerPath = `${quartzDir}/quartz/cli/handlers.js`;
const handler = readFileSync(handlerPath, "utf8");
const localServer = 'server.listen(argv.port, "127.0.0.1")';
const localWebSocket = 'new WebSocketServer({ port: argv.wsPort, host: "127.0.0.1" })';
if (!handler.includes("server.listen(argv.port)") && !handler.includes(localServer)) {
  throw new Error("Quartz preview server format changed");
}
if (!handler.includes("new WebSocketServer({ port: argv.wsPort })") && !handler.includes(localWebSocket)) {
  throw new Error("Quartz preview WebSocket format changed");
}
writeFileSync(
  handlerPath,
  handler
    .replace("server.listen(argv.port)", localServer)
    .replace("new WebSocketServer({ port: argv.wsPort })", localWebSocket),
);
