import React from 'react';
export function Table({columns=[],rows=[],...rest}){
  return <table className="tx-table" {...rest}>
    <thead><tr>{columns.map(c=><th key={c.key} style={c.align?{textAlign:c.align}:null}>{c.label}</th>)}</tr></thead>
    <tbody>{rows.map((r,i)=><tr key={i} className={r.status?'tx-row--'+r.status:null} onClick={r.onClick} style={r.onClick?{cursor:'pointer'}:null}>
      {columns.map(c=><td key={c.key} className={c.mono?'tx-num':null} style={c.align?{textAlign:c.align}:null}>{r[c.key]}</td>)}
    </tr>)}</tbody>
  </table>;
}
