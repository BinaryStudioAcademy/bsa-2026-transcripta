export interface TabsProps {
  /** strings or {id,label} */
  tabs?: (string|{id: string; label: string})[];
  active?: string;
  onChange?: (id: string) => void;
}