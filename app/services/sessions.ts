import { api } from './api';
import { ReadingSession, SessionStatus, SessionWithDocument } from '../types';

export interface SessionUpdatePayload {
  current_word_index?: number;
  wpm?: number;
  status?: SessionStatus;
}

export async function startSession(
  documentId: string,
  wpm?: number,
): Promise<SessionWithDocument> {
  const { data } = await api.post<SessionWithDocument>('/sessions/start', {
    document_id: documentId,
    wpm,
  });
  return data;
}

export async function updateSession(
  id: string,
  payload: SessionUpdatePayload,
): Promise<ReadingSession> {
  const { data } = await api.patch<ReadingSession>(`/sessions/${id}`, payload);
  return data;
}

export async function getCurrentSession(): Promise<SessionWithDocument | null> {
  const { data } = await api.get<SessionWithDocument | null>('/sessions/current');
  return data;
}

export async function getSessionHistory(): Promise<SessionWithDocument[]> {
  const { data } = await api.get<SessionWithDocument[]>('/sessions/history');
  return data;
}
