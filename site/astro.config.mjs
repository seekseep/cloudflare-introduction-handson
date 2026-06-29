// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeExternalLinks from 'rehype-external-links';
import remarkCallout from './src/plugins/remark-callout.mjs';

const repoUrl = 'https://github.com/seekseep/cloudflare-introduction-handson';

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
      customCss: ['./src/styles/external-links.css', './src/styles/callouts.css'],
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
        { label: '01. Cloudflareで公開する', items: [{ autogenerate: { directory: '01-publish' } }] },
        { label: '02. 他サービスとの比較', items: [{ autogenerate: { directory: '02-compare' } }] },
        { label: '03. 公開時に気をつけたいこと', items: [{ autogenerate: { directory: '03-security' } }] },
        { label: '04. Cloudflareの機能と運用', items: [{ autogenerate: { directory: '04-features' } }] },
      ],
      editLink: {
        baseUrl: `${repoUrl}/edit/main/`,
      },
      lastUpdated: true,
    }),
  ],
});
