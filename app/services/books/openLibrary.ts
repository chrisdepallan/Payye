import {
  INTERNET_ARCHIVE_URL,
  OPENLIBRARY_COVERS_URL,
  OPENLIBRARY_URL,
} from '../../constants/config';
import { BookSummary } from '../../types';
import { bookHttp } from './httpClient';
import { SourceProvider } from './source';

const SOURCE_ID = 'openlibrary';
const PAGE_SIZE = 20;

// Open Library filters by ISO-639-2 (3-letter); the app uses ISO-639-1.
const LANGUAGE_ISO3: Record<string, string> = {
  en: 'eng',
  fr: 'fre',
  es: 'spa',
  de: 'ger',
};

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  ia?: string[];
  cover_i?: number;
  public_scan_b?: boolean;
  language?: string[];
}

interface OpenLibrarySearch {
  numFound: number;
  docs: OpenLibraryDoc[];
}

function toSummary(doc: OpenLibraryDoc, iaId: string): BookSummary {
  return {
    source: SOURCE_ID,
    id: iaId, // the Internet Archive identifier we fetch full text from
    title: doc.title,
    authors: doc.author_name ?? [],
    languages: doc.language ?? [],
    subjects: [],
    coverUrl: doc.cover_i ? `${OPENLIBRARY_COVERS_URL}/b/id/${doc.cover_i}-M.jpg` : null,
    downloadCount: null,
  };
}

export const openLibrary: SourceProvider = {
  id: SOURCE_ID,
  name: 'Open Library',
  supportsLanguage: true,
  supportsTopic: true,

  async search(query, { language, topic, page = 1 }) {
    const { data } = await bookHttp.get<OpenLibrarySearch>(`${OPENLIBRARY_URL}/search.json`, {
      params: {
        q: query || undefined,
        has_fulltext: 'true',
        language: language ? LANGUAGE_ISO3[language] ?? language : undefined,
        subject: topic || undefined,
        fields: 'key,title,author_name,ia,cover_i,public_scan_b,language',
        limit: PAGE_SIZE,
        page,
      },
    });

    // Only keep results we can actually read (those with an IA full-text id).
    const results: BookSummary[] = [];
    for (const doc of data.docs ?? []) {
      const iaId = doc.ia?.[0];
      if (iaId) results.push(toSummary(doc, iaId));
    }
    const hasNext = page * PAGE_SIZE < (data.numFound ?? 0);
    return { results, nextPage: hasNext ? page + 1 : null };
  },

  async fetchText(iaId) {
    // archive.org redirects to a storage node; axios follows it automatically.
    const url = `${INTERNET_ARCHIVE_URL}/download/${iaId}/${iaId}_djvu.txt`;
    try {
      const { data } = await bookHttp.get<string>(url, { responseType: 'text' });
      const raw = typeof data === 'string' ? data : String(data);
      return { title: iaId, text: raw.trim() };
    } catch {
      // Many public scans simply don't expose the OCR text file.
      throw new Error("Full text isn't available for this book — try another.");
    }
  },
};
