import React from 'react';
export function Chip({tone,mono=false,children,...rest}){
  return <span className={'tx-chip'+(tone?' tx-chip--'+tone:'')+(mono?' tnum':'')} {...rest}>{children}</span>;
}
