// 토스(앱인토스) 연결 — 게임 본체(index.html 인라인 스크립트)는 window.SBToss만 봅니다.
// 토스 밖(일반 브라우저)에서도 에러 없이 조용히 넘어가야 합니다.
import { graniteEvent, Analytics, closeView, getOperationalEnvironment, loadFullScreenAd, showFullScreenAd, SafeArea, IAP } from '@apps-in-toss/web-framework';

let env = 'web';
try { env = getOperationalEnvironment() || 'web'; } catch (e) { env = 'web'; }

// 위쪽 여백: 토스 게임 화면 오른쪽 위 「⋯·X」 캡슐과 상태 표시줄 높이(기기마다 다름 → 숫자 박지 말고 SDK 값)
let safeTop = 0;
function readSafeTop() {
  try { const v = SafeArea.get(); safeTop = v && v.top > 0 ? v.top : 0; } catch (e) { safeTop = 0; }
}
if (env !== 'web') readSafeTop();

window.SBToss = {
  env, // 'toss' | 'sandbox' | 'web'
  topInset() { return safeTop; },
  log(name, params) {
    if (env === 'web') return;
    try { Analytics.log({ log_name: name, log_type: 'event', params }).catch(() => {}); } catch (e) {}
  },
  close() {
    try { closeView(); } catch (e) {}
  },
  // ===== 인앱 결제(평생권, 비소모품) =====
  iapSupported() {
    try { return env !== 'web' && IAP.createOneTimePurchaseOrder.isSupported(); } catch (e) { return false; }
  },
  // 결제 → 토스가 processProductGrant 를 부르면 grant(orderId)로 지급하고 true 를 돌려줘야 '지급 완료'가 됨
  buy(sku, grant, done) {
    let cleanup = null, ended = false;
    const end = (ok, info) => { if (ended) return; ended = true; try { cleanup && cleanup(); } catch (e) {} done(ok, info); };
    try {
      cleanup = IAP.createOneTimePurchaseOrder({
        options: { sku, processProductGrant: async ({ orderId }) => { try { return !!(await grant(orderId, 'buy')); } catch (e) { return false; } } },
        onEvent: (e) => { if (e && e.type === 'success') end(true, e.data); },
        onError: (err) => end(false, err),
      });
    } catch (e) { end(false, e); }
  },
  // 되살리기: ① 결제는 됐는데 지급이 안 된 주문을 마저 지급 ② 완료·환불 주문을 훑어 지금 가진 상태를 돌려줌
  // 반환: { owned, orderId, refunded } — 조회 자체가 실패하면 null(그땐 폰에 저장된 상태를 그대로 둠)
  async restore(sku, grant) {
    try {
      if (IAP.getPendingOrders.isSupported()) {
        const r = await IAP.getPendingOrders();
        for (const o of (r && r.orders) || []) {
          if (o.sku !== sku) continue;
          if (await grant(o.orderId, 'pending')) { try { await IAP.completeProductGrant({ params: { orderId: o.orderId } }); } catch (e) {} }
        }
      }
    } catch (e) {}
    try {
      if (!IAP.getCompletedOrRefundedOrders.isSupported()) return null;
      let key = null, owned = false, orderId = null, refunded = false;
      for (let i = 0; i < 20; i++) {
        const r = await IAP.getCompletedOrRefundedOrders(key ? { key } : undefined);
        for (const o of (r && r.orders) || []) {
          if (o.sku !== sku) continue;
          if (o.status === 'COMPLETED') { owned = true; orderId = o.orderId; } else if (o.status === 'REFUNDED') refunded = true;
        }
        if (!r || !r.hasNext) break;
        key = r.nextKey;
      }
      return { owned, orderId, refunded };
    } catch (e) { return null; }
  },
  adsSupported() {
    try { return loadFullScreenAd.isSupported() && showFullScreenAd.isSupported(); } catch (e) { return false; }
  },
  // 보상형 광고: 불러와서 바로 보여 주고, 끝까지 보면 done(true)
  showAd(adGroupId, done) {
    let finished = false, rewarded = false;
    const end = (ok) => { if (finished) return; finished = true; done(ok); };
    try {
      loadFullScreenAd({
        options: { adGroupId },
        onEvent: (e) => {
          if (e.type !== 'loaded') return;
          showFullScreenAd({
            options: { adGroupId },
            onEvent: (ev) => {
              if (ev.type === 'userEarnedReward') rewarded = true;
              if (ev.type === 'dismissed') end(rewarded);
              if (ev.type === 'failedToShow') end(false);
            },
            onError: () => end(false),
          });
        },
        onError: () => end(false),
      });
    } catch (e) { end(false); }
    setTimeout(() => end(rewarded), 90000); // 안전장치
  },
};

// 여백이 바뀌면(회전·캡슐 변화) 화면을 다시 맞춤
if (env !== 'web') {
  try { SafeArea.subscribe({ onEvent: (v) => { safeTop = v && v.top > 0 ? v.top : 0; window.SBResize && window.SBResize(); } }); } catch (e) {}
}
try { window.SBResize && window.SBResize(); } catch (e) {}
// 열 때마다 평생권 되살리기(게임이 준비됐으면 바로, 아니면 게임이 부름)
try { window.SBRestore && window.SBRestore('boot'); } catch (e) {}

// 위쪽 바·폰 뒤로 가기 → 게임의 '잠깐 쉬기' 규칙으로
try {
  graniteEvent.addEventListener('backEvent', {
    onEvent: () => { try { window.SBBack && window.SBBack('toss'); } catch (e) {} },
    onError: () => {},
  });
} catch (e) {}

// 글꼴이 늦게 오면 화면을 한 번 다시 그리도록
try { document.fonts && document.fonts.ready.then(() => window.SBFontsReady && window.SBFontsReady()); } catch (e) {}
