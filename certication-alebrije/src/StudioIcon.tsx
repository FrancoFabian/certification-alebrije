const shapes = {
  add: 'M12 5v14M5 12h14', arrow: 'M5 12h14m-6-6 6 6-6 6',
  back: 'm15 18-6-6 6-6',
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  archive: 'M3 4h18v4H3zM5 8v12h14V8m-10 4h6',
  edit: 'm16 4 4 4M4 20l4.8-1 10.7-10.7a2.1 2.1 0 0 0-3-3L5.8 16z',
  file: 'M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm7 0v6h5M9 14h6',
  search: 'm21 21-5-5m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14',
  check: 'm5 12 5 5L20 7',
}
export type StudioIconName = keyof typeof shapes
export function StudioIcon({ name, size = 22 }: { name: StudioIconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={shapes[name]}/></svg>
}
