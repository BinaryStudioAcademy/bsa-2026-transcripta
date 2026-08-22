export interface ChipProps {
  /** status color; omit for neutral */
  tone?: 'seal'|'ok'|'warn'|'danger';
  /** mono/tabular numerals for counts */
  mono?: boolean;
  children?: React.ReactNode;
}