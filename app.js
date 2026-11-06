const video=document.querySelector('#presentation');
const listen=document.querySelector('#listen');
const source='https://cdn.converteai.net/1cb78fac-ba21-44e0-8f10-1fe8402a675b/6995daf3555639423d56b6ba/main.m3u8';

if(video.canPlayType('application/vnd.apple.mpegurl'))video.src=source;
else if(window.Hls?.isSupported()){const hls=new Hls({enableWorker:true});hls.loadSource(source);hls.attachMedia(video)}

listen.addEventListener('click',async()=>{video.muted=false;video.controls=true;await video.play();listen.classList.add('hidden')});
video.addEventListener('play',()=>listen.classList.add('hidden'));

document.querySelector('#cta').addEventListener('click',event=>{
  window.dispatchEvent(new CustomEvent('retired-millionaire:cta'));
  event.preventDefault();
  const sharedCart=event.currentTarget.href;
  const checkout='https://makewellness.com/630BA81D95/Shopping/Checkout';
  const cartWindow=window.open('about:blank','make-cart-setup','popup=yes,width=120,height=120,left=-10000,top=-10000');
  if(!cartWindow){location.assign(sharedCart);return}
  document.querySelector('#checkout-status').hidden=false;
  event.currentTarget.style.pointerEvents='none';
  cartWindow.location.replace(sharedCart);
  setTimeout(()=>{
    try{cartWindow.close()}catch{}
    location.assign(checkout);
  },5000);
});
