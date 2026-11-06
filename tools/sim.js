const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:780}});
 const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));
 await p.goto('http://localhost:8765/');await p.waitForTimeout(800);
 const seeds=+process.argv[2]||1;
 for(let sd=0;sd<seeds;sd++){
 const out=await p.evaluate(()=>{
  localStorage.clear();
  save={chips:0,shotLv:0,ballLv:0,pocketLv:0,bagLv:0,luckLv:0,bait:false,legends:{},equipLegend:null,seenLegend:false,cleared:{},mission:0,plays:0,fbAsked:true};
  const log=[];let runs=0;
  const spend=()=>{const pri=['ballLv','shotLv','bagLv','pocketLv'];let any=true;while(any){any=false;for(const k of pri){const c=UPG_COSTS[save[k]];if(save[k]<10&&save.chips>=c){save.chips-=c;save[k]++;any=true;break;}}}};
  for(let m=0;m<5;m++){
    let tries=0;
    while(!save.cleared[m]&&tries<40){
      tries++;runs++;spend();startMission(m);
      for(let s=0;s<200;s++){
        for(let k=0;k<200&&state==='aim'&&banner;k++)update(1/60);
        if(state==='chance'){useChance('cocoa');continue;}
        if(state!=='aim')break;
        const gs=groups.filter(g=>g.born>0&&!g.fleeing&&gBottom(g)>FIELD_TOP+20);
        const lg=gs.find(g=>g.legend);
        gs.sort((a,b)=>gBottom(b)-gBottom(a));
        let g=lg&&Math.random()<.5?lg:(Math.random()<.6?gs[0]:gs[Math.floor(Math.random()*gs.length)]);
        if(!g)g=groups[0];if(!g)break;
        const [x,y]=labelPos(g);let dx=x-shooterX+(Math.random()-.5)*20,dy=y-(FLOOR-6);if(dy>-20)dy=-20;const l=Math.hypot(dx,dy);fire([dx/l,dy/l]);
        for(let k=0;k<60*40&&state==='shooting';k++){ffwd=1;update(1/30);}
        if(state==='shooting'){balls=[];launchQ=0;endShot();}
      }
      if(state==='chance')loseNow();
      log.push(`M${m+1}#${tries} ${state} shots${shotsLeft}/${maxShots} boss${bossG?bossG.hp:0} k${killedTotal}/${totalHP} chips+${chipsRun} lv[${save.shotLv}${save.ballLv}${save.pocketLv}${save.bagLv}] L${save.legends.bowling||0}`);
    }
  }
  return {runs,log};
 });
 console.log('seed',sd,'runs',out.runs);console.log(out.log.filter((l,i,a)=>l.includes('win')||i%3==0).join('\n'));
 }
 console.log('errors',errs.slice(0,5));await b.close();})();
