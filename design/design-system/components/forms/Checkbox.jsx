import React from 'react';
export function Checkbox({label,...rest}){
  const el=<input type="checkbox" className="tx-check" {...rest}/>;
  return label?<label className="tx-field">{el}{label}</label>:el;
}
