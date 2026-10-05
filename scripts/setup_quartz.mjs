import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const quartzDir = join(root, ".quartz");
const commit = "d25a6eabf96751ffca56f8a8139272def7a65041";
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32" && command === npm,
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!existsSync(join(quartzDir, ".git"))) {
  if (existsSync(quartzDir)) {
    throw new Error(".quartz 已存在但不是 Quartz Git 仓库，请先检查该目录");
  }
  run("git", ["clone", "--depth", "1", "--branch", "v4", "https://github.com/jackyzha0/quartz.git", quartzDir]);
}

const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: quartzDir, encoding: "utf8" });
if (head.error) throw head.error;
if (head.status !== 0) process.exit(head.status ?? 1);
if (head.stdout.trim() !== commit) {
  run("git", ["fetch", "--depth", "1", "origin", commit], { cwd: quartzDir });
  run("git", ["checkout", "--detach", "FETCH_HEAD"], { cwd: quartzDir });
}

if (!existsSync(join(quartzDir, "node_modules"))) {
  run(npm, ["ci"], { cwd: quartzDir });
}

console.log("Quartz 本地环境已就绪。运行 npm run dev 预览。");
