/** @startingPoint section="Core kit" subtitle="Primary, secondary, ghost, destructive" viewport="360x120" */
export interface ButtonProps {
  /** primary = seal-red fill (main action); secondary = quiet outline on ivory; ghost; destructive = error red, never seal */
  variant?: 'primary'|'secondary'|'ghost'|'destructive';
  size?: 'sm'|'md'|'lg'|'landing';
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}