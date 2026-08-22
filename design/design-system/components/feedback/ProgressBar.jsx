import React from 'react';
export function ProgressBar({value=0,left,right,style,...rest}){
  return <div style={style} {...rest}>
    <div className="tx-progress-track"><div className="tx-progress-fill" style={{width:Math.min(100,Math.max(0,value))+'%'}}></div></div>
    {(left||right)?<div className="tx-progress-cap"><span>{left}</span><span>{right}</span></div>:null}
  </div>;
}
