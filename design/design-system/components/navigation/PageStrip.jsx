import React from 'react';
const GLYPH={confirmed:'✓',corrected:'✎',skipped:'↷',current:'●',ready:'▓',running:'░',queued:'·',error:'!'};
export function PageStrip({pages=[],onSelect,onPrev,onNext,thumbs=true,legend=false,...rest}){
  return <div {...rest}>
    <div className="tx-pstrip">
      <button className="tx-page" aria-label="Previous" onClick={onPrev}>◄</button>
      {pages.map(p=><button key={p.n} className={'tx-page tx-page--'+p.state} onClick={()=>onSelect&&onSelect(p.n)}>
        {p.n}<span aria-hidden="true">{GLYPH[p.state]||''}</span>
        {thumbs&&p.state!=='current'?<span className="tx-page-thumb" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>:null}
      </button>)}
      <button className="tx-page" aria-label="Next" onClick={onNext}>►</button>
    </div>
    {legend?<div className="tx-pstrip-legend" style={{marginTop:6}}>▓ ready&ensp;░ running&ensp;· queued</div>:null}
  </div>;
}
