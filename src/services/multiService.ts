import { supabase } from '../lib/supabase';
import { mapServiceRequest } from '../lib/supabaseHelpers';
import { ServiceRequest } from '../types';

export const multiService = {
  async createRequest(data: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>) {
    const { data: result, error } = await supabase.from('service_requests').insert({
      full_name: data.fullName,
      phone: data.phone || '',
      whatsapp: data.whatsapp || '',
      email: data.email || '',
      service: data.service,
      details: data.details || '',
      appointment_date: data.appointmentDate ? String(data.appointmentDate) : null,
      document_url: data.documentUrl || '',
      status: 'pending'
    }).select().single();

    if (error) throw error;
    return result.id;
  },

  async getAllRequests() {
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapServiceRequest) as ServiceRequest[];
  },

  async updateRequestStatus(requestId: string, status: ServiceRequest['status']) {
    const { error } = await supabase.from('service_requests').update({ status }).eq('id', requestId);
    if (error) throw error;
  },

  async deleteRequest(requestId: string) {
    const { error } = await supabase.from('service_requests').delete().eq('id', requestId);
    if (error) throw error;
  }
};
