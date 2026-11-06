import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'snowman-breaker',
  brand: { primaryColor: '#2F8CFF' },
  permissions: [],
  navigationBar: {
    withBackButton: true,
    withHomeButton: false,
    withTitle: true,
    transparentBackground: false,
    theme: 'dark',
  },
  webView: {
    allowsInlineMediaPlayback: true,
    bounces: false,
    pullToRefreshEnabled: false,
    overScrollMode: 'never',
    mediaPlaybackRequiresUserAction: false,
    allowsBackForwardNavigationGestures: false,
  },
  webBundleDir: 'dist',
});
