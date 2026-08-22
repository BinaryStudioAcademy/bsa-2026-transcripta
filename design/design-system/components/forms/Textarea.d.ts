export interface TextareaProps {
  label?: string;
  id?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  value?: string;
  onChange?: (e: any) => void;
}