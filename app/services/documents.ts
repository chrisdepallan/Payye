import { api } from './api';
import { Document, DocumentDetail } from '../types';

export interface PickedFile {
  uri: string;
  name: string;
  mimeType?: string | null;
}

export async function listDocuments(): Promise<Document[]> {
  const { data } = await api.get<Document[]>('/documents');
  return data;
}

export async function getDocument(id: string): Promise<DocumentDetail> {
  const { data } = await api.get<DocumentDetail>(`/documents/${id}`);
  return data;
}

export async function createTextDocument(
  title: string,
  textContent: string,
): Promise<Document> {
  const { data } = await api.post<Document>('/documents', {
    title,
    text_content: textContent,
  });
  return data;
}

export async function uploadDocument(file: PickedFile): Promise<Document> {
  const form = new FormData();
  // React Native FormData accepts this shape for file uploads.
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? 'application/octet-stream',
  } as unknown as Blob);

  const { data } = await api.post<Document>('/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`);
}
