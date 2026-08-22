/** @startingPoint section="Core kit" subtitle="PDF upload zone, 4 states" viewport="480x200" */
export interface DropzoneProps {
  state?: 'rest'|'over'|'selected'|'rejected';
  /** filename shown in the selected state */
  file?: string;
  /** rejection headline */
  reason?: string;
  onChoose?: () => void;
}