export interface BudgetMeterProps {
  spent?: number;
  limit?: number;
  /** shown on the hard-stop state */
  onRaise?: () => void;
}