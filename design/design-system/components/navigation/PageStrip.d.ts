/** @startingPoint section="Verification" subtitle="Pager with 8 page states" viewport="620x120" */
export interface PageStripProps {
  /** page cells: n + state */
  pages?: {n: number; state: 'confirmed'|'corrected'|'skipped'|'current'|'ready'|'running'|'queued'|'error'}[];
  onSelect?: (n: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** show placeholder page thumbnail on hover (default true) */
  thumbs?: boolean;
  /** show the ▓ ready ░ running · queued legend */
  legend?: boolean;
}