// 업그레이드 단계(L: 네 줄 모두 같은 단계) × 미션별 승률. 봇 = '사람 비슷' 휴리스틱
const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:780}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8765/');await p.waitForTimeout(800);
 const LV=JSON.parse(process.argv[2]||'[0,2,4,6,8,10]'),N=+process.argv[3]||8,LEG=+process.argv[4]||0,MS=JSON.parse(process.argv[5]||'[0,1,2,3,4]');
 const res=await p.evaluate((SEEDS)=>{
  const outs=[];
  for(let sd=0;sd<SEEDS;sd++){
  let seed=77+sd*1013;Math.random=()=>(seed=(seed*16807)%2147483647)/2147483647;
  save={chips:0,shotLv:0,ballLv:0,pocketLv:0,bagLv:0,luckLv:0,bait:false,legends:{},equipLegend:null,seenLegend:false,cleared:{},mission:0,plays:0,fbAsked:true};
  const runs=[0,0,0,0,0];let simT=0;const lvAt=[];
  const spend=()=>{const pri=['ballLv','shotLv','bagLv','pocketLv'];let any=true;while(any){any=false;for(const k of pri){const c=UPG_COSTS[save[k]];if(save[k]<10&&save.chips>=c){save.chips-=c;save[k]++;any=true;break;}}}};
  for(let m=0;m<5;m++){
   while(!save.cleared[m]&&runs[m]<80){runs[m]++;spend();startMission(m);simT+=20;
    for(let s=0;s<300;s++){
      for(let k=0;k<200&&banner;k++)update(1/60);
      if(state==='chance'){useChance('cocoa');continue;}
      if(state!=='aim')break;
      const vis=groups.filter(g=>g.born>0&&!g.fleeing&&gBottom(g)>FIELD_TOP+20);
      const foes=vis.filter(g=>!g.boss&&!g.legend).sort((a,b)=>gBottom(b)-gBottom(a));
      const near=foes.length&&gBottom(foes[0])>DANGER-STEP*4;
      let g;const lg=vis.find(g=>g.legend);
      if(lg&&Math.random()<.6)g=lg;else if(bossG&&bossSeen&&!near&&Math.random()<.75)g=bossG;else g=foes[0]||bossG||vis[0];
      if(!g)break;
      const [x,y]=labelPos(g);let dx=x-shooterX+(Math.random()-.5)*24,dy=y-(FLOOR-6);if(dy>-20)dy=-20;const l=Math.hypot(dx,dy);fire([dx/l,dy/l]);simT+=4;
      for(let k=0;k<30*40&&state==='shooting';k++){ffwd=1;update(1/30);simT+=1/30/1.6;}
      if(state==='shooting'){balls=[];launchQ=0;endShot();}
    }
    if(state==='chance')loseNow();
   }
   lvAt.push(`${save.shotLv}${save.ballLv}${save.pocketLv}${save.bagLv}`);
  }
  outs.push(`runs ${runs.join(',')} total ${runs.reduce((a,b)=>a+b)} 판, 약 ${Math.round(simT/60)}분, 깬 시점 레벨(샷·공·주머니·구슬) ${lvAt.join(' ')} 전설Lv${save.legends.bowling||0}`);
  }
  return outs;
 },+process.argv[2]||3);
 console.log(res.join('\n'));
 console.log('err',errs.slice(0,3));await b.close();})();
