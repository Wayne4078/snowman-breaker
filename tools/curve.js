// 업그레이드 단계(L: 네 줄 모두 같은 단계) × 미션별 승률. 봇 = '사람 비슷' 휴리스틱
const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:780}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8765/');await p.waitForTimeout(800);
 const LV=JSON.parse(process.argv[2]||'[0,2,4,6,8,10]'),N=+process.argv[3]||8,LEG=+process.argv[4]||0,MS=JSON.parse(process.argv[5]||'[0,1,2,3,4]');
 const res=await p.evaluate(({LV,N,LEG,MS})=>{
  let seed=1;Math.random=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const out={};
  for(const m of MS){out[m]={};for(const L of LV){let win=0,left=0,bossLeft=0;
   for(let r=0;r<N;r++){seed=1000+r*97+m*13+L;
    save={chips:0,shotLv:L,ballLv:L,pocketLv:L,bagLv:L,luckLv:0,bait:false,legends:LEG?{bowling:LEG}:{},equipLegend:LEG?'bowling':null,seenLegend:true,cleared:{},mission:0,plays:0,fbAsked:true};
    startMission(m);
    for(let s=0;s<300;s++){
      for(let k=0;k<200&&banner;k++)update(1/60);
      if(state==='chance'){useChance('cocoa');continue;}
      if(state!=='aim')break;
      for(let k=0;k<60&&groups.some(g=>g.fly);k++)update(1/30);
      const vis=groups.filter(g=>g.born>0&&!g.fleeing&&gBottom(g)>FIELD_TOP+20);
      const foes=vis.filter(g=>!g.boss&&!g.legend).sort((a,b)=>gBottom(b)-gBottom(a));
      const near=foes.length&&gBottom(foes[0])>DANGER-STEP*4;
      let g;
      const lg=vis.find(g=>g.legend);
      if(lg&&Math.random()<.6)g=lg;
      else if(bossG&&bossSeen&&!near&&Math.random()<.75)g=bossG;
      else g=foes[0]||bossG||vis[0];
      if(!g)break;
      const [x,y]=labelPos(g);let dx=x-shooterX+(Math.random()-.5)*24,dy=y-(FLOOR-6);if(dy>-20)dy=-20;const l=Math.hypot(dx,dy);fire([dx/l,dy/l]);
      for(let k=0;k<30*40&&state==='shooting';k++){ffwd=1;update(1/30);}
      if(state==='shooting'){balls=[];launchQ=0;endShot();}
    }
    if(state==='chance')loseNow();
    if(state==='win'){win++;left+=shotsLeft;}else bossLeft+=bossG?bossG.hp:0;
   }
   out[m][L]=`${Math.round(win/N*100)}%`+(win?` 남은샷${(left/win).toFixed(1)}`:` 보스남은${(bossLeft/Math.max(1,N-win)).toFixed(0)}`);
  }}
  return out;
 },{LV,N,LEG,MS});
 for(const m in res)console.log('M'+(+m+1),JSON.stringify(res[m]));
 console.log('err',errs.slice(0,3));await b.close();})();
