import React from 'react';
export function SplitPane({left,right,storageKey='tx-split',defaultPct=52,minPct=25,maxPct=75,style,...rest}){
  const saved=Number(typeof localStorage!=='undefined'&&localStorage.getItem(storageKey));
  const [pct,setPct]=React.useState(saved>=minPct&&saved<=maxPct?saved:defaultPct);
  const [drag,setDrag]=React.useState(false);
  const ref=React.useRef(null);
  React.useEffect(()=>{
    if(!drag)return;
    const move=e=>{
      const r=ref.current.getBoundingClientRect();
      const p=Math.min(maxPct,Math.max(minPct,(e.clientX-r.left)/r.width*100));
      setPct(p);
    };
    const up=()=>{setDrag(false);try{localStorage.setItem(storageKey,String(Math.round(pctRef.current)));}catch(e){}};
    window.addEventListener('mousemove',move);window.addEventListener('mouseup',up);
    return ()=>{window.removeEventListener('mousemove',move);window.removeEventListener('mouseup',up);};
  },[drag]);
  const pctRef=React.useRef(pct);pctRef.current=pct;
  return <div ref={ref} className="tx-split" style={style} {...rest}>
    <div className="tx-split-pane" style={{width:pct+'%'}}>{left}</div>
    <div className={'tx-split-divider'+(drag?' is-dragging':'')} onMouseDown={e=>{e.preventDefault();setDrag(true);}} role="separator" aria-orientation="vertical"><span className="tx-split-grip"></span></div>
    <div className="tx-split-pane" style={{flex:1}}>{right}</div>
  </div>;
}
