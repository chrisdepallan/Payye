import axios from 'axios';

/**
 * Dedicated client for the public ebook sources (Gutendex, Open Library,
 * Internet Archive). Deliberately NOT the shared `services/api.ts` instance —
 * that one targets the Payye backend and attaches the X-App-Token header.
 *
 * Full-text downloads can be a few MB, so the timeout is generous.
 */
export const bookHttp = axios.create({ timeout: 60000 });
