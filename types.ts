
export enum ContentType {
  MANGA = 'Manga',
  MANHWA = 'Manhwa',
  MANHUA = 'Manhua',
  UNKNOWN = 'Comic'
}

export interface ReadingLink {
  source: string;
  url: string;
}

export interface Recommendation {
  id: string;
  title: string;
  type: ContentType;
  summary: string;
  links: ReadingLink[];
  imageQuery: string;
  imageUrl?: string;
}

export interface SearchState {
  loading: boolean;
  error: string | null;
  results: Recommendation[];
}
