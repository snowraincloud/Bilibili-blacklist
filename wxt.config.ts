import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'Bilibili 黑名单用户视频屏蔽',
    permissions: ['storage'],
    web_accessible_resources: [
      {
        resources: ['intercept/index.js'],
        matches: ['<all_urls>'],
      },
    ],
  },
  hooks: {
    build: {
      manifestGenerated(_, manifest) {
        manifest.options_ui!.open_in_tab = true;
      },
    },
  },
});
