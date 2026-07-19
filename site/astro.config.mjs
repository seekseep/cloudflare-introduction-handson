// @ts-check
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeExternalLinks from 'rehype-external-links';
import remarkCallout from './src/plugins/remark-callout.mjs';
import remarkQuestions from './src/plugins/remark-questions.mjs';
import remarkDownload from './src/plugins/remark-download.mjs';

const repoUrl = 'https://github.com/seekseep/cloudflare-introduction-handson';

// ◯✕クイズ（`:::questions`）の client スクリプト。全ページの <head> に inline で
// 注入し、`.quiz` が無いページでは何もしない。別ファイル参照だと base の解決や
// バンドルの都合が絡むので、内容をそのまま埋め込む。
const quizClient = readFileSync(
  fileURLToPath(new URL('./src/scripts/quiz-client.js', import.meta.url)),
  'utf8',
);

/**
 * カスタム callout（remark-callout.mjs）を Starlight 標準の asides より「前」に
 * 登録するためのインライン統合。Starlight は astro:config:setup で自身の remark
 * プラグインを processor へ push するため、それより先に走るこの統合で push して
 * おくことで、`:::danger` の名前衝突を Starlight に横取りされる前に解消する。
 * （directive のパース拡張は Starlight 側の remark-directive が供給するので、ここでは
 *  変換プラグインだけ登録すればよい。）
 */
function calloutIntegration() {
  return {
    name: 'handson-callout',
    hooks: {
      'astro:config:setup': ({ config }) => {
        config.markdown.processor?.options.remarkPlugins.push(remarkCallout);
        // `:::questions` の変換。名前衝突は無いので順序は問わない。
        config.markdown.processor?.options.remarkPlugins.push(remarkQuestions);
        // `:::download` を大きなダウンロードボタンに変換。名前衝突なし。
        config.markdown.processor?.options.remarkPlugins.push(remarkDownload);
      },
    },
  };
}

export default defineConfig({
  site: 'https://seekseep.github.io',
  base: '/cloudflare-introduction-handson',
  trailingSlash: 'always',
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
          // 外部リンクであることを示すアイコン用のクラス。装飾は external-links.css 側で付ける。
          properties: { class: 'external-link' },
        },
      ],
    ],
  },
  integrations: [
    // starlight より前に登録して、callout 変換を asides より先に走らせる。
    calloutIntegration(),
    starlight({
      title: 'Cloudflare 公開・運用ハンズオン',
      description: 'Cloudflareの無料プランでアプリを公開・運用する流れと、公開時のセキュリティの要点を手を動かして学ぶ',
      customCss: ['./src/styles/readability.css', './src/styles/external-links.css', './src/styles/callouts.css', './src/styles/quiz.css', './src/styles/download.css'],
      head: [
        // ◯✕クイズの client スクリプトを全ページに注入する。
        { tag: 'script', content: quizClient },
      ],
      defaultLocale: 'root',
      locales: {
        root: { label: '日本語', lang: 'ja' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: repoUrl },
      ],
      sidebar: [
        { label: 'はじめに', link: '/' },
        { label: '00. 事前準備・セットアップ', items: [{ autogenerate: { directory: '00-environment' } }] },
        { label: '01. Pages で公開する', items: [{ autogenerate: { directory: '01-publish' } }] },
        { label: '02. セキュリティ', items: [{ autogenerate: { directory: '02-security' } }] },
        { label: '03. アプリを作る', items: [{ autogenerate: { directory: '03-build-app' } }] },
        { label: '04. 付録', items: [{ autogenerate: { directory: '04-appendix' } }] },
      ],
      editLink: {
        baseUrl: `${repoUrl}/edit/main/`,
      },
      lastUpdated: true,
    }),
  ],
});
