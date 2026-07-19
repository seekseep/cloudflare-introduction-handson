/**
 * リポジトリ内の主要ディレクトリを一元管理するモジュール。
 * scripts 配下の各スクリプトはここを参照してパスを組み立てる。
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** リポジトリルート (site/scripts/libs から 3 つ上)。 */
export const ROOT = path.resolve(__dirname, '..', '..', '..');
export const SITE_DIR = path.join(ROOT, 'site');
export const DOCS_DIR = path.join(SITE_DIR, 'src', 'content', 'docs');
export const PUBLIC_DIR = path.join(SITE_DIR, 'public');
export const DOWNLOADS_DIR = path.join(PUBLIC_DIR, 'downloads');
