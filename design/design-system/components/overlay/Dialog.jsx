import React from 'react';
export function Dialog({open=true,title,children,actions,inline=false,onClose,...rest}){
  if(!open)return null;
  return <div className="tx-scrim" style={inline?{position:'absolute'}:null} onClick={e=>{if(e.target===e.currentTarget&&onClose)onClose();}} {...rest}>
    <div className="tx-dialog" role="dialog" aria-modal="true">
      {title?<h2 className="tx-dialog-title">{title}</h2>:null}
      <div style={{font:'400 var(--fs-sm)/var(--lh-ui) var(--font-ui)',color:'var(--text-2)'}}>{children}</div>
      {actions?<div className="tx-dialog-actions">{actions}</div>:null}
    </div>
  </div>;
}
