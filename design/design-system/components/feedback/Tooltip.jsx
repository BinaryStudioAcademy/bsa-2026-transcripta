import React from 'react';
export function Tooltip({tip,open=false,children,...rest}){
  return <span className={'tx-tip'+(open?' is-open':'')} data-tip={tip} tabIndex={0} {...rest}>{children}</span>;
}
