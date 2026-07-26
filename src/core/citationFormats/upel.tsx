import type { ICitationFormatter } from './types';
import type { IReference } from '@/core/referenceUtils';
import { getYear } from '@/core/referenceUtils';
import { es, en } from '@/i18n';

const formatSingleAuthorSurname = (name: string): string => {
  const parts = name.split(',');
  return parts.length > 1 ? parts[0].trim() : name.trim();
};

const splitAuthors = (authorStr: string): string[] =>
  authorStr.split(/;| & | and | y /i).map((a) => a.trim()).filter(Boolean);

const tText = (key: keyof typeof es, lang?: string): string => ((lang === 'en' ? en[key] : es[key]) ?? es[key]) as string;

export const upelFormatter: ICitationFormatter = {
  sortMode: 'alphabetical',
  sectionHeading: (lang?: string) => (lang === 'en' ? 'References' : 'Referencias'),

  formatReference(ref: IReference, lang?: string): string {
    const author = ref.author || tText('unknownAuthor', lang);
    const year = getYear(ref.year, lang);
    const title = ref.title || tText('unknownTitle', lang);

    switch (ref.type) {
      case 'book':
        return `${author} (${year}). ${title}. ${ref.publisher || `[${tText('publisher', lang)}]`}.`;

      case 'article': {
        const journal = ref.journal || `[${tText('journalName', lang)}]`;
        const volume = ref.volume || `[${tText('volume', lang)}]`;
        const issue = ref.issue ? `(${ref.issue})` : '';
        const pages = ref.pages ? `, ${ref.pages}` : '';
        const doi = ref.doi ? ` https://doi.org/${ref.doi}` : '';
        return `${author} (${year}). ${title}. ${journal}, ${volume}${issue}${pages}.${doi}`;
      }

      case 'website':
        return `${author} (${year}). ${title}. ${ref.siteName || `[${tText('siteName', lang)}]`}. ${ref.url || '[URL]'}`;

      case 'video':
        return `${author} (${year}). ${title} [Video]. ${ref.channel || `[${tText('channelName', lang)}]`}. ${ref.url || '[URL]'}`;

      default:
        return tText('incompleteReferenceFallback', lang);
    }
  },

  formatReferenceJSX(ref: IReference, lang?: string) {
    const author = ref.author || tText('unknownAuthor', lang);
    const year = getYear(ref.year, lang);
    const title = ref.title || tText('unknownTitle', lang);

    switch (ref.type) {
      case 'book': {
        const publisher = ref.publisher || `[${tText('publisher', lang)}]`;
        return (
          <span>
            {author} ({year}). <em>{title}</em>. {publisher}.
          </span>
        );
      }

      case 'article': {
        const journal = ref.journal || `[${tText('journalName', lang)}]`;
        const volume = ref.volume || `[${tText('volume', lang)}]`;
        const issue = ref.issue ? `(${ref.issue})` : '';
        const pages = ref.pages ? `, ${ref.pages}` : '';
        const doi = ref.doi ? ` https://doi.org/${ref.doi}` : '';
        return (
          <span>
            {author} ({year}). {title}. <em>{journal}</em>, <em>{volume}</em>
            {issue}{pages}.{doi}
          </span>
        );
      }

      case 'website': {
        const siteName = ref.siteName || `[${tText('siteName', lang)}]`;
        const url = ref.url || '[URL]';
        return (
          <span>
            {author} ({year}). <em>{title}</em>. {siteName}. {url}
          </span>
        );
      }

      case 'video': {
        const channel = ref.channel || `[${tText('channelName', lang)}]`;
        const videoUrl = ref.url || '[URL]';
        return (
          <span>
            {author} ({year}). <em>{title}</em> [Video]. {channel}. {videoUrl}
          </span>
        );
      }

      default:
        return <span>{tText('incompleteReferenceFallback', lang)}</span>;
    }
  },

  formatInTextCitation(ref: IReference, _index?: number, lang?: string): string {
    if (!ref) return '';
    const authorStr = ref.author?.trim() || tText('unknownAuthor', lang);
    const year = getYear(ref.year, lang);
    const authors = splitAuthors(authorStr);

    let formattedAuthors: string;
    if (authors.length === 1) {
      formattedAuthors = formatSingleAuthorSurname(authors[0]);
    } else if (authors.length === 2) {
      formattedAuthors = `${formatSingleAuthorSurname(authors[0])} y ${formatSingleAuthorSurname(authors[1])}`;
    } else {
      formattedAuthors = `${formatSingleAuthorSurname(authors[0])} et al.`;
    }

    return ` (${formattedAuthors}, ${year})`;
  },
};
