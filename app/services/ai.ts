import { api } from './api';
import { KeywordsResponse, SummaryResponse, VocabularyResponse } from '../types';

export async function getSummary(documentId: string): Promise<SummaryResponse> {
  const { data } = await api.post<SummaryResponse>('/ai/summary', {
    document_id: documentId,
  });
  return data;
}

export async function getKeywords(documentId: string): Promise<KeywordsResponse> {
  const { data } = await api.post<KeywordsResponse>('/ai/keywords', {
    document_id: documentId,
  });
  return data;
}

export async function getVocabularyHelp(
  word: string,
  context?: string,
): Promise<VocabularyResponse> {
  const { data } = await api.post<VocabularyResponse>('/ai/vocabulary-help', {
    word,
    context,
  });
  return data;
}
