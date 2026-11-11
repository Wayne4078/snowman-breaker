// 게관위 제출용 실제 플레이 녹화 — 봇이 진짜 손가락(마우스) 드래그로 조준하고 버튼을 누른다.
// 녹화 대상은 제출하는 웹 게임 파일 그대로(file://). 중간 두 번만 저장값을 바꿔 뒤 미션으로 건너뛴다(로그에 기록).
const {chromium}=require('playwright');
const fs=require('fs');
const OUT='/home/claude/grac_sb/rec';
fs.mkdirSync(OUT+'/shots',{recursive:true});
const LIMIT=+(process.argv[2]||34)*60e3; // 전체 상한(ms)
(async()=>{
  const b=await chromium.launch();
  const ctxB=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,recordVideo:{dir:OUT,size:{width:720,height:1280}}});
  await ctxB.route(/supabase\.co/,r=>r.fulfill({status:201,body:''}));
  const p=await ctxB.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  const T0=Date.now();const el=()=>Date.now()-T0;
  const ts=ms=>{const s=Math.floor(ms/1000);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;};
  const log=[];const L=(m)=>{const line=`${ts(el())} ${m}`;log.push(line);console.log(line);fs.writeFileSync(OUT+'/timeline.txt',log.join('\n'));};
  let shotN=0;const shot=async(name)=>{shotN++;const f=`${String(shotN).padStart(2,'0')}_${name}.png`;await p.screenshot({path:OUT+'/shots/'+f});L('스크린샷 '+f);};
  const wait=ms=>p.waitForTimeout(ms);
  await p.goto('file:///home/claude/grac_sb/web/눈사람브레이커/index.html');
  await wait(2500);
  const G=(fn,arg)=>p.evaluate(fn,arg);
  const geo=async()=>G(()=>{const r=cv.getBoundingClientRect();return {sx:scale,ox:ox+r.left,oy:oy+r.top};});
  const tap=async(x,y,hold=90)=>{const g=await geo();const X=g.ox+x*g.sx,Y=g.oy+y*g.sx;await p.mouse.move(X,Y);await p.mouse.down();await wait(hold);await p.mouse.up();};
  const btnCenter=async(list,pat)=>G(({list,pat})=>{const arr=list==='lobby'?lobbyBtns:list==='hud'?hudBtns:pauseBtns;const re=new RegExp(pat);
    const hits=arr.filter(b=>re.test(b.fn.toString()));return hits.map(b=>[b.r[0]+b.r[2]/2,b.r[1]+b.r[3]/2]);},{list,pat});
  const tapBtn=async(list,pat,idx=0)=>{const c=await btnCenter(list,pat);if(!c.length)return false;const [x,y]=c[Math.min(idx,c.length-1)];await tap(x,y);return true;};
  const S=()=>G(()=>({state,paused,banner:!!banner,fbOpen,noTicket:typeof noTicket!=='undefined'&&noTicket,adBusy:typeof adBusy!=='undefined'&&adBusy,m:curMission,
    chips:save.chips,lv:[save.shotLv,save.ballLv,save.pocketLv,save.bagLv],tickets:save.tickets,legend:!!(save.legends&&save.legends.bowling),shotsLeft,
    legendOn:!!(legend&&legend.spawned&&legend.group),cleared:Object.keys(save.cleared||{}).length,teaser:!!save.teaserPending}));

  // 진행 표식
  let fbDone=false,pauseShown=false,backShown=false,shooterShot=false,chaosShot=false,legendShot=false,chanceShot=false,loseShot=false,winShot=false,lobbyShot=false,mapShot=false,teaserShown=false,noTicketShown=false;
  let phase=1,target=null; // target: 지금 하려는 미션 번호(0부터)
  let lastWinM=-1;

  async function aimAndShoot(){
    const pick=await G(()=>{
      const vis=groups.filter(g=>g.born>0&&!g.fleeing&&gBottom(g)>FIELD_TOP+20);
      const foes=vis.filter(g=>!g.boss&&!g.legend).sort((a,b)=>gBottom(b)-gBottom(a));
      const near=foes.length&&gBottom(foes[0])>DANGER-STEP*4;
      let g;const lg=vis.find(g=>g.legend);
      if(lg&&Math.random()<.7)g=lg;
      else if(bossG&&bossSeen&&!near&&Math.random()<.75)g=bossG;
      else g=foes[0]||bossG||vis[0];
      if(!g)return null;const [x,y]=labelPos(g);return {x,y,sx:shooterX,floor:FLOOR,legend:!!g.legend,boss:!!g.boss};
    });
    if(!pick)return false;
    // 손가락: 목표 근처에서 누르고, 조금 움직여 조준선을 맞춘 뒤 뗀다
    const jx=(Math.random()-.5)*22, y0=Math.min(pick.y+40,pick.floor-30);
    const g=await geo();const P=(x,y)=>[g.ox+x*g.sx,g.oy+y*g.sx];
    let [X,Y]=P(pick.x+jx*2.2,y0);await p.mouse.move(X,Y);await p.mouse.down();
    const steps=8+Math.floor(Math.random()*8);
    for(let i=1;i<=steps;i++){const k=i/steps;[X,Y]=P(pick.x+jx*2.2*(1-k)+jx*k,y0+(pick.y-y0)*k);await p.mouse.move(X,Y);await wait(45+Math.random()*40);}
    await wait(250+Math.random()*350);
    await p.mouse.up();
    return pick;
  }

  while(el()<LIMIT){
    let s;try{s=await S();}catch(e){L('상태 읽기 실패 '+e.message);await wait(500);continue;}
    if(s.fbOpen){
      await wait(1500);
      const has=async sel=>(await p.$(sel))!==null;
      if(await has('#fb button.good')){if(!fbDone){await shot('선배님_한마디');await p.click('#fb button.good');L('선배님 한마디: 좋았어요');}else{await p.click('#fb button[data-act="later"]');}}
      else if(await has('#fb button[data-chip]')){await p.click('#fb button[data-chip]');L('선배님 한마디: 칩 하나 고름');}
      else if(await has('#fb button[data-act="send0"]')){await p.click('#fb button[data-act="send0"]');fbDone=true;L('선배님 한마디: 이대로 보내기(녹화 환경에서는 전송을 가로챔)');await wait(2600);}
      else if(await has('#fb button[data-act="close"]')){await p.click('#fb button[data-act="close"]');}
      continue;
    }
    if(s.adBusy){await wait(500);continue;}
    if(s.state==='title'){await wait(2500);if(!shooterShot)await shot('첫화면');L('첫 화면 → 시작하기');await tapBtn('lobby','title_play');await wait(1500);continue;}
    if(s.state==='teaser'){
      if(!teaserShown){L('2챕터 예고(쿠키) 화면');await wait(4000);await shot('2챕터_예고');await wait(12000);teaserShown=true;}
      await tap(180,400);await wait(1500);continue;
    }
    if(s.state==='map'){
      await wait(1800);if(!mapShot){await shot('미션_고르기');mapShot=true;}
      // 갈 미션
      let m=target!=null?target:Math.min(s.cleared,4);
      if(teaserShown&&phase>=3&&s.cleared>=5){L('녹화 끝 — 미션 고르기 화면');await wait(3000);break;}
      const ok=await tapBtn('lobby','mission_select',m);L(`미션 ${m+1} 고름`);await wait(1500);
      if(!ok){await tap(180,200);await wait(1000);}
      continue;
    }
    if(s.state==='lobby'){
      if(s.noTicket){L('도전권 없음 창 → 광고 보고 1장 받기(웹은 2.5초 가짜 광고)');await wait(2000);await shot('도전권_없음');
        await tapBtn('lobby',"showRewardAd\\('ticket'");await wait(800);await shot('보상형_광고_자리');await wait(3500);noTicketShown=true;continue;}
      await wait(1500);
      if(!lobbyShot){await shot('준비_화면');lobbyShot=true;}
      // 업그레이드: 추천 순서대로 살 수 있는 만큼
      for(let k=0;k<12;k++){
        const rc=await G(()=>{const r=recommendUpgrade();return r&&r.key;});if(!rc)break;
        const idx=['shot','ball','pocket','bag'].indexOf(rc);await tap(304,314+idx*64+29);L(`업그레이드 구매: ${rc}`);await wait(900);
      }
      // 미끼(군고구마)는 3번 미션에서 한 번 켜 본다
      if(s.m===2&&!legendShot){const on=await G(()=>save.bait);if(!on){const c=await btnCenter('lobby','bait_toggle');if(c.length){await tap(...c[0]);L('미끼(군고구마) 켬');await wait(1200);}}}
      if(phase===3&&!noTicketShown){await G(()=>{save.tickets=0;save.ticketAt=Date.now();persist();});L('[녹화용 조작] 도전권 0장으로 — 도전권 없음 창 보여 주기');}
      await wait(800);L(`시작! (미션 ${s.m+1}, 업그레이드 ${s.lv.join('/')}, 구슬 ${s.chips}, 도전권 ${s.tickets})`);
      await tapBtn('lobby','tryStart\\(curMission\\)');await wait(1200);continue;
    }
    if(s.state==='aim'){
      if(s.banner||s.paused){await wait(400);continue;}
      if(s.legendOn&&!legendShot){await wait(300);await shot('전설의_고수_출현');legendShot=true;}
      // 잠깐 쉬기 버튼 한 번, 뒤로 가기 한 번 보여 주기
      if(s.m===1&&!pauseShown){L('잠깐 쉬기 버튼 → 메뉴');await tap(26,26);await wait(1500);await shot('잠깐_쉬기');await wait(2500);await tap(180,269);L('계속하기');await wait(1000);pauseShown=true;continue;}
      if(s.m===2&&!backShown){L('휴대폰 뒤로 가기 → 잠깐 쉬기');await G(()=>history.back());await wait(3000);await tap(180,269);L('계속하기');await wait(1000);backShown=true;continue;}
      await wait(500+Math.random()*700);
      const pk=await aimAndShoot();if(!pk){await wait(500);continue;}
      if(!shooterShot){await wait(150);await shot('조준_발사');shooterShot=true;}
      const t1=Date.now();let ff=false;
      while(true){await wait(250);const st=await G(()=>state);if(st!=='shooting')break;
        if(!chaosShot&&Date.now()-t1>1800&&s.m>=1){await shot('눈뭉치_연쇄');chaosShot=true;}
        if(!ff&&Date.now()-t1>6000){await tap(180,300);ff=true;}
        if(Date.now()-t1>60000)break;}
      continue;
    }
    if(s.state==='shooting'){await wait(300);continue;}
    if(s.state==='chance'){await wait(1800);if(!chanceShot){await shot('부활_제안');chanceShot=true;}
      const used=await tapBtn('hud','reviveAd');
      // 첫 버튼(무료/광고 부활)만 쓰고, 이미 썼으면 그만하기
      if(!used)await tapBtn('hud','chance_decline');
      L('부활 제안 → 핫초코(샷 +3)');await wait(1500);
      const st=await G(()=>state);if(st==='chance'){await tapBtn('hud','chance_decline');L('부활 안 함');await wait(1200);}
      continue;
    }
    if(s.state==='win'||s.state==='lose'){
      await wait(2600);
      if(await G(()=>fbOpen))continue;
      if(s.state==='lose'&&!loseShot){await shot('패배_아까움_추천');loseShot=true;}
      if(s.state==='win'&&!winShot){await shot('승리');winShot=true;}
      L(s.state==='win'?`미션 ${s.m+1} 승리 (남은 샷 ${s.shotsLeft}, 구슬 ${s.chips})`:`미션 ${s.m+1} 패배 (구슬 ${s.chips})`);
      if(s.state==='win'){lastWinM=s.m;}
      // 단계 넘기기(녹화 시간 맞추기용 저장값 조작)
      const now=el();
      if(phase===1&&(s.cleared>=3||now>15*60e3)){phase=2;target=3;
        await G(()=>{for(const k of ['shotLv','ballLv','pocketLv','bagLv'])save[k]=Math.max(save[k]||0,7);save.cleared[0]=save.cleared[1]=save.cleared[2]=1;save.mission=3;save.seenLegend=true;if(!save.legends.bowling){save.legends.bowling=1;save.equipLegend='bowling';}save.tickets=Math.max(save.tickets,3);persist();});
        L('[녹화용 조작] 1단계 끝 — 업그레이드를 7단계로, 1~3번 클리어로 표시하고 4번 미션으로');}
      else if(phase===2&&(s.cleared>=4||now>22*60e3)){phase=3;target=4;
        await G(()=>{for(const k of ['shotLv','ballLv','pocketLv','bagLv'])save[k]=10;save.cleared[3]=1;save.mission=4;save.legends.bowling=Math.max(2,save.legends.bowling||1);save.equipLegend='bowling';persist();});
        L('[녹화용 조작] 2단계 끝 — 업그레이드 10단계(최대), 대왕 눈덩이 2레벨로 5번 미션');}
      else if(phase===3&&s.state==='win'&&s.m===4){/* 예고편으로 */}
      if(phase===3&&now>LIMIT-3*60e3&&!teaserShown&&s.state==='lose'){L('시간이 다 돼 지도에서 2챕터 카드로 예고 보기');}
      // 버튼: 이기면 다음(또는 예고), 지면 준비 화면
      if(s.state==='win'){await tapBtn('hud','rematch|openTeaser',0);}
      else{await tapBtn('hud',"go\\('lobby'\\);sfx",0);}
      await wait(1500);
      const st=await G(()=>state);
      if(target!=null&&st==='lobby'){const cm=await G(()=>curMission);if(cm!==target){await G(()=>go('map'));L(`지도로 (미션 ${target+1}로 이동)`);}}
      if(phase===3&&now>LIMIT-3*60e3&&!teaserShown&&st!=='teaser'){await G(()=>go('map'));await wait(1500);await tapBtn('lobby','openTeaser\\(\'map\'\\)');}
      continue;
    }
    await wait(500);
  }
  L('끝. 오류: '+JSON.stringify(errs.slice(0,5)));
  const v=p.video();await ctxB.close();const vp=await v.path();fs.renameSync(vp,OUT+'/play.webm');await b.close();
  console.log('video',OUT+'/play.webm');
})();
