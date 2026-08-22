function TxDocuments({onOpen,onUpload}){
  const {Table,Chip,Button,BudgetMeter}=window.TranscriptaDesignSystem_fa1864;
  const columns=[{key:'name',label:'Document'},{key:'st',label:'Status'},{key:'pages',label:'Pages',mono:true,align:'right'},{key:'spent',label:'Spent',mono:true,align:'right'}];
  const rows=[
    {name:'Parish register, 1887',st:<Chip>Processing</Chip>,pages:'47/300',spent:'$0.98 / $10.00',onClick:onOpen},
    {name:'Hospital records, 1912',st:<Chip tone="ok">Done</Chip>,pages:'88/88',spent:'$2.14 / $10.00'},
    {name:'Ledger, 1903',st:<Chip tone="warn">Budget limit</Chip>,pages:'12/240',spent:'$10.00 / $10.00',status:'budget_stop'}];
  return <div style={{display:'flex',flexDirection:'column',gap:14}}>
    <div style={{display:'flex',justifyContent:'flex-end'}}><Button onClick={onUpload}>Upload a PDF</Button></div>
    <Table columns={columns} rows={rows}/>
    <span style={{font:'400 11px/1.4 var(--font-ui)',color:'var(--text-3)'}}>Ledger, 1903 stopped at its budget — open it to raise the limit. Click “Parish register, 1887” to continue verifying.</span>
  </div>;
}
function TxPresets(){
  const {Input,Textarea,Select,Checkbox,Button}=window.TranscriptaDesignSystem_fa1864;
  return <div style={{maxWidth:520,display:'flex',flexDirection:'column',gap:14}}>
    <Select label="Preset" id="pr" options={['Church records','Ledgers','Letters']}/>
    <Input label="Preset name" id="pn" defaultValue="Church records"/>
    <Textarea label="Prompt notes" id="pt" rows={4} defaultValue="Names repeat across pages; keep spelling. Dates are Julian calendar."/>
    <Checkbox label="Feed confirmed words into the lexicon" defaultChecked/>
    <div><Button>Save preset</Button></div>
  </div>;
}
Object.assign(window,{TxDocuments,TxPresets});
