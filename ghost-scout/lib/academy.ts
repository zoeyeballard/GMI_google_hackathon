export function matchAcademy(position: string, dominantFoot: string, _country: string): string {
  if (position === 'winger' && dominantFoot === 'left') return 'FC Barcelona La Masia'
  if (position === 'striker') return 'RB Leipzig Academy'
  if (position === 'midfielder') return 'Ajax Academy'
  if (position === 'defender') return 'Atalanta Academy'
  if (position === 'goalkeeper') return 'Manchester City Academy'
  if (position === 'winger') return 'Borussia Dortmund Academy'
  return 'Ajax Academy'
}
