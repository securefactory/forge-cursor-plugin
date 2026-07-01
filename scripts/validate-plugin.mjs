#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const errors = [];
const warnings = [];

const pluginNamePattern = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(filePath, context) {
  let raw;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    addError(`${context} is missing: ${filePath}`);
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    addError(`${context} contains invalid JSON (${filePath}): ${error.message}`);
    return null;
  }
}

function normalizeNewlines(content) {
  return content.replace(/\r\n/g, "\n");
}

function parseFrontmatter(content) {
  const normalized = normalizeNewlines(content);
  if (!normalized.startsWith("---\n")) {
    return null;
  }

  const closingIndex = normalized.indexOf("\n---\n", 4);
  if (closingIndex === -1) {
    return null;
  }

  const frontmatterBlock = normalized.slice(4, closingIndex);
  const fields = {};

  for (const line of frontmatterBlock.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    fields[key] = value;
  }

  return fields;
}

async function walkFiles(dirPath) {
  const files = [];
  const stack = [dirPath];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.isFile()) {
        files.push(entryPath);
      }
    }
  }

  return files;
}

function isSafeRelativePath(value) {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return true;
  }
  if (path.isAbsolute(value)) {
    return false;
  }
  const normalized = path.posix.normalize(value.replace(/\\/g, "/"));
  return !normalized.startsWith("../") && normalized !== "..";
}

function extractPathValues(value) {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => extractPathValues(entry));
  }

  if (value && typeof value === "object") {
    const candidates = [];
    if (typeof value.path === "string") {
      candidates.push(value.path);
    }
    if (typeof value.file === "string") {
      candidates.push(value.file);
    }
    return candidates;
  }

  return [];
}

function resolvePluginDir(pluginRootPrefix, source) {
  if (pluginRootPrefix) {
    return path.join(repoRoot, pluginRootPrefix, source);
  }
  return path.join(repoRoot, source);
}

async function validateReferencedPath(fieldName, pathValue, pluginName, pluginDir) {
  if (pathValue.startsWith("http://") || pathValue.startsWith("https://")) {
    return;
  }

  if (!isSafeRelativePath(pathValue)) {
    addError(
      `${pluginName}: field "${fieldName}" has invalid path "${pathValue}". Use a relative path without ".." or absolute prefixes.`
    );
    return;
  }

  const resolved = path.resolve(pluginDir, pathValue);
  const exists = await pathExists(resolved);
  if (!exists) {
    addError(`${pluginName}: field "${fieldName}" references missing path "${pathValue}".`);
  }
}

async function validateFrontmatterFile(filePath, componentName, requiredKeys, pluginName) {
  const content = await fs.readFile(filePath, "utf8");
  const parsed = parseFrontmatter(content);
  const relativeFile = path.relative(repoRoot, filePath);

  if (!parsed) {
    addError(`${pluginName}: ${componentName} file missing YAML frontmatter: ${relativeFile}`);
    return;
  }

  for (const key of requiredKeys) {
    if (!parsed[key] || parsed[key].length === 0) {
      addError(`${pluginName}: ${componentName} file missing "${key}" in frontmatter: ${relativeFile}`);
    }
  }
}

function resolveHookCommandPath(command) {
  if (typeof command !== "string") {
    return null;
  }
  const stripped = command
    .replace(/\$\{CURSOR_PLUGIN_ROOT\}/g, "")
    .replace(/^\.\//, "")
    .replace(/^\/+/, "");
  return stripped.length > 0 ? stripped : null;
}

const FORGE_COMMANDS = [
  "forge-connect",
  "forge-status",
  "forge-context",
  "forge-artifacts",
  "forge-orders",
  "forge-sync",
  "work",
  "start-work",
];

const FORGE_MCP_TOOLS = [
  "set_project",
  "list_my_projects",
  "list_linked_repos",
  "link_repo",
  "get_project_state",
  "configure_repo",
  "get_artifact",
  "list_ux_references",
  "search_artifacts",
  "list_work_orders",
  "get_work_order",
  "get_next_work_order",
  "update_work_order",
  "transition_work_order",
  "complete_work_order",
  "get_workflow_stages",
  "get_work_order_stats",
  "prepare_commit",
  "create_pull_request",
  "ask_question",
  "get_clarifications",
  "comment_on_work_order",
  "reply_to_work_order_comment",
  "get_work_order_comments",
  "sync_dev_activity",
  "validate_dev_activity_sync",
  "replay_dev_activity",
];

async function validateForgeMcpToolDocumentation(pluginName, pluginDir) {
  const docPaths = [
    path.join(pluginDir, "agents", "forge-agent.md"),
    ...["work-orders", "dev-activity", "project-context"].map((skill) =>
      path.join(pluginDir, "skills", skill, "SKILL.md"),
    ),
  ];

  const combined = [];
  for (const docPath of docPaths) {
    if (!(await pathExists(docPath))) {
      addError(`${pluginName}: MCP tool docs file missing: ${path.relative(repoRoot, docPath)}`);
      continue;
    }
    combined.push(await fs.readFile(docPath, "utf8"));
  }

  const corpus = combined.join("\n");
  const missing = FORGE_MCP_TOOLS.filter((tool) => !corpus.includes(`\`${tool}\``));

  if (missing.length > 0) {
    addError(
      `${pluginName}: MCP tool names missing from agent/skills docs: ${missing.join(", ")}`,
    );
  }
}

async function validateHookCommands(pluginRoot, pluginName) {
  const hooksPath = path.join(pluginRoot, "hooks", "hooks.json");
  const hooksConfig = await readJsonFile(hooksPath, "Hooks config");
  if (!hooksConfig?.hooks || typeof hooksConfig.hooks !== "object") {
    return;
  }

  for (const [eventName, entries] of Object.entries(hooksConfig.hooks)) {
    if (!Array.isArray(entries)) {
      continue;
    }
    for (const [index, entry] of entries.entries()) {
      if (!entry?.command) {
        continue;
      }
      const relativePath = resolveHookCommandPath(entry.command);
      if (!relativePath) {
        addError(`${pluginName}: hooks.${eventName}[${index}] command is empty or invalid.`);
        continue;
      }
      const resolved = path.join(pluginRoot, relativePath);
      if (!(await pathExists(resolved))) {
        addError(
          `${pluginName}: hooks.${eventName}[${index}] references missing script "${relativePath}".`
        );
        continue;
      }
      try {
        const stat = await fs.stat(resolved);
        if (!stat.isFile()) {
          addError(`${pluginName}: hooks.${eventName}[${index}] is not a file: ${relativePath}`);
          continue;
        }
        if ((stat.mode & 0o111) === 0 && relativePath.endsWith(".sh")) {
          addWarning(`${pluginName}: hook script is not executable: ${relativePath}`);
        }
      } catch {
        addError(`${pluginName}: hooks.${eventName}[${index}] cannot stat script: ${relativePath}`);
      }
    }
  }
}

async function validateComponentFrontmatter(pluginName, pluginDir) {
  const rulesDir = path.join(pluginDir, "rules");
  if (await pathExists(rulesDir)) {
    const files = await walkFiles(rulesDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext === ".md" || ext === ".mdc" || ext === ".markdown") {
        await validateFrontmatterFile(file, "rule", ["description"], pluginName);
      }
    }
  }

  const skillsDir = path.join(pluginDir, "skills");
  if (await pathExists(skillsDir)) {
    const files = await walkFiles(skillsDir);
    for (const file of files) {
      if (path.basename(file) === "SKILL.md") {
        await validateFrontmatterFile(file, "skill", ["name", "description"], pluginName);
      }
    }
  }

  const agentsDir = path.join(pluginDir, "agents");
  if (await pathExists(agentsDir)) {
    const files = await walkFiles(agentsDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext === ".md" || ext === ".mdc" || ext === ".markdown") {
        await validateFrontmatterFile(file, "agent", ["name", "description"], pluginName);
      }
    }
  }

  const commandsDir = path.join(pluginDir, "commands");
  if (await pathExists(commandsDir)) {
    const files = await walkFiles(commandsDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext === ".md" || ext === ".mdc" || ext === ".markdown" || ext === ".txt") {
        await validateFrontmatterFile(file, "command", ["name", "description"], pluginName);
      }
    }
  }
}

async function validateUserGuideHtml() {
  const guidePath = path.join(repoRoot, "docs", "forge-plugin-guide.html");
  if (!(await pathExists(guidePath))) {
    addError("docs/forge-plugin-guide.html is missing.");
    return;
  }

  const html = await fs.readFile(guidePath, "utf8");
  const missingCommands = FORGE_COMMANDS.filter((name) => !html.includes(`/${name}`));
  const missingTools = FORGE_MCP_TOOLS.filter((tool) => !html.includes(`<code>${tool}</code>`) && !html.includes(`>${tool}<`));

  if (missingCommands.length > 0) {
    addError(`forge-plugin-guide.html missing slash commands: ${missingCommands.join(", ")}`);
  }
  if (missingTools.length > 0) {
    addError(`forge-plugin-guide.html missing MCP tools: ${missingTools.join(", ")}`);
  }
}

async function validatePlugin(pluginDir, pluginManifest) {
  const pluginName = pluginManifest.name ?? path.basename(pluginDir);

  if (typeof pluginManifest.name !== "string" || !pluginNamePattern.test(pluginManifest.name)) {
    addError(
      `${pluginName}: "name" in plugin.json must be lowercase and use only alphanumerics, hyphens, and periods.`
    );
  }

  const manifestFields = ["logo", "rules", "skills", "agents", "commands", "hooks"];
  for (const field of manifestFields) {
    const values = extractPathValues(pluginManifest[field]);
    for (const value of values) {
      await validateReferencedPath(field, value, pluginName, pluginDir);
    }
  }

  await validateComponentFrontmatter(pluginName, pluginDir);

  if (pluginManifest.author && typeof pluginManifest.author === "object") {
    const allowedAuthorKeys = new Set(["name", "email"]);
    for (const key of Object.keys(pluginManifest.author)) {
      if (!allowedAuthorKeys.has(key)) {
        addError(`${pluginName}: author.${key} is not allowed in plugin.json (use homepage for URLs).`);
      }
    }
  }

  if (!pluginManifest.category) {
    addWarning(`${pluginName}: "category" is missing in plugin.json (recommended for marketplace).`);
  }

  if (!Array.isArray(pluginManifest.tags) || pluginManifest.tags.length === 0) {
    addWarning(`${pluginName}: "tags" array is missing or empty in plugin.json (recommended for marketplace).`);
  }

  await validateHookCommands(pluginDir, pluginName);

  if (pluginName === "forge") {
    await validateForgeMcpToolDocumentation(pluginName, pluginDir);
  }

  const hooksPath = path.join(pluginDir, "hooks", "hooks.json");
  if (!(await pathExists(hooksPath))) {
    addWarning(`${pluginName}: no hooks/hooks.json file found (only needed when using hooks).`);
  }
}

async function main() {
  const marketplacePath = path.join(repoRoot, ".cursor-plugin", "marketplace.json");
  const marketplace = await readJsonFile(marketplacePath, "Marketplace manifest");
  if (!marketplace) {
    summarizeAndExit();
    return;
  }

  const pluginRootPrefix = marketplace.metadata?.pluginRoot ?? "";

  if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) {
    addError("marketplace.json must list at least one plugin in \"plugins\".");
    summarizeAndExit();
    return;
  }

  for (const entry of marketplace.plugins) {
    if (typeof entry?.source !== "string" || entry.source.includes("/") || entry.source.startsWith(".")) {
      addError(
        `marketplace.json plugin "${entry?.name ?? "unknown"}" has invalid source "${entry?.source}". Use a bare directory name (e.g. "forge").`
      );
      continue;
    }

    const pluginDir = resolvePluginDir(pluginRootPrefix, entry.source);
    const manifestPath = path.join(pluginDir, ".cursor-plugin", "plugin.json");
    const relativeManifest = path.join(
      pluginRootPrefix ? path.join(pluginRootPrefix, entry.source) : entry.source,
      ".cursor-plugin/plugin.json",
    );

    if (!(await pathExists(manifestPath))) {
      addError(
        `marketplace.json source "${entry.source}" must contain .cursor-plugin/plugin.json at ${relativeManifest}.`
      );
      continue;
    }

    const pluginManifest = await readJsonFile(manifestPath, `Plugin manifest (${entry.source})`);
    if (pluginManifest) {
      await validatePlugin(pluginDir, pluginManifest);
    }
  }

  const licensePath = path.join(repoRoot, "LICENSE");
  if (!(await pathExists(licensePath))) {
    addError("LICENSE file is missing at repo root.");
  }

  await validateUserGuideHtml();

  summarizeAndExit();
}

function summarizeAndExit() {
  if (warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
    console.log("");
  }

  if (errors.length > 0) {
    console.error("Validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Validation passed.");
}

await main();
