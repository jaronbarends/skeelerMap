export interface Segment {
  id: string;
  ratingValue: RatingValue;
  coordinates: [number, number][];
  userId: string | null;
}

export const RATINGS = [
  {
    value: 1,
    label: 'Kansloos',
    emoji: '💀',
    stars: '★',
    description: 'Hier kun je echt niet overheen op skeelers. Bijvoorbeeld: grindweg.',
  },
  {
    value: 2,
    label: 'Slecht',
    emoji: '😬',
    stars: '★★',
    description:
      'Erg onregelmatig wegdek. Te doen voor kort stukje, maar je moet voorzichtig rijden i.v.m. kans op vallen. (Bijvoorbeeld: groffe klinkers, slecht asfalt.)',
  },
  {
    value: 3,
    label: 'Redelijk',
    emoji: '🙂',
    stars: '★★★',
    description:
      'Goed te doen voor wat langere stukken, maar je wil niet dat je hele route zo is. Vaart maken is mogelijk. (Bijvoorbeeld: strak gelegde klinkers of stoeptegels, beetje grof asfalt.)',
  },
  {
    value: 4,
    label: 'Goed',
    emoji: '😎',
    stars: '★★★★',
    description:
      'Als de hele route zo is, ben je blij. Vaart maken kan goed. (Bijvoorbeeld: behoorlijk glad asfalt.)',
  },
  {
    value: 5,
    label: 'Geweldig',
    emoji: '🔥',
    stars: '★★★★★',
    description:
      'De ondergrond waar je van droomt. Nauwelijks weerstand. (Bijvoorbeeld: zeer glad asfalt, strakke betonplaten.)',
  },
] as const;

export type RatingValue = (typeof RATINGS)[number]['value'];

export function getRatingByValue(value: RatingValue): Rating {
  return RATINGS.find((rating) => rating.value === value)!;
}

export type Rating = (typeof RATINGS)[number];
