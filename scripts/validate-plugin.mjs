#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const pluginDir = repoRoot;
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

async function validateReferencedPath(fieldName, pathValue, pluginName) {
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

async function validateComponentFrontmatter(pluginName) {
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

async function main() {
  const manifestPath = path.join(pluginDir, ".cursor-plugin", "plugin.json");
  const pluginManifest = await readJsonFile(manifestPath, "Plugin manifest");
  if (!pluginManifest) {
    summarizeAndExit();
    return;
  }

  const pluginName = pluginManifest.name ?? "forge";

  if (typeof pluginManifest.name !== "string" || !pluginNamePattern.test(pluginManifest.name)) {
    addError(
      '"name" in plugin.json must be lowercase and use only alphanumerics, hyphens, and periods.'
    );
  }

  const manifestFields = ["logo", "rules", "skills", "agents", "commands", "hooks", "mcpServers"];
  for (const field of manifestFields) {
    const values = extractPathValues(pluginManifest[field]);
    for (const value of values) {
      await validateReferencedPath(field, value, pluginName);
    }
  }

  await validateComponentFrontmatter(pluginName);

  const licensePath = path.join(pluginDir, "LICENSE");
  if (!(await pathExists(licensePath))) {
    addError(`${pluginName}: LICENSE file is missing at repo root.`);
  }

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

  const hooksPath = path.join(pluginDir, "hooks", "hooks.json");
  if (!(await pathExists(hooksPath))) {
    addWarning(`${pluginName}: no hooks/hooks.json file found (only needed when using hooks).`);
  }

  const mcpManifestValues = extractPathValues(pluginManifest.mcpServers);
  if (mcpManifestValues.length > 0) {
    const mcpPath = path.join(pluginDir, "mcp.json");
    if (!(await pathExists(mcpPath))) {
      addWarning(`${pluginName}: plugin.json references mcpServers but mcp.json is missing.`);
    }
  }

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
