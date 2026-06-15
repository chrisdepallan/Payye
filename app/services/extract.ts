import { api } from './api';
import { ExtractResponse } from '../types';

export interface PickedFile {
  uri: string;
  name: string;
  mimeType?: string | null;
}

/**
 * Send a picked TXT/PDF to the stateless backend and get the extracted text
 * back. The backend stores nothing — the text is saved locally on the device.
 */
export async function extractFile(file: PickedFile): Promise<ExtractResponse> {
  const form = new FormData();
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? 'application/octet-stream',
  } as unknown as Blob);

  const { data } = await api.post<ExtractResponse>('/extract', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
