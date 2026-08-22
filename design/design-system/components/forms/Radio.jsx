import React from 'react';
export function Radio({label,...rest}){
  const el=<input type="radio" className="tx-radio" {...rest}/>;
  return label?<label className="tx-field">{el}{label}</label>:el;
}
