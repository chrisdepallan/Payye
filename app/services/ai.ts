import { api } from './api';
import { KeywordsResponse, SummaryResponse, VocabularyResponse } from '../types';

export async function getSummary(text: string): Promise<SummaryResponse> {
  const { data } = await api.post<SummaryResponse>('/ai/summary', { text });
  return data;
}

export async function getKeywords(text: string): Promise<KeywordsResponse> {
  const { data } = await api.post<KeywordsResponse>('/ai/keywords', { text });
  return data;
}

export async function getVocabulary(
  word: string,
  context?: string,
): Promise<VocabularyResponse> {
  const { data } = await api.post<VocabularyResponse>('/ai/vocabulary', {
    word,
    context,
  });
  return data;
}
