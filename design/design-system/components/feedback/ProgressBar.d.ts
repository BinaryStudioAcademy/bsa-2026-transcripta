export interface ProgressBarProps {
  /** 0–100 — always determinate, never a spinner */
  value?: number;
  /** mono caption, left side, e.g. "dykanka-1887.pdf · 180 MB" */
  left?: string;
  /** mono caption, right side, e.g. "71%" */
  right?: string;
}