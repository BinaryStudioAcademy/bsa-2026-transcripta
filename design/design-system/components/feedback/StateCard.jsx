import React from 'react';
export function StateCard({headline,reason,estimate,actions=[],style,...rest}){
  return <div className="tx-state" style={style} {...rest}>
    <h3 className="tx-state-h">{headline}</h3>
    {reason?<p className="tx-state-reason">{reason}</p>:null}
    {estimate?<span className="tx-state-est">{estimate}</span>:null}
    {actions.length?<div className="tx-state-actions">{actions.map((a,i)=><button key={i} className={'tx-btn tx-btn--sm tx-btn--'+(a.variant||(i===0?'primary':'secondary'))} onClick={a.onClick}>{a.label}</button>)}</div>:null}
  </div>;
}
