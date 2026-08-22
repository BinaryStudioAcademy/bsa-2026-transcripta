import React from 'react';
export function Tabs({tabs=[],active,onChange,...rest}){
  return <div className="tx-tabs" role="tablist" {...rest}>{tabs.map(t=>{
    const id=typeof t==='string'?t:t.id,label=typeof t==='string'?t:t.label;
    return <button key={id} role="tab" aria-selected={id===active} className={'tx-tab'+(id===active?' is-active':'')} onClick={()=>onChange&&onChange(id)}>{label}</button>;
  })}</div>;
}
