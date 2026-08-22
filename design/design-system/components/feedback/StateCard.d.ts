/** @startingPoint section="Verification" subtitle="Empty & degraded state anatomy" viewport="480x220" */
export interface StateCardProps {
  headline?: string;
  /** why the user is seeing this */
  reason?: string;
  /** mono estimate line, e.g. "about 40 seconds" */
  estimate?: string;
  actions?: {label: string; variant?: 'primary'|'secondary'|'ghost'|'destructive'; onClick?: () => void}[];
}