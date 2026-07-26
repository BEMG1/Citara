export interface IFigure {
  id: string;
  figureType?: 'figure' | 'table' | 'cuadro';
  number: number;
  imageUrl: string;
  title: string;
  caption?: string;
  note?: string;
  copyrightAttribution?: {
    type: "book" | "article" | "website" | "video" | "other";
    title: string;
    author: string;
    year: string;
    publisher?: string;
    journal?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    doi?: string;
    url?: string;
    siteName?: string;
    channel?: string;
    license?: string;
  };
}
