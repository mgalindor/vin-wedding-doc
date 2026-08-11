#!/usr/bin/env node
/**
 * upgrade-kit.js
 *
 * Compares files from a `temp/` folder against the current workspace.
 * Scans: *.instructions.md, *.agent.md, *.prompt.md, SKILL.md
 * Folders compared: defined in FOLDERS_TO_COMPARE
 *
 * Rules:
 *   - temp version > workspace version  →  replace file (or entire skill folder for SKILL.md)
 *   - file missing in workspace          →  copy file (or entire skill folder for SKILL.md)
 *   - workspace version > temp version   →  print warning
 *   - same version                       →  skip
 *
 * Special rule for SKILL.md:
 *   Version is read only from SKILL.md, but the entire parent skill folder
 *   is replaced / copied when an update is needed.
 *
 * Force-copy folders (FORCE_COPY_FOLDERS):
 *   Folders listed here are always copied recursively from temp/ to workspace
 *   without version checking. Use for non-versioned assets like scripts and hooks.
 *
 * Self-update: if temp/upgrade-kit.js exists and has a higher SCRIPT_VERSION,
 *   the script replaces itself (new version takes effect on the next run).
 *
 * Temp folder is deleted at the end of a successful run.
 *
 * No external dependencies required.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const WORKSPACE_ROOT     = __dirname;
const TEMP_DIR           = path.join(WORKSPACE_ROOT, 'temp');
const FOLDERS_TO_COMPARE = ['.gene2', '.github'];

/** Current version of this script — used for self-update checks */
const SCRIPT_VERSION = '1.1.0';

/**
 * Sub-paths (relative to WORKSPACE_ROOT) that are always overwritten from temp/
 * without version checking. Useful for .js, .json, and other non-versioned assets.
 * Paths use forward slashes and are matched against temp/<path>.
 */
const FORCE_COPY_FOLDERS = [
  '.gene2/scripts',
  '.gene2/hooks',
  '.gene2/dashboard',
];

/**
 * File patterns for individual-file comparison.
 * SKILL.md is intentionally excluded — skills are handled at folder level.
 */
const FILE_PATTERNS = [
  /\.instructions\.md$/,
  /\.agent\.md$/,
  /\.prompt\.md$/,
  /^copilot-instructions\.md$/,
];

// ---------------------------------------------------------------------------
// ANSI helpers
// ---------------------------------------------------------------------------

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  dim:    '\x1b[2m',
};

function fmt(color, text) { return `${color}${text}${C.reset}`; }

// ---------------------------------------------------------------------------
// File / directory helpers
// ---------------------------------------------------------------------------

function isTrackedFile(filename) {
  return FILE_PATTERNS.some(p => p.test(filename));
}

/**
 * Recursively collect all tracked individual files under `dir`.
 * SKILL.md files are excluded here — skills are handled separately.
 */
function findTrackedFiles(dir, baseDir) {
  baseDir = baseDir || dir;
  const results = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findTrackedFiles(fullPath, baseDir));
    } else if (entry.isFile() && isTrackedFile(entry.name)) {
      results.push({ fullPath, relativePath: path.relative(baseDir, fullPath) });
    }
  }
  return results;
}

/**
 * Find all SKILL.md files under `dir`.
 * Returns: { skillMdPath, skillFolderPath, relativeFolderPath }
 */
function findSkillFiles(dir, baseDir) {
  baseDir = baseDir || dir;
  const results = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSkillFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name === 'SKILL.md') {
      results.push({
        skillMdPath:        fullPath,
        skillFolderPath:    path.dirname(fullPath),
        relativeFolderPath: path.relative(baseDir, path.dirname(fullPath)),
      });
    }
  }
  return results;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

/** Recursively copy src directory into dest (created if missing) */
function copyDirRecursive(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src,  entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/** Remove dest folder entirely and replace with src */
function replaceFolder(src, dest) {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  copyDirRecursive(src, dest);
}

/** Recursively delete a directory */
function deleteDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// YAML frontmatter parser (no external dependencies)
// ---------------------------------------------------------------------------

function extractFrontmatterYaml(content) {
  // Strip UTF-8 BOM (added by some editors and PowerShell Out-File)
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  if (!content.startsWith('---')) return null;
  const end = content.indexOf('\n---', 3);
  if (end === -1) return null;
  return content.slice(4, end);
}

/**
 * Returns { version: string } from the `metadata.version` field, or null.
 */
function parseVersion(content) {
  const yaml = extractFrontmatterYaml(content);
  if (!yaml) return null;

  const metaIndex = yaml.search(/^metadata\s*:/m);
  if (metaIndex === -1) return null;

  const afterMeta  = yaml.slice(metaIndex + yaml.slice(metaIndex).indexOf('\n') + 1);
  const blockLines = [];
  for (const line of afterMeta.split('\n')) {
    if (line === '' || /^\s/.test(line)) {
      blockLines.push(line);
    } else {
      break;
    }
  }

  const block = blockLines.join('\n');
  const match = block.match(/version\s*:\s*["']?([0-9]+(?:\.[0-9]+)*(?:-[^\s"']+)?)["']?/);
  if (!match) return null;

  return { version: match[1].trim() };
}

/**
 * Parse the SCRIPT_VERSION constant from a .js file.
 * Looks for:  const SCRIPT_VERSION = '1.2.3';
 */
function parseScriptVersion(content) {
  const match = content.match(/const\s+SCRIPT_VERSION\s*=\s*['"](\d+\.\d+\.\d+)['"]/);
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// Semantic version comparison
// ---------------------------------------------------------------------------

/**
 * Returns  1  if a > b
 *         -1  if a < b
 *          0  if equal
 */
function compareVersions(a, b) {
  const normalize = v => v.replace(/-.*$/, '').split('.').map(Number);
  const partsA = normalize(a);
  const partsB = normalize(b);
  const len = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    const na = partsA[i] || 0;
    const nb = partsB[i] || 0;
    if (na > nb) return  1;
    if (na < nb) return -1;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Main logic
// ---------------------------------------------------------------------------

function main() {
  console.log(fmt(C.bold, '\n╔══════════════════════════════╗'));
  console.log(fmt(C.bold, '║        Upgrade Kit           ║'));
  console.log(fmt(C.bold, '╚══════════════════════════════╝'));
  console.log(`  Workspace : ${WORKSPACE_ROOT}`);
  console.log(`  Temp dir  : ${TEMP_DIR}`);
  console.log(`  Script v  : ${SCRIPT_VERSION}\n`);

  if (!fs.existsSync(TEMP_DIR)) {
    console.error(fmt(C.red, `ERROR: temp/ folder not found at ${TEMP_DIR}`));
    console.error(fmt(C.red, '       Place the kit files inside temp/ and re-run.'));
    process.exit(1);
  }

  // Detailed change log for final summary
  const changes = { added: [], replaced: [], warnings: [] };
  const stats   = { skipped: 0, noVersion: 0 };

  // ── Self-update check (temp/upgrade-kit.js) ────────────────────────────
  console.log(fmt(C.cyan + C.bold, '▶ upgrade-kit.js (self-update check)'));
  const tempScriptPath = path.join(TEMP_DIR, 'upgrade-kit.js');

  if (!fs.existsSync(tempScriptPath)) {
    console.log(fmt(C.dim, '  (no upgrade-kit.js in temp — skipping)\n'));
  } else {
    const tempScriptContent = fs.readFileSync(tempScriptPath, 'utf8');
    const tempScriptVer     = parseScriptVersion(tempScriptContent);

    if (!tempScriptVer) {
      console.log(fmt(C.dim, '  ? upgrade-kit.js — no SCRIPT_VERSION found in temp copy, skipping\n'));
    } else {
      const cmp = compareVersions(tempScriptVer, SCRIPT_VERSION);
      if (cmp > 0) {
        fs.copyFileSync(tempScriptPath, __filename);
        const msg = `upgrade-kit.js (v${SCRIPT_VERSION} → v${tempScriptVer}) [takes effect on next run]`;
        console.log(`  ${fmt(C.green, '↑ REPLACED')}  ${msg}`);
        changes.replaced.push(msg);
      } else if (cmp < 0) {
        const msg = `upgrade-kit.js (workspace v${SCRIPT_VERSION} > kit v${tempScriptVer})`;
        console.log(`  ${fmt(C.yellow, '⚠ WARNING')}   ${msg}`);
        changes.warnings.push(msg);
      } else {
        stats.skipped++;
      }
    }
    console.log('');
  }

  // ── Per-folder comparison ─────────────────────────────────────────────
  for (const folder of FOLDERS_TO_COMPARE) {
    const tempFolder      = path.join(TEMP_DIR, folder);
    const workspaceFolder = path.join(WORKSPACE_ROOT, folder);

    console.log(fmt(C.cyan + C.bold, `▶ ${folder}`));

    if (!fs.existsSync(tempFolder)) {
      console.log(fmt(C.dim, `  (no ${folder} folder in temp — skipping)\n`));
      continue;
    }

    // ── 1. Individual files (agents, prompts, instructions) ──────────────
    for (const { fullPath: tempPath, relativePath } of findTrackedFiles(tempFolder)) {
      const workspacePath = path.join(workspaceFolder, relativePath);
      const display       = path.join(folder, relativePath);

      const tempContent = fs.readFileSync(tempPath, 'utf8');
      const tempMeta    = parseVersion(tempContent);

      if (!tempMeta) {
        console.log(`  ${fmt(C.dim, '?')} ${display} ${fmt(C.dim, '— no metadata.version, skipping')}`);
        stats.noVersion++;
        continue;
      }

      if (!fs.existsSync(workspacePath)) {
        copyFile(tempPath, workspacePath);
        const msg = `${display} (v${tempMeta.version})`;
        console.log(`  ${fmt(C.green, '✚ ADDED')}     ${msg}`);
        changes.added.push(msg);
        continue;
      }

      const wsMeta = parseVersion(fs.readFileSync(workspacePath, 'utf8'));

      if (!wsMeta) {
        copyFile(tempPath, workspacePath);
        const msg = `${display} (no workspace version → v${tempMeta.version})`;
        console.log(`  ${fmt(C.green, '↑ REPLACED')}  ${msg}`);
        changes.replaced.push(msg);
        continue;
      }

      const cmp = compareVersions(tempMeta.version, wsMeta.version);
      if (cmp > 0) {
        copyFile(tempPath, workspacePath);
        const msg = `${display} (v${wsMeta.version} → v${tempMeta.version})`;
        console.log(`  ${fmt(C.green, '↑ REPLACED')}  ${msg}`);
        changes.replaced.push(msg);
      } else if (cmp < 0) {
        const msg = `${display} (workspace v${wsMeta.version} > kit v${tempMeta.version})`;
        console.log(`  ${fmt(C.yellow, '⚠ WARNING')}   ${msg}`);
        changes.warnings.push(msg);
      } else {
        stats.skipped++;
      }
    }

    // ── 2. Skill folders (version from SKILL.md, entire folder replaced) ─
    for (const { skillMdPath, skillFolderPath, relativeFolderPath } of findSkillFiles(tempFolder)) {
      const wsSkillFolder = path.join(workspaceFolder, relativeFolderPath);
      const wsSkillMd     = path.join(wsSkillFolder, 'SKILL.md');
      const display       = path.join(folder, relativeFolderPath);

      const tempMeta = parseVersion(fs.readFileSync(skillMdPath, 'utf8'));

      if (!tempMeta) {
        console.log(`  ${fmt(C.dim, '?')} ${display}/ ${fmt(C.dim, '— no metadata.version in SKILL.md, skipping')}`);
        stats.noVersion++;
        continue;
      }

      if (!fs.existsSync(wsSkillMd)) {
        replaceFolder(skillFolderPath, wsSkillFolder);
        const msg = `${display}/ (v${tempMeta.version}) [full folder]`;
        console.log(`  ${fmt(C.green, '✚ ADDED')}     ${msg}`);
        changes.added.push(msg);
        continue;
      }

      const wsMeta = parseVersion(fs.readFileSync(wsSkillMd, 'utf8'));

      if (!wsMeta) {
        replaceFolder(skillFolderPath, wsSkillFolder);
        const msg = `${display}/ (no workspace version → v${tempMeta.version}) [full folder]`;
        console.log(`  ${fmt(C.green, '↑ REPLACED')}  ${msg}`);
        changes.replaced.push(msg);
        continue;
      }

      const cmp = compareVersions(tempMeta.version, wsMeta.version);
      if (cmp > 0) {
        replaceFolder(skillFolderPath, wsSkillFolder);
        const msg = `${display}/ (v${wsMeta.version} → v${tempMeta.version}) [full folder]`;
        console.log(`  ${fmt(C.green, '↑ REPLACED')}  ${msg}`);
        changes.replaced.push(msg);
      } else if (cmp < 0) {
        const msg = `${display}/ (workspace v${wsMeta.version} > kit v${tempMeta.version})`;
        console.log(`  ${fmt(C.yellow, '⚠ WARNING')}   ${msg}`);
        changes.warnings.push(msg);
      } else {
        stats.skipped++;
      }
    }

    console.log('');
  }

  // ── Force-copy folders (no version check) ────────────────────────────
  console.log(fmt(C.cyan + C.bold, '▶ Force-copy folders'));

  let forceCopyFound = false;
  for (const relativeForcePath of FORCE_COPY_FOLDERS) {
    const tempForcePath      = path.join(TEMP_DIR, relativeForcePath);
    const workspaceForcePath = path.join(WORKSPACE_ROOT, relativeForcePath);

    if (!fs.existsSync(tempForcePath)) {
      continue; // not present in temp — skip silently
    }

    forceCopyFound = true;
    const existed = fs.existsSync(workspaceForcePath);
    copyDirRecursive(tempForcePath, workspaceForcePath);

    const msg = `${relativeForcePath}/ [force-copy]`;
    if (existed) {
      console.log(`  ${fmt(C.green, '↑ REPLACED')}  ${msg}`);
      changes.replaced.push(msg);
    } else {
      console.log(`  ${fmt(C.green, '✚ ADDED')}     ${msg}`);
      changes.added.push(msg);
    }
  }

  if (!forceCopyFound) {
    console.log(fmt(C.dim, '  (no force-copy folders found in temp — skipping)'));
  }
  console.log('');

  // ── Delete temp folder ────────────────────────────────────────────────
  deleteDir(TEMP_DIR);
  console.log(fmt(C.dim, '  temp/ folder deleted.\n'));

  // ── Final summary ─────────────────────────────────────────────────────
  const totalChanges = changes.added.length + changes.replaced.length;

  console.log(fmt(C.bold, '══════════════════════════════════════════'));
  console.log(fmt(C.bold, '                   SUMMARY                '));
  console.log(fmt(C.bold, '══════════════════════════════════════════'));

  if (totalChanges === 0 && changes.warnings.length === 0) {
    console.log(fmt(C.dim, '\n  Everything is up to date. No changes were applied.\n'));
  } else {
    if (changes.added.length > 0) {
      console.log(fmt(C.green, `\n  ✚ Added (${changes.added.length}):`));
      changes.added.forEach(f => console.log(`    • ${f}`));
    }
    if (changes.replaced.length > 0) {
      console.log(fmt(C.green, `\n  ↑ Replaced (${changes.replaced.length}):`));
      changes.replaced.forEach(f => console.log(`    • ${f}`));
    }
    if (changes.warnings.length > 0) {
      console.log(fmt(C.yellow, `\n  ⚠ Workspace ahead of kit — review required (${changes.warnings.length}):`));
      changes.warnings.forEach(f => console.log(`    • ${f}`));
    }
    if (stats.noVersion > 0) {
      console.log(fmt(C.dim, `  ? Skipped (no version found): ${stats.noVersion} item(s)`));
    }
    console.log('');
    console.log(`  Total changes applied : ${fmt(C.bold, String(totalChanges))}`);
    console.log(`  Warnings              : ${changes.warnings.length > 0 ? fmt(C.yellow, String(changes.warnings.length)) : '0'}`);
    console.log('');
  }

  console.log(fmt(C.bold, '══════════════════════════════════════════\n'));

  if (changes.warnings.length > 0) {
    console.log(fmt(C.yellow, '  Some workspace files are ahead of the kit version.'));
    console.log(fmt(C.yellow, '  Manually merge changes before the next kit release.\n'));
  }
}

main();
