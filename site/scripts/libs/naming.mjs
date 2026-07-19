/**
 * 配布 ZIP の命名規約を一元管理するモジュール。
 *
 * build-downloads.mjs の「出力ファイル名」と sync-lectures.mjs の
 * 「ダウンロードリンク生成」がともにここを参照することで、
 * <sec>-<lec>.zip の規約が必ず一致することを保証する。
 *
 *   sections/<sec>/<lec>  ⇔  downloads/<sec>-<lec>.zip
 */

const LECTURE_REL_RE = /^sections\/([\w-]+)\/([\w-]+)$/;

/** `sections/<sec>/<lec>` を { sec, lec } に分解する。一致しなければ null。 */
export function parseLectureRel(lectureRel) {
  const m = lectureRel.match(LECTURE_REL_RE);
  return m ? { sec: m[1], lec: m[2] } : null;
}

/** 配布 ZIP のファイル名 (<sec>-<lec>.zip)。 */
export function zipBasenameFor(sec, lec) {
  return `${sec}-${lec}.zip`;
}

/** サイト上の配布 ZIP への URL (<base>/downloads/<sec>-<lec>.zip)。 */
export function downloadUrlFor(base, sec, lec) {
  return `${base}/downloads/${zipBasenameFor(sec, lec)}`;
}
