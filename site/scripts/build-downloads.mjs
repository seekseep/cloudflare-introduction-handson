#!/usr/bin/env node
/**
 * 各レクチャーのサンプルプロジェクトを ZIP 化し、site/public/downloads/ に出力する。
 *
 * 対象: sections/<sec>/<lec>/package.json を持つレクチャー = プロジェクト単位。
 * 出力: site/public/downloads/<sec>-<lec>.zip
 *       ZIP 内のルートフォルダは <lec>/（展開時に名前付きフォルダができる）。
 *
 * 中身の選定 (「余計なものを入れない」):
 *   - git 管理下のファイル (libs/git.mjs) だけを対象にする。
 *     これにより node_modules/ .wrangler/ dist/ .dev.vars .env *.pem/*.key、
 *     各自コピー用の wrangler.jsonc など .gitignore 済みのものは自動で除外される。
 *     example (wrangler.example.jsonc / .dev.vars.example) や、追跡されている
 *     wrangler.jsonc (turnstile) は自然に含まれる。
 *   - そのうえで教材ファイル (LECTURE.md, images/) だけ明示的に除外する。
 *
 * ダウンロード URL の規約 (<sec>-<lec>.zip) は libs/naming.mjs に集約し、
 * sync-lectures.mjs のリンク生成と共有している。
 */

import { createWriteStream } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

import archiver from 'archiver';

import { lsFiles } from './libs/git.mjs';
import { parseLectureRel, zipBasenameFor } from './libs/naming.mjs';
import { DOWNLOADS_DIR, ROOT } from './libs/paths.mjs';

// 教材ファイル。プロジェクト ZIP には含めない。
function isLectureAsset(relToLecture) {
  return relToLecture === 'LECTURE.md' || relToLecture.startsWith('images/');
}

async function findProjectLectures() {
  // package.json を持つ sections/<sec>/<lec> を、git 管理下のファイルから拾う。
  const files = await lsFiles(ROOT, 'sections/*/*/package.json');
  const dirs = files.map((p) => path.posix.dirname(p));
  return [...new Set(dirs)].sort();
}

function zipLecture(lectureRel, files) {
  const { sec, lec } = parseLectureRel(lectureRel);
  const zipBasename = zipBasenameFor(sec, lec);
  const rootFolder = lec; // ZIP 展開時にできる名前付きフォルダ
  const outPath = path.join(DOWNLOADS_DIR, zipBasename);

  return new Promise((resolve, reject) => {
    const output = createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve({ zipBasename, count: files.length }));
    archive.on('warning', reject);
    archive.on('error', reject);
    archive.pipe(output);

    for (const fileRel of files) {
      const relToLecture = path.posix.relative(lectureRel, fileRel);
      if (isLectureAsset(relToLecture)) continue;
      archive.file(path.join(ROOT, ...fileRel.split('/')), {
        name: path.posix.join(rootFolder, relToLecture),
      });
    }

    archive.finalize();
  });
}

async function main() {
  await rm(DOWNLOADS_DIR, { recursive: true, force: true });
  await mkdir(DOWNLOADS_DIR, { recursive: true });

  const lectures = await findProjectLectures();
  if (lectures.length === 0) {
    console.warn('[build-downloads] no project lectures found (sections/*/*/package.json)');
  }

  for (const lectureRel of lectures) {
    const files = await lsFiles(ROOT, lectureRel);
    const { zipBasename, count } = await zipLecture(lectureRel, files);
    const included = files.filter((f) => !isLectureAsset(path.posix.relative(lectureRel, f))).length;
    console.log(`[build-downloads] ${lectureRel} -> site/public/downloads/${zipBasename} (${included}/${count} files)`);
  }

  console.log('[build-downloads] done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
