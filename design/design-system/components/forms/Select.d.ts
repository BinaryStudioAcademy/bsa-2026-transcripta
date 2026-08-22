export interface SelectProps {
  label?: string;
  id?: string;
  /** option strings */
  options?: string[];
  value?: string;
  disabled?: boolean;
  onChange?: (e: any) => void;
}