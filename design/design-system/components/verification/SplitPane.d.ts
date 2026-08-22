export interface SplitPaneProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** localStorage key — divider position is remembered */
  storageKey?: string;
  defaultPct?: number;
  minPct?: number;
  maxPct?: number;
}