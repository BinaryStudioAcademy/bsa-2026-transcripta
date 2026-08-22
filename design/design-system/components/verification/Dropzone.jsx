import React from 'react';
export function Dropzone({state='rest',file,reason,onChoose,style,...rest}){
  const cls='tx-drop'+(state!=='rest'&&state!=='selected'?' tx-drop--'+state:state==='selected'?' tx-drop--selected':'');
  return <div className={cls} style={style} {...rest}>
    {state==='selected'&&file?<>
      <b className="tx-num" style={{fontSize:13}}>{file}</b>
      <small>Ready to upload</small>
    </>:state==='rejected'?<>
      <b>{reason||'That file can’t be read'}</b>
      <small>PDFs and image archives · up to 500 MB, up to 500 pages</small>
      <button className="tx-btn tx-btn--secondary tx-btn--sm" onClick={onChoose} style={{marginTop:6}}>Choose another file</button>
    </>:<>
      <b>Drag a PDF here, or <a href="#" onClick={e=>{e.preventDefault();onChoose&&onChoose();}}>choose a file</a></b>
      <small>up to 500 MB, up to 500 pages</small>
    </>}
  </div>;
}
