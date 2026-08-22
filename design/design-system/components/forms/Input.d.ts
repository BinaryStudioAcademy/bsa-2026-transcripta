export interface InputProps {
  /** optional uppercase micro-label above the field */
  label?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  value?: string;
  onChange?: (e: any) => void;
}