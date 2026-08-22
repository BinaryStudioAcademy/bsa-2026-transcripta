import React from 'react';
export function Kbd({down=false,children,...rest}){
  return <kbd className={'tx-kbd'+(down?' is-down':'')} {...rest}>{children}</kbd>;
}
export function KbdHints({hints=[],...rest}){
  return <span className="tx-kbdrow" {...rest}>{hints.map((h,i)=><span key={i}><Kbd>{h.key}</Kbd>{h.label}</span>)}</span>;
}
