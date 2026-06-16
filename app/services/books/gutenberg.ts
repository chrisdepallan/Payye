import { GUTENDEX_URL } from '../../constants/config';
import { BookSummary } from '../../types';
import { stripGutenbergBoilerplate } from '../../utils/ebookText';
import { bookHttp } from './httpClient';
import { SourceProvider } from './source';

const SOURCE_ID = 'gutenberg';

interface GutendexBook {
  id: number;
  title: string;
  authors: { name: string }[];
  subjects: string[];
  languages: string[];
  download_count: number;
  formats: Record<string, string>;
}

interface GutendexSearch {
  count: number;
  next: string | null;
  results: GutendexBook[];
}

function toSummary(book: GutendexBook): BookSummary {
  return {
    source: SOURCE_ID,
    id: String(book.id),
    title: book.title,
    authors: (book.authors ?? []).map((a) => a.name),
    languages: book.languages ?? [],
    subjects: book.subjects ?? [],
    coverUrl: book.formats?.['image/jpeg'] ?? null,
    downloadCount: book.download_count ?? null,
  };
}

/** Pick a readable plain-text file from a Gutendex `formats` map (skip zips). */
function plainTextUrl(formats: Record<string, string>): string | null {
  const keys = Object.keys(formats);
  const key =
    keys.find((k) => k.startsWith('text/plain') && /utf-8/i.test(k)) ??
    keys.find((k) => k.startsWith('text/plain'));
  if (!key) return null;
  const url = formats[key];
  return url && !url.endsWith('.zip') ? url : null;
}

export const gutenberg: SourceProvider = {
  id: SOURCE_ID,
  name: 'Project Gutenberg',
  supportsLanguage: true,
  supportsTopic: true,

  async search(query, { language, topic, page = 1 }) {
    const { data } = await bookHttp.get<GutendexSearch>(`${GUTENDEX_URL}/books`, {
      params: {
        search: query || undefined,
        languages: language || undefined,
        topic: topic || undefined,
        page,
      },
    });
    return {
      results: (data.results ?? []).map(toSummary),
      nextPage: data.next ? page + 1 : null,
    };
  },

  async fetchText(id) {
    const { data: book } = await bookHttp.get<GutendexBook>(`${GUTENDEX_URL}/books/${id}`);
    const url = plainTextUrl(book.formats ?? {});
    if (!url) {
      throw new Error('This book has no plain-text version to read.');
    }
    const { data } = await bookHttp.get<string>(url, { responseType: 'text' });
    const raw = typeof data === 'string' ? data : String(data);
    return { title: book.title, text: stripGutenbergBoilerplate(raw) };
  },
};
