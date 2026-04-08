export interface Segment {
  id: string;
  rating: number;
  coordinates: [number, number][];
  user_id: string | null;
}

export const RATINGS = [
  {
    value: 1,
    label: 'Kansloos',
    emoji: '💀',
    stars: '★',
    description: 'Hier kun je echt niet overheen op skates. Denk aan een grindweg.',
  },
  {
    value: 2,
    label: 'Slecht',
    emoji: '😬',
    stars: '★★',
    description:
      'Erg onregelmatig wegdek. Te doen voor kort stukje, maar je moet voorzichtig rijden. Groffe klinkers, slecht asfalt.',
  },
  {
    value: 3,
    label: 'Redelijk',
    emoji: '🙂',
    stars: '★★★',
    description:
      'Goed te doen voor wat langere stukken, maar je wil niet dat je hele route zo is. Vaart maken is mogelijk. Bijvoorbeeld strak gelegde klinkers of stoeptegels, beetje grof asfalt.',
  },
  {
    value: 4,
    label: 'Goed',
    emoji: '😎',
    stars: '★★★★',
    description:
      'Als de hele route zo is, ben je blij. Vaart maken kan goed. Behoorlijk glad asfalt.',
  },
  {
    value: 5,
    label: 'Geweldig',
    emoji: '🔥',
    stars: '★★★★★',
    description: 'Zingende engelen begeleiden je op deze route. Violen zwellen aan.',
  },
] as const;

export type Rating = (typeof RATINGS)[number];
