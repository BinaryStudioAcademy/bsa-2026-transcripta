import React from 'react';
export function Textarea({label,id,style,...rest}){
  const el=<textarea id={id} className="tx-input" style={style} {...rest}/>;
  return label?<span style={{display:'block'}}><label className="tx-label" htmlFor={id}>{label}</label>{el}</span>:el;
}
