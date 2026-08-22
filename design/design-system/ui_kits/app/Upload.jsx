function TxUpload({onDone}){
  const {Dropzone,ProgressBar,Button,StateCard}=window.TranscriptaDesignSystem_fa1864;
  const [step,setStep]=React.useState('rest');
  return <div style={{maxWidth:560,display:'flex',flexDirection:'column',gap:16}}>
    {step==='rest'?<Dropzone onChoose={()=>setStep('selected')}/>:null}
    {step==='selected'?<React.Fragment>
      <Dropzone state="selected" file="dykanka-1887.pdf · 180 MB"/>
      <div style={{display:'flex',gap:8}}><Button onClick={()=>setStep('uploading')}>Upload</Button><Button variant="ghost" onClick={()=>setStep('rest')}>Remove</Button></div>
    </React.Fragment>:null}
    {step==='uploading'?<React.Fragment>
      <ProgressBar value={71} left="dykanka-1887.pdf · 180 MB" right="71%"/>
      <ProgressBar value={96} left="page 48 of 50" right="about 40 seconds"/>
      <StateCard headline="Preparing the next pages" reason="The model transcribes ahead of you, so verification never waits." estimate="about 40 seconds" actions={[{label:'Review the ready ones',onClick:onDone},{label:'Pause',variant:'ghost'}]}/>
    </React.Fragment>:null}
  </div>;
}
window.TxUpload=TxUpload;
