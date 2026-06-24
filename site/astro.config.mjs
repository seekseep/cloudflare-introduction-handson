// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const repoUrl = 'https://github.com/seekseep/cloudflare-introduction-handson';

export default defineConfig({
  site: 'https://seekseep.github.io',
  base: '/cloudflare-introduction-handson',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'Cloudflare 公開・運用ハンズオン',
      description: 'Cloudflareの無料プランでアプリを公開・運用する流れと、公開時のセキュリティの要点を手を動かして学ぶ',
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
