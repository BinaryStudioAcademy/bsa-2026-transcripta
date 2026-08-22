export interface TableProps {
  /** {key,label,mono?,align?} — mono cells render in JetBrains Mono */
  columns?: {key: string; label: string; mono?: boolean; align?: 'left'|'right'}[];
  /** cell values by column key; status tints the whole row: budget_stop (amber) and failed (error) demand action */
  rows?: ({status?: 'budget_stop'|'failed'; onClick?: () => void} & Record<string, React.ReactNode>)[];
}