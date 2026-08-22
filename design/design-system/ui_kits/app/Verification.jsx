const RECORD_TXT="No. 15. Born on 11 January, Anna. Parents: peasant of Dykanka village, Petr Ivanenko and his lawful wife Maria, both Orthodox.";
function TxVerify({onBack,themeBtn}){
  const {SplitPane,PageStrip,ContextMark,BudgetMeter,QueuedChip,KbdHints,Kbd,Button,Dialog,StateCard,Toast}=window.TranscriptaDesignSystem_fa1864;
  const RECORD=<React.Fragment>No. 15. Born on 11 January, Anna. Parents: peasant of <ContextMark tip="from the lexicon, seen on 4 pages">Dykanka</ContextMark> village, Petr <ContextMark tip="from the lexicon, seen on 4 pages">Ivanenko</ContextMark> and his lawful wife Maria, both Orthodox.</React.Fragment>;
  const [pages,setPages]=React.useState([{n:44,state:'confirmed'},{n:45,state:'confirmed'},{n:46,state:'corrected'},{n:47,state:'current'},{n:48,state:'ready'},{n:49,state:'ready'},{n:50,state:'ready'},{n:51,state:'queued'}]);
  const [mode,setMode]=React.useState('read');
  const [help,setHelp]=React.useState(false);
  const [toast,setToast]=React.useState(null);
  const cur=pages.find(p=>p.state==='current');
  const advance=(newState)=>setPages(ps=>{
    const i=ps.findIndex(p=>p.state==='current');
    if(i<0)return ps;
    const next=ps.map((p,j)=>j===i?{...p,state:newState}:p);
    const k=next.findIndex(p=>p.state==='ready');
    if(k>=0)next[k]={...next[k],state:'current'};
    return next;
  });
  const act=(kind)=>{
    if(!cur)return;
    if(kind==='confirm'){advance(mode==='edit'?'corrected':'confirmed');setMode('read');setToast('Page '+cur.n+(mode==='edit'?' corrected':' confirmed'));}
    if(kind==='skip'){advance('skipped');setMode('read');}
    if(kind==='edit')setMode('edit');
  };
  React.useEffect(()=>{
    const h=e=>{
      if(e.key==='?'){setHelp(v=>!v);return;}
      if(e.key==='Escape'){setHelp(false);setMode('read');return;}
      if(mode==='edit'&&e.key!=='Enter')return;
      if(e.key==='Enter'){e.preventDefault();act('confirm');}
      else if(e.key==='e'||e.key==='E')act('edit');
      else if(e.key==='s'||e.key==='S')act('skip');
    };
    window.addEventListener('keydown',h);return ()=>window.removeEventListener('keydown',h);
  });
  const scan=<div style={{height:'100%',background:'var(--paper-100)',padding:'28px 32px',boxSizing:'border-box',position:'relative'}}>
    <span style={{position:'absolute',top:10,right:10,font:'400 10px/1 var(--font-mono)',color:'var(--paper-600)',border:'1px solid var(--paper-400)',borderRadius:3,padding:'3px 6px'}}>scan placeholder</span>
    <div style={{font:'italic 400 21px/1.9 var(--font-display)',color:'#453a28',maxWidth:520}}>{RECORD_TXT}</div>
  </div>;
  const text=<div style={{padding:'24px 28px',display:'flex',flexDirection:'column',gap:16,height:'100%',boxSizing:'border-box'}}>
    {cur?<React.Fragment>
      <span style={{font:'500 11px/1 var(--font-mono)',color:'var(--text-3)'}}>page {cur.n} of 300</span>
      {mode==='edit'
        ?<textarea className="tx-input" autoFocus rows={5} defaultValue={RECORD_TXT} style={{font:'400 15px/1.65 var(--font-ui)'}}></textarea>
        :<p style={{margin:0,font:'400 16px/1.65 var(--font-ui)',color:'var(--text)',maxWidth:560}}>{RECORD}</p>}
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <Button onClick={()=>act('confirm')}>{mode==='edit'?'Save & confirm':'Correct'}</Button>
        {mode==='read'?<Button variant="secondary" onClick={()=>act('edit')}>Edit</Button>:null}
        <Button variant="ghost" onClick={()=>act('skip')}>Skip</Button>
      </div>
    </React.Fragment>
    :<StateCard headline="Preparing the next pages" reason="Everything ready has been verified; the model is still reading." estimate="about 40 seconds" actions={[{label:'Pause',variant:'secondary'}]}/>}
  </div>;
  return <div style={{display:'flex',flexDirection:'column',height:'100%',background:'var(--bg)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>
    <header style={{height:48,flex:'none',display:'flex',alignItems:'center',gap:14,padding:'0 14px',borderBottom:'1px solid var(--hairline)'}}>
      <a href="#" onClick={e=>{e.preventDefault();onBack();}} style={{font:'500 12px/1 var(--font-ui)',color:'var(--text-2)',textDecoration:'none'}}>← Documents</a>
      <span style={{font:'600 15px/1.15 var(--font-display)'}}>Parish register, 1887</span>
      <div style={{flex:1}}></div>
      <KbdHints hints={[{key:'Enter',label:'Correct'},{key:'E',label:'Edit'},{key:'S',label:'Skip'},{key:'?',label:'Shortcuts'}]}/>
      <QueuedChip count={3}/>
      <BudgetMeter spent={0.98} limit={10}/>
      {themeBtn||null}
    </header>
    <div style={{flex:1,minHeight:0}}><SplitPane storageKey="tx-verify-split" left={scan} right={text} style={{height:'100%'}}/></div>
    <footer style={{height:46,flex:'none',display:'flex',alignItems:'center',justifyContent:'center',gap:16,borderTop:'1px solid var(--hairline)'}}>
      <PageStrip pages={pages}/>
      <span className="tx-pstrip-legend">▓ ready&ensp;░ running&ensp;· queued</span>
    </footer>
    {toast?<div style={{position:'absolute',bottom:60,right:16}}><Toast tone="ok" title={toast} action="Dismiss" onAction={()=>setToast(null)}/></div>:null}
    {help?<Dialog inline title="Keyboard shortcuts" onClose={()=>setHelp(false)} actions={<Button variant="secondary" onClick={()=>setHelp(false)}>Close</Button>}>
      <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:'10px 14px',alignItems:'center'}}>
        <Kbd>Enter</Kbd><span>Confirm the page as shown</span>
        <Kbd>E</Kbd><span>Edit the transcription</span>
        <Kbd>S</Kbd><span>Skip for later</span>
        <Kbd>?</Kbd><span>Toggle this overlay</span>
      </div>
    </Dialog>:null}
  </div>;
}
window.TxVerify=TxVerify;
