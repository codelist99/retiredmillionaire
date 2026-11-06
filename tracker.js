(()=>{
  const makeId=()=>crypto.randomUUID().replaceAll('-','');
  let visitorId=localStorage.getItem('rm_visitor');
  if(!visitorId){visitorId=makeId();localStorage.setItem('rm_visitor',visitorId)}
  const sessionId=makeId(),started=Date.now(),video=document.querySelector('#presentation'),cta=document.querySelector('#cta');
  let engaged=0,lastTick=Date.now(),videoStarted=false,videoSeconds=0,videoPercent=0,ctaClicked=false;
  const device=innerWidth<768?'mobile':innerWidth<1100?'tablet':'desktop';
  const tick=()=>{const now=Date.now();if(document.visibilityState==='visible')engaged+=Math.min(2,Math.max(0,(now-lastTick)/1000));lastTick=now};
  const payload=exited=>JSON.stringify({sessionId,visitorId,path:location.pathname,query:location.search.slice(1),referrer:document.referrer,device,engagedSeconds:Math.round(engaged),videoStarted,videoSeconds:Math.round(videoSeconds),videoPercent:Math.round(videoPercent),ctaClicked,exited});
  const send=(exited=false)=>{tick();const body=payload(exited);if(exited&&navigator.sendBeacon){navigator.sendBeacon('/api/track',new Blob([body],{type:'application/json'}));return}fetch('/api/track',{method:'POST',headers:{'content-type':'application/json'},body,keepalive:true}).catch(()=>{})};
  setInterval(tick,1000);setInterval(()=>send(),15000);addEventListener('pagehide',()=>send(true));document.addEventListener('visibilitychange',()=>{tick();if(document.visibilityState==='hidden')send()});
  if(video){video.addEventListener('play',()=>{videoStarted=true;send()});video.addEventListener('timeupdate',()=>{videoSeconds=Math.max(videoSeconds,video.currentTime||0);if(video.duration&&Number.isFinite(video.duration))videoPercent=Math.max(videoPercent,video.currentTime/video.duration*100)})}
  if(cta)cta.addEventListener('click',()=>{ctaClicked=true;send(true)});
  send();
})();
