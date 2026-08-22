const Lockup=()=><span style={{display:'inline-flex',gap:9,alignItems:'center'}}><span style={{width:26,height:26,borderRadius:5,background:'var(--seal-500)',display:'inline-grid',placeItems:'center'}}><svg width={18} height={18} viewBox="0 0 48 48"><path d="M7 12 L41 8.5 L39.5 17 L8.5 19.5 Z" fill="var(--paper-100)"/><path d="M19.5 15.5 L29 14.5 L26 42 L22.5 42 Z" fill="var(--paper-100)"/><circle cx="33.5" cy="38.5" r="3.4" fill="var(--paper-100)"/></svg></span><span style={{font:'600 17px/1 var(--font-display)',color:'var(--text)'}}>Transcripta</span></span>;
function TxLanding(){
  const {Button,ContextMark,KbdHints,Chip,ProgressBar,BudgetMeter}=window.TranscriptaDesignSystem_fa1864;
  return <div style={{background:'var(--bg)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>
    <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 64px',borderBottom:'1px solid var(--hairline)'}}>
      <Lockup/>
      <div style={{display:'flex',gap:28,alignItems:'center'}}>
        <a href="#how" style={{font:'500 13px var(--font-ui)',textDecoration:'none'}}>How it works</a>
        <a href="#night" style={{font:'500 13px var(--font-ui)',textDecoration:'none'}}>Night reading</a>
        <Button variant="secondary" size="lg">Sign in</Button>
      </div>
    </nav>
    <header style={{display:'grid',gridTemplateColumns:'1.05fr 1fr',gap:56,alignItems:'center',padding:'88px 64px 96px',maxWidth:1240,margin:'0 auto',boxSizing:'border-box'}}>
      <div>
        <h1 style={{font:'600 52px/1.12 var(--font-display)',margin:0,letterSpacing:'-.01em',textWrap:'balance'}}>Handwritten archives, read and verified.</h1>
        <p style={{font:'400 17px/1.6 var(--font-ui)',color:'var(--text-2)',margin:'20px 0 28px',maxWidth:480}}>Upload a scanned PDF. A model transcribes every page; you verify each one in under ten seconds. Confirmed words feed back into the prompt as a lexicon, so accuracy grows while you work.</p>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <Button size="landing">Start transcribing</Button>
          <span style={{font:'400 12px/1.4 var(--font-ui)',color:'var(--text-3)'}}>up to 500 MB, up to 500 pages</span>
        </div>
      </div>
      <div style={{background:'var(--surface)',border:'1px solid var(--hairline)',borderRadius:'var(--r-lg)',padding:24,boxShadow:'var(--shadow-pop)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <span style={{font:'600 14px var(--font-display)'}}>Parish register, 1887</span>
          <span className="tnum" style={{fontSize:11,color:'var(--text-3)'}}>page 47 of 300</span>
        </div>
        <p style={{margin:0,font:'400 15px/1.65 var(--font-ui)'}}>No. 15. Born on 11 January, Anna. Parents: peasant of <ContextMark tip="from the lexicon, seen on 4 pages">Dykanka</ContextMark> village, Petr <ContextMark tip="from the lexicon, seen on 4 pages">Ivanenko</ContextMark> and his lawful wife Maria, both Orthodox.</p>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:18,paddingTop:14,borderTop:'1px solid var(--hairline)'}}>
          <KbdHints hints={[{key:'Enter',label:'Correct'},{key:'E',label:'Edit'},{key:'S',label:'Skip'}]}/>
          <BudgetMeter spent={0.98} limit={10}/>
        </div>
      </div>
    </header>
    <section id="how" style={{borderTop:'1px solid var(--hairline)',padding:'72px 64px 84px'}}>
      <div style={{maxWidth:1112,margin:'0 auto'}}>
        <h2 style={{font:'600 30px/1.2 var(--font-display)',margin:'0 0 36px'}}>How it works</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
          {[['01','Upload','Drag a PDF here, or choose a file. Pages start processing immediately, oldest first.'],
            ['02','The model reads','Every page is transcribed with your preset and the growing lexicon. Progress is always determinate — a reason and an approximate time, never a spinner.'],
            ['03','You verify','Scan beside text, keyboard only. Confirm, correct, or skip — each page in under ten seconds.']].map(([n,t,d])=>
          <div key={n} style={{background:'var(--surface)',border:'1px solid var(--hairline)',borderRadius:'var(--r-lg)',padding:'22px 22px 26px'}}>
            <span className="tnum" style={{fontSize:12,color:'var(--accent-text)'}}>{n}</span>
            <h3 style={{font:'600 19px/1.25 var(--font-display)',margin:'10px 0 8px'}}>{t}</h3>
            <p style={{margin:0,font:'400 13.5px/1.6 var(--font-ui)',color:'var(--text-2)'}}>{d}</p>
          </div>)}
        </div>
      </div>
    </section>
    <section id="night" data-theme="dark" style={{background:'var(--bg)',color:'var(--text)',padding:'72px 64px 84px'}}>
      <div style={{maxWidth:1112,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:56,alignItems:'center'}}>
        <div>
          <h2 style={{font:'600 30px/1.2 var(--font-display)',margin:0}}>A reading room at night.</h2>
          <p style={{font:'400 15px/1.65 var(--font-ui)',color:'var(--text-2)',margin:'16px 0 0',maxWidth:440}}>Verification is evening work. The dark theme keeps surfaces warm and near-black while the scanned page stays the brightest thing on screen — hours of reading without glare.</p>
        </div>
        <div style={{background:'var(--surface)',border:'1px solid var(--hairline)',borderRadius:'var(--r-lg)',padding:20,display:'flex',gap:16}}>
          <div style={{flex:'none',width:150,background:'var(--paper-100)',borderRadius:'var(--r-sm)',padding:'14px 12px'}}>
            {[92,78,86,64,88,72,80].map((w,i)=><div key={i} style={{height:4,width:w+'%',background:'var(--paper-400)',borderRadius:2,marginBottom:8}}></div>)}
          </div>
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:12,justifyContent:'center'}}>
            <p style={{margin:0,font:'400 13.5px/1.6 var(--font-ui)'}}>…peasant of <ContextMark tip="from the lexicon, seen on 4 pages">Dykanka</ContextMark> village, Petr <ContextMark tip="from the lexicon, seen on 4 pages">Ivanenko</ContextMark>…</p>
            <ProgressBar value={96} left="page 48 of 50" right="about 40 seconds"/>
          </div>
        </div>
      </div>
    </section>
    <section style={{borderTop:'1px solid var(--hairline)',padding:'80px 64px',textAlign:'center'}}>
      <h2 style={{font:'600 34px/1.15 var(--font-display)',margin:'0 0 12px'}}>Your archive is waiting.</h2>
      <p style={{font:'400 15px/1.6 var(--font-ui)',color:'var(--text-2)',margin:'0 0 28px'}}>Set a budget, upload a PDF, and start confirming pages.</p>
      <Button size="landing">Start transcribing</Button>
    </section>
    <footer style={{borderTop:'1px solid var(--hairline)',padding:'24px 64px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <Lockup/>
      <span className="tnum" style={{fontSize:11,color:'var(--text-3)'}}>© 2026 Transcripta · BSA</span>
    </footer>
  </div>;
}
window.TxLanding=TxLanding;
