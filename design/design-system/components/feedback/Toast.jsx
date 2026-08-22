import React from 'react';
const G={neutral:'·',ok:'✓',warn:'!',danger:'✕'};
export function Toast({tone='neutral',title,detail,action,onAction,...rest}){
  return <div className={'tx-toast tx-toast--'+tone} role="status" {...rest}>
    <span className="tx-toast-glyph" aria-hidden="true">{G[tone]}</span>
    <span style={{flex:1}}><b style={{fontWeight:600}}>{title}</b>{detail?<span style={{display:'block',color:'var(--text-2)',fontSize:'var(--fs-xs)'}}>{detail}</span>:null}</span>
    {action?<button className="tx-btn tx-btn--ghost tx-btn--sm" onClick={onAction}>{action}</button>:null}
  </div>;
}
