import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createTextDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  PickedFile,
  uploadDocument,
} from '../services/documents';
import { useAuthStore } from '../store/authStore';

export const documentKeys = {
  all: ['documents'] as const,
  detail: (id: string) => ['documents', id] as const,
};

export function useDocuments() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: documentKeys.all,
    queryFn: listDocuments,
    enabled: !!token,
  });
}

export function useDocument(id: string | undefined) {
  return useQuery({
    queryKey: documentKeys.detail(id ?? 'none'),
    queryFn: () => getDocument(id as string),
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, text }: { title: string; text: string }) =>
      createTextDocument(title, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: PickedFile) => uploadDocument(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}
