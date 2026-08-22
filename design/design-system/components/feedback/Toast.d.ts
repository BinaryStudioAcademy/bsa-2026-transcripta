export interface ToastProps {
  tone?: 'neutral'|'ok'|'warn'|'danger';
  title?: string;
  detail?: string;
  /** optional action button label */
  action?: string;
  onAction?: () => void;
}