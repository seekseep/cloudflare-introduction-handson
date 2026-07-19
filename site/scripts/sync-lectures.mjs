#!/usr/bin/env node
/**
 * リポジトリ全体のマークダウンから frontmatter に `docs: true` を持つものだけを
 * 拾い、site/src/content/docs/ 配下のサイトページを生成する。
 *
 * 採用される source/destination の対応 (規約):
 *   ROOT/README.md                  → docs/index.md             (/)
 *   sections/README.md              → docs/getting-started.md   (/getting-started/)
 *   sections/<name>.md              → docs/<name>.md            (/<name>/)        例: DOCKER.md → /docker/
 *   sections/<sec>/README.md        → docs/<sec>/index.md       (/<sec>/)
 *   sections/<sec>/<lec>/LECTURE.md → docs/<sec>/<lec>.md       (/<sec>/<lec>/)   サイドバーには 1 ファイルとして並ぶ
 *
 * frontmatter で title / sidebar.label / sidebar.order を上書きできる。
 * sidebar.order は LECTURE.md に限り、ディレクトリ名 (`01-...`) からデフォルト値を導出する。
 * 本文中の相対リンク・画像の書き換えは libs/links.mjs が担う。
 *
 * REPO（GitHub URL）と base は site/astro.config.mjs から読む (libs/astro-config.mjs)。
 */

import { cp, glob, mkdir, readdir, readFile, writeFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';

import { loadAstroConfig } from './libs/astro-config.mjs';
import { parseFrontmatter } from './libs/frontmatter.mjs';
import { PUBLIC_ASSETS, publicTargetFor, transformLinks } from './libs/links.mjs';
import {
  buildFrontmatter,
  extractDescription,
  parseLectureOrder,
  stripLeadingH1,
} from './libs/markdown.mjs';
import { downloadUrlFor, parseLectureRel } from './libs/naming.mjs';
import { DOCS_DIR, PUBLIC_DIR, ROOT } from './libs/paths.mjs';

const MAX_FILE_BYTES = 200 * 1024;
const PUBLISH_FLAG = 'docs';

/**
 * レクチャーの source dir がプロジェクト (package.json あり) なら、配布 ZIP の URL を返す。
 * naming.mjs の命名規約 (<sec>-<lec>.zip) を build-downloads.mjs と共有する。対象でなければ null。
 * 本文中に手書きした `./project.zip` リンクを transformLinks でこの URL に差し替えるために使う。
 */
async function resolveDownloadUrl(sourceDir, base) {
  const parsed = parseLectureRel(sourceDir);
  if (!parsed) return null;
  try {
    await stat(path.join(ROOT, sourceDir, 'package.json'));
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
  return downloadUrlFor(base, parsed.sec, parsed.lec);
}

async function syncFile({
  sourceFile,
  sourceDir,
  sourceSiteUrl,
  outputFile,
  defaultSidebarOrder,
  editPath,
  config,
}) {
  const stats = await stat(sourceFile);
  if (stats.size > MAX_FILE_BYTES) {
    console.warn(`[sync-lectures] skipping oversize: ${path.relative(ROOT, sourceFile)} (${stats.size} bytes)`);
    return;
  }

  const raw = await readFile(sourceFile, 'utf8');
  const { data: srcFm, body: bodyAfterFm } = parseFrontmatter(raw);
  const title = srcFm.title || '名称不明';
  const description = srcFm.description || extractDescription(bodyAfterFm);
  const downloadUrl = await resolveDownloadUrl(sourceDir, config.base);
  const body = transformLinks(stripLeadingH1(bodyAfterFm), {
    sourceDir,
    sourceSiteUrl,
    repo: config.repo,
    base: config.base,
    downloadUrl,
  });

  const sidebar = srcFm.sidebar || {};
  const sidebarOrder = sidebar.order ?? defaultSidebarOrder;
  const sidebarLabel = sidebar.label;

  const fm = buildFrontmatter({
    title,
    description,
    sidebarOrder,
    sidebarLabel,
    editUrl: editPath && config.repo ? `${config.repo}/edit/main/${editPath}` : undefined,
  });

  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, fm + body, 'utf8');
  console.log(`[sync-lectures] ${path.relative(ROOT, sourceFile)} -> ${path.relative(ROOT, outputFile)}`);
}

async function syncSiblingDocsDir(sourceDir, outputFile) {
  const sourceDocsDir = path.join(ROOT, ...sourceDir.split('/'), 'docs');
  try {
    const stats = await stat(sourceDocsDir);
    if (!stats.isDirectory()) return;
  } catch (e) {
    if (e.code === 'ENOENT') return;
    throw e;
  }
  const outputDocsDir = path.join(path.dirname(outputFile), 'docs');
  await cp(sourceDocsDir, outputDocsDir, {
    recursive: true,
    filter: (src) => !PUBLIC_ASSETS.has(path.basename(src)),
  });
  console.log(`[sync-lectures] ${path.relative(ROOT, sourceDocsDir)}/ -> ${path.relative(ROOT, outputDocsDir)}/`);
}

async function copyPublicAssets(base) {
  const it = glob('sections/*/*/docs/**', { cwd: ROOT });
  for await (const rel of it) {
    const relPosix = rel.split(path.sep).join('/');
    if (!PUBLIC_ASSETS.has(path.posix.basename(relPosix))) continue;
    const abs = path.join(ROOT, relPosix);
    const stats = await stat(abs);
    if (!stats.isFile()) continue;
    const t = publicTargetFor(relPosix, base);
    if (!t) {
      console.warn(`[sync-lectures] PUBLIC_ASSETS basename matched but path shape unsupported: ${relPosix}`);
      continue;
    }
    const dest = path.join(PUBLIC_DIR, ...t.destRel.split('/'));
    await mkdir(path.dirname(dest), { recursive: true });
    await cp(abs, dest);
    console.log(`[sync-lectures] ${relPosix} -> site/public/${t.destRel}`);
  }
}

async function cleanDocsDir() {
  try {
    const entries = await readdir(DOCS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      await rm(path.join(DOCS_DIR, entry.name), { recursive: true, force: true });
    }
  } catch (e) {
    if (e.code === 'ENOENT') return;
    throw e;
  }
}

/**
 * source path (POSIX, ROOT 相対) から出力先・サイト URL・既定の sidebar order を導出する。
 * 規約に当てはまらない場合は null を返し、呼び出し側で警告して skip する。
 */
function deriveDestination(srcRel) {
  const parts = srcRel.split('/');
  const file = parts[parts.length - 1];

  if (srcRel === 'README.md') {
    return { outputPath: 'index.md', slug: '/' };
  }
  if (srcRel === 'sections/README.md') {
    return { outputPath: 'getting-started.md', slug: '/getting-started/' };
  }
  if (parts[0] === 'sections' && parts.length === 2) {
    const name = file.replace(/\.md$/i, '').toLowerCase();
    return { outputPath: `${name}.md`, slug: `/${name}/` };
  }
  if (parts[0] === 'sections' && file === 'README.md' && parts.length >= 3) {
    const inner = parts.slice(1, -1);
    return {
      outputPath: path.posix.join(...inner, 'index.md'),
      slug: '/' + inner.join('/') + '/',
    };
  }
  if (parts[0] === 'sections' && file === 'LECTURE.md' && parts.length >= 3) {
    const inner = parts.slice(1, -1);
    return {
      outputPath: inner.join('/') + '.md',
      slug: '/' + inner.join('/') + '/',
      defaultSidebarOrder: parseLectureOrder(inner[inner.length - 1]),
    };
  }
  return null;
}

async function findPublishableMarkdown() {
  const it = glob('**/*.md', {
    cwd: ROOT,
    exclude: (rel) => rel === 'node_modules' || rel.startsWith('node_modules/')
      || rel.startsWith('site/') || rel.startsWith('.git/'),
  });
  const all = [];
  for await (const rel of it) all.push(rel.split(path.sep).join('/'));
  all.sort();

  const result = [];
  for (const rel of all) {
    const raw = await readFile(path.join(ROOT, rel), 'utf8');
    const { data } = parseFrontmatter(raw);
    if (data[PUBLISH_FLAG] !== true) continue;
    result.push(rel);
  }
  return result;
}

async function main() {
  const config = await loadAstroConfig();
  await cleanDocsDir();
  await mkdir(DOCS_DIR, { recursive: true });
  await copyPublicAssets(config.base);

  for (const srcRel of await findPublishableMarkdown()) {
    const dest = deriveDestination(srcRel);
    if (!dest) {
      console.warn(`[sync-lectures] no destination convention for ${srcRel} (skipped)`);
      continue;
    }
    const sourceDir = path.posix.dirname(srcRel);
    const outputFile = path.join(DOCS_DIR, dest.outputPath);
    await syncFile({
      sourceFile: path.join(ROOT, srcRel),
      sourceDir,
      sourceSiteUrl: dest.slug,
      outputFile,
      defaultSidebarOrder: dest.defaultSidebarOrder,
      editPath: srcRel,
      config,
    });
    await syncSiblingDocsDir(sourceDir, outputFile);
  }

  console.log('[sync-lectures] done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
