import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const quartzDir = join(root, ".quartz");
if (!existsSync(join(quartzDir, "node_modules"))) {
  throw new Error("请先运行 npm run setup 初始化 Quartz");
}

const changelog = spawnSync(process.execPath, [join(root, "scripts/generate_changelog.mjs")], {
  cwd: root,
  stdio: "inherit",
});
if (changelog.error) throw changelog.error;
if (changelog.status !== 0) process.exit(changelog.status ?? 1);

const serve = process.argv.includes("--serve");
const port = Number(process.env.PORT || 8080);
if (serve && (!Number.isInteger(port) || port < 1 || port > 65535)) {
  throw new Error("PORT 必须是 1 到 65535 之间的整数");
}

const configure = spawnSync(process.execPath, [join(root, "scripts/configure_quartz.mjs")], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, SITE_URL: serve ? `http://localhost:${port}` : process.env.SITE_URL || "http://localhost:8080" },
});
if (configure.error) throw configure.error;
if (configure.status !== 0) process.exit(configure.status ?? 1);

const args = ["quartz/bootstrap-cli.mjs", "build", "-d", "../docs", "-o", "../public"];
if (serve) args.push("--serve", "--port", String(port));
const quartz = spawnSync(process.execPath, args, { cwd: quartzDir, stdio: "inherit" });
if (quartz.error) throw quartz.error;
process.exit(quartz.status ?? 1);
