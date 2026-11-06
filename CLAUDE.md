# 눈사람 브레이커 (snowman-breaker)

토스 미니앱(앱인토스 WebView)용 캔버스 게임. 원작 「Zombie Breaker」(모바일 게임 속 미니게임)를 동네 눈싸움 테마로 옮긴 블롭 브릭 브레이커.

- 게임 전체: `index.html` 한 파일 (인라인 스크립트, 논리 화면 360×700, 코드로 그린 그림, WebAudio 합성음)
- 토스 연결: `src/toss.js` → `window.SBToss` (Analytics.log, closeView, backEvent → `window.SBBack`)
- 글꼴: `tools/subset_font.py`가 index.html에 나온 글자만 남긴 Jua(`public/fonts/jua-sb.woff2`)를 만든다. **글자를 새로 넣으면 빌드 전에 꼭 다시 돌릴 것.**
- 빌드: `python3 tools/subset_font.py && npx vite build && npx ait build` → `snowman-breaker.ait`
- 분석 이벤트 표: `ANALYTICS.md` (새 기능 = 새 이벤트 + 표 갱신)

## 지켜야 할 것
- 원작 룰·수치 우선. 샷 10(+2), 한 번에 3(+1), 눈뭉치 주머니 1(+1), 구슬 주머니 2(+1). 업그레이드 10칸, 값 `UPG_COSTS`.
- 한 스테이지 쭉 + 꼭대기 왕눈사람, 샷마다 모두 한 칸씩 내려옴, 보스는 따로 안 움직임.
- 져도 구슬은 남음, 부활은 판마다 1번(샷 +3).
- 잠깐 쉬기·뒤로 가기: 판 중 뒤로 → 잠깐 쉬기, 한 번 더 → 이어 하기 저장 후 닫기. 준비 → 고르기 → 첫 화면 → 닫기.
- 60·70대 눈 기준 큰 글씨(논리 14px 이상), 버튼 48px 이상.
- 미션은 `MISSION_DEFS` (손으로 짠 무리 3벌 `TPL`을 뒤집고·섞고·체력 배수). 밸런스는 봇으로 확인(`tools/sim.js`).
