import React from 'react';
export function QueuedChip({count=0,...rest}){
  if(!count)return null;
  return <span className="tx-chip" {...rest}><span className="tnum" style={{fontSize:'var(--fs-xs)'}}>{count}</span>unsaved action{count===1?'':'s'}</span>;
}
