// 토스(앱인토스) 연결 — 게임 본체(index.html 인라인 스크립트)는 window.SBToss만 봅니다.
// 토스 밖(일반 브라우저)에서도 에러 없이 조용히 넘어가야 합니다.
import { graniteEvent, Analytics, closeView, getOperationalEnvironment } from '@apps-in-toss/web-framework';

let env = 'web';
try { env = getOperationalEnvironment() || 'web'; } catch (e) { env = 'web'; }

window.SBToss = {
  env, // 'toss' | 'sandbox' | 'web'
  log(name, params) {
    if (env === 'web') return;
    try { Analytics.log({ log_name: name, log_type: 'event', params }).catch(() => {}); } catch (e) {}
  },
  close() {
    try { closeView(); } catch (e) {}
  },
};

// 위쪽 바·폰 뒤로 가기 → 게임의 '잠깐 쉬기' 규칙으로
try {
  graniteEvent.addEventListener('backEvent', {
    onEvent: () => { try { window.SBBack && window.SBBack('toss'); } catch (e) {} },
    onError: () => {},
  });
} catch (e) {}

// 글꼴이 늦게 오면 화면을 한 번 다시 그리도록
try { document.fonts && document.fonts.ready.then(() => window.SBFontsReady && window.SBFontsReady()); } catch (e) {}
