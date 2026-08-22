function TxShell({title,active,onNav,right,children,unsaved}){
  const {Chip,BudgetMeter,QueuedChip}=window.TranscriptaDesignSystem_fa1864;
  const Item=({id,label})=><a href="#" onClick={e=>{e.preventDefault();onNav(id);}} style={{display:'flex',alignItems:'center',height:32,padding:'0 10px',borderRadius:'var(--r-md)',background:active===id?'var(--surface-2)':'transparent',color:active===id?'var(--text)':'var(--text-2)',font:'500 13px/1 var(--font-ui)',textDecoration:'none'}}>{label}</a>;
  return <div style={{display:'flex',height:'100%',background:'var(--bg)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>
    <aside style={{width:'var(--sidebar-w)',flex:'none',display:'flex',flexDirection:'column',borderRight:'1px solid var(--hairline)',padding:'14px 12px',boxSizing:'border-box',gap:4}}>
      <div style={{display:'flex',gap:9,alignItems:'center',padding:'4px 8px 14px'}}>
        <span style={{width:26,height:26,borderRadius:5,background:'var(--seal-500)',display:'inline-grid',placeItems:'center'}}><svg width={18} height={18} viewBox="0 0 48 48"><path d="M7 12 L41 8.5 L39.5 17 L8.5 19.5 Z" fill="var(--paper-100)"/><path d="M19.5 15.5 L29 14.5 L26 42 L22.5 42 Z" fill="var(--paper-100)"/><circle cx="33.5" cy="38.5" r="3.4" fill="var(--paper-100)"/></svg></span>
        <span style={{font:'600 16px/1 var(--font-display)'}}>Transcripta</span>
      </div>
      <Item id="documents" label="Documents"/>
      <Item id="presets" label="Presets"/>
      <div style={{flex:1}}></div>
      <div style={{borderTop:'1px solid var(--hairline)',padding:'10px 8px 2px',display:'flex',flexDirection:'column',gap:6}}>
        <span style={{font:'400 12px/1.3 var(--font-ui)',color:'var(--text-2)'}}>reader@example.com</span>
        <a href="#" onClick={e=>{e.preventDefault();onNav('auth');}} style={{font:'500 12px/1 var(--font-ui)',color:'var(--text-3)',textDecoration:'none'}}>Sign out</a>
      </div>
    </aside>
    <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
      <header style={{height:56,flex:'none',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',borderBottom:'1px solid var(--hairline)'}}>
        <h1 style={{font:'600 22px/1.15 var(--font-display)',margin:0}}>{title}</h1>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>{unsaved?<QueuedChip count={unsaved}/>:null}{right}</div>
      </header>
      <main style={{flex:1,overflow:'auto',padding:20,minHeight:0}}>{children}</main>
    </div>
  </div>;
}
window.TxShell=TxShell;
