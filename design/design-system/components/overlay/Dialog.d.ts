export interface DialogProps {
  open?: boolean;
  title?: string;
  /** position:absolute scrim for embedding in specimens */
  inline?: boolean;
  onClose?: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}