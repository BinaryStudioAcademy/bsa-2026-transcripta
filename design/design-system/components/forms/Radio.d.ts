export interface RadioProps {
  label?: string;
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (e: any) => void;
}