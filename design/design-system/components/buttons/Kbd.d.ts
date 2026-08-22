export interface KbdProps {
  /** pressed-in state */
  down?: boolean;
  children?: React.ReactNode;
}
export interface KbdHintsProps {
  /** e.g. [{key:'Enter',label:'Correct'},{key:'E',label:'Edit'},{key:'S',label:'Skip'}] */
  hints?: {key: string; label: string}[];
}