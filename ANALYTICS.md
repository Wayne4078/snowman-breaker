# 눈사람 브레이커 — 분석 이벤트

모든 이벤트는 `track(name, params)` 하나로 보냅니다. 받는 곳: 폰 안 기록(최근 300개, `sb_events`), 토스 `Analytics.log`(라이브에서만, 콘솔 분석 > 이벤트에 D+1 반영), GA(있을 때). 주소 뒤에 `#events`를 붙이면 화면 왼쪽 아래에 최근 이벤트가 보입니다.

**공통 봉투:** ts, seq, sid(앱 열 때마다 새로), uid(폰에 남는 익명 번호), build, platform(web/toss), lang, screen(그때 화면), day(설치 후 며칠, 한국 시간), mission(1~5)

| 단계 | 이벤트 | 주요 값 |
|---|---|---|
| 획득 | `first_open` | utm_*, ref |
| | `app_open` | first, session_no, utm_* |
| 시작 | `loading_complete` | ms |
| | `title_view` | state: new / returning / resume |
| | `title_play` | action: new / start / continue / map |
| | `first_touch` | since_open_s |
| 활성 | `first_action` (생애 첫 발사) | since_open_s |
| 화면 | `screen_view` | screen, from |
| | `mission_select` | mission, cleared |
| 준비 | `upgrade_buy` | key(shot/ball/pocket/bag), lv, chips_left |
| | `bait_toggle` / `legend_equip` | on |
| 판 | `match_start` | mission, match_no, bait, legend_ball, *_lv, chips |
| | `match_resume` | mission, shots_left |
| | `boss_appear` | shots_left |
| | `legend_spawn` / `legend_catch` / `legend_flee` | shot / lv |
| | `chance_offer` | reason: shots / boss |
| | `chance_use` / `chance_decline` / `chance_timeout` | kind |
| | `match_complete` | result(win/lose), first_clear, shots_left, shots_fired, killed, total, boss_hp_left, chips, legend(caught/fled/missed/none), chance_used, duration_s, match_no |
| 다시 | `rematch` | mission |
| 이탈 | `pause_open` (via: button/back), `pause_action` (resume/restart/map/title) | |
| | `match_abandon` | where, shots_left, killed, total, chips |
| | `app_background` / `app_foreground` / `app_exit` | session_s, in_match / away_s / via |
| 예고 | `teaser_view` (2챕터 쿠키 영상) | via: clear(5번 첫 클리어) / map(잠긴 카드) |
| 의견 | `feedback_open` / `feedback_send` / `feedback_close` | via, mood, chip, has_note / why, step |

## 퍼널 (첫날)
app_open → loading_complete → title_view → title_play → first_action → match_start → match_complete(1판) → rematch / 다음 미션 → match_complete(3판, 마케팅 '진짜 유저')

## 마케팅 전환
- 설치·열기: `first_open`
- 활성: `first_action`
- 핵심 행동: `match_complete`
- 진짜 유저: `match_complete` 중 match_no ≥ 3
- 다음 날 재방문: `app_open` 중 day = 1

## 선배님 한마디
Supabase `public.senior_feedback` (app = `snowman-breaker`). 첫 판이 끝나면 한 사람에게 한 번만 여쭙고, 미션 고르는 화면·잠깐 쉬기 화면 아래 "만든 사람에게 한마디"로 언제든 열 수 있습니다.

## 테스트 기록
테스터 링크(`?t=이름`, PD는 `?dev`)일 때만 playtest-kit이 켜져 `playtest_log`(game = `snowman-breaker`)에 화면·판 기록을 남깁니다. 토스 실제 유저 기록은 토스 분석으로만 봅니다.
