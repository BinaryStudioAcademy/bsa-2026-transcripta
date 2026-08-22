import React from 'react';
const fmt=n=>'$'+Number(n).toFixed(2);
export function BudgetMeter({spent=0,limit=10,onRaise,...rest}){
  const pct=limit>0?spent/limit:0;
  const state=pct>=1?'stop':pct>=0.8?'warn':'ok';
  return <span style={{display:'inline-flex',alignItems:'center',gap:8}} {...rest}>
    <span className={'tx-budget'+(state==='ok'?'':' tx-budget--'+state)}>
      <span className="tx-budget-bar"><i style={{width:Math.min(100,pct*100)+'%'}}></i></span>
      {fmt(spent)} / {fmt(limit)}
    </span>
    {state==='stop'?<button className="tx-btn tx-btn--secondary tx-btn--sm" onClick={onRaise}>Raise the limit</button>:null}
  </span>;
}
