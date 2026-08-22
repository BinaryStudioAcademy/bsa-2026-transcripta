import React from 'react';
export function Select({label,id,options=[],style,...rest}){
  const el=<span className="tx-selectwrap" style={style}><select id={id} className="tx-input" {...rest}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select></span>;
  return label?<span style={{display:'block'}}><label className="tx-label" htmlFor={id}>{label}</label>{el}</span>:el;
}
