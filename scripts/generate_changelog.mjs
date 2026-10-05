import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = join(root, "docs/changelog.md");

let raw;
try {
  raw = execFileSync(
    "git",
    ["log", "--date=short", "--pretty=format:%H%x09%ad%x09%s"],
    { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  ).trim();
} catch {
  process.exit(0);
}

if (!raw) process.exit(0);

const repository = process.env.GITHUB_REPOSITORY;
const serverUrl = (process.env.GITHUB_SERVER_URL || "https://github.com").replace(/\/$/, "");
const commits = raw.split("\n").map((line) => {
  const [sha, date, ...subjectParts] = line.split("\t");
  return { sha, date, subject: subjectParts.join("\t") };
});
const groups = new Map();
for (const commit of commits) {
  if (!groups.has(commit.date)) groups.set(commit.date, []);
  groups.get(commit.date).push(commit);
}

const escapeMarkdown = (value) => value.replace(/[\\[\]]/g, "\\$&");
const lines = [
  "---",
  "title: 更新日志",
  "status: unread",
  "---",
  "",
  "# 更新日志",
  "",
  "本页由构建流程根据仓库提交自动生成。",
  "",
];
for (const [date, entries] of groups) {
  lines.push(`## ${date}`, "");
  for (const { sha, subject } of entries) {
    const label = escapeMarkdown(subject || "（无提交说明）");
    const target = repository ? `${serverUrl}/${repository}/commit/${sha}` : null;
    const commit = target ? `[${label}](${target})` : label;
    lines.push(`- ${commit} (\`${sha.slice(0, 7)}\`)`);
  }
  lines.push("");
}

writeFileSync(outputPath, lines.join("\n"), "utf8");
