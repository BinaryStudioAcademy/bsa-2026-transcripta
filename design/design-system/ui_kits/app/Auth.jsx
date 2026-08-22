function TxAuth({onIn,themeBtn}){
  const {Input,Button}=window.TranscriptaDesignSystem_fa1864;
  return <div style={{minHeight:'100%',background:'var(--bg)',display:'grid',placeItems:'center',fontFamily:'var(--font-ui)',color:'var(--text)',position:'relative'}}>
    {themeBtn?<div style={{position:'absolute',top:12,right:14}}>{themeBtn}</div>:null}
    <div style={{width:360,display:'flex',flexDirection:'column',gap:20,padding:'40px 0'}}>
      <div style={{display:'flex',gap:10,alignItems:'center',justifyContent:'center'}}>
        <span style={{width:30,height:30,borderRadius:6,background:'var(--seal-500)',display:'inline-grid',placeItems:'center'}}><svg width={20} height={20} viewBox="0 0 48 48"><path d="M7 12 L41 8.5 L39.5 17 L8.5 19.5 Z" fill="var(--paper-100)"/><path d="M19.5 15.5 L29 14.5 L26 42 L22.5 42 Z" fill="var(--paper-100)"/><circle cx="33.5" cy="38.5" r="3.4" fill="var(--paper-100)"/></svg></span>
        <span style={{font:'600 20px/1 var(--font-display)'}}>Transcripta</span>
      </div>
      <div style={{background:'var(--surface)',border:'1px solid var(--hairline)',borderRadius:'var(--r-lg)',padding:24,display:'flex',flexDirection:'column',gap:14,boxSizing:'border-box'}}>
        <h1 style={{font:'600 20px/1.2 var(--font-display)',margin:0}}>Sign in</h1>
        <Input label="Email" id="em" type="email" placeholder="you@archive.org"/>
        <Input label="Password" id="pw" type="password"/>
        <Button style={{width:'100%',marginTop:4}} onClick={onIn}>Sign in</Button>
        <div style={{textAlign:'center',font:'400 12px/1.4 var(--font-ui)',color:'var(--text-2)'}}>New here? <a href="#" onClick={e=>e.preventDefault()}>Create an account</a></div>
      </div>
    </div>
  </div>;
}
window.TxAuth=TxAuth;
