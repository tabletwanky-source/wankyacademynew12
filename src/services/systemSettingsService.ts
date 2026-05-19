import { supabase } from '../lib/supabase';
import {
  SystemGeneralSettings,
  SystemBrandingSettings,
  SystemAuthSettings,
  FinancialSettings,
  SystemCertificateSettings,
  SystemBadgeSettings,
  SystemExamSettings,
  SystemNotificationSettings,
  SystemSecuritySettings,
  SystemStudentSettings,
  SystemMultiservicesSettings,
  SystemMaintenanceSettings
} from '../types';

export const systemSettingsService = {
  async getSettings<T>(docId: string): Promise<T | null> {
    const { data } = await supabase.from('system_settings').select('data').eq('id', docId).maybeSingle();
    return data ? data.data as T : null;
  },

  async updateSettings<T>(docId: string, data: Partial<T>) {
    const { data: existing } = await supabase.from('system_settings').select('data').eq('id', docId).maybeSingle();
    const merged = existing ? { ...(existing.data as any), ...data } : data;
    const { error } = await supabase.from('system_settings').upsert({
      id: docId,
      data: merged,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
  },

  subscribeSettings<T>(docId: string, callback: (data: T) => void) {
    const load = async () => {
      const { data } = await supabase.from('system_settings').select('data').eq('id', docId).maybeSingle();
      if (data) callback(data.data as T);
    };

    const channel = supabase
      .channel(`system-settings-${docId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_settings', filter: `id=eq.${docId}` }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async getGeneralSettings(): Promise<SystemGeneralSettings | null> {
    return this.getSettings<SystemGeneralSettings>('general');
  },

  async getFinancialSettings(): Promise<FinancialSettings | null> {
    return this.getSettings<FinancialSettings>('financial');
  },

  async getExamSettings(): Promise<SystemExamSettings | null> {
    return this.getSettings<SystemExamSettings>('exams');
  },

  async getBrandingSettings(): Promise<SystemBrandingSettings | null> {
    return this.getSettings<SystemBrandingSettings>('branding');
  }
};
