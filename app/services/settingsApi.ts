import { api } from './api';
import { UserSettings } from '../types';

export async function getSettings(): Promise<UserSettings> {
  const { data } = await api.get<UserSettings>('/settings');
  return data;
}

export async function updateSettings(
  payload: Partial<UserSettings>,
): Promise<UserSettings> {
  const { data } = await api.patch<UserSettings>('/settings', payload);
  return data;
}
