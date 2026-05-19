import { supabase } from '../lib/supabase';
import { mapCertificate } from '../lib/supabaseHelpers';
import { Certificate, OldCertificate } from '../types';

export const certificateService = {
  subscribeStudentCertificates(studentUid: string, callback: (certs: Certificate[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_uid', studentUid)
        .eq('status', 'active')
        .order('issue_date', { ascending: false });
      callback((data || []).map(mapCertificate) as Certificate[]);
    };

    const channel = supabase
      .channel(`certs-${studentUid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates', filter: `student_uid=eq.${studentUid}` }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async generateCertificate(data: Omit<Certificate, 'id' | 'issueDate' | 'status' | 'verificationUrl' | 'certificateCode'>) {
    const year = new Date().getFullYear();
    const { data: lastCert } = await supabase
      .from('certificates')
      .select('certificate_code')
      .order('certificate_code', { ascending: false })
      .limit(1);

    let lastNum = 0;
    if (lastCert && lastCert.length > 0) {
      const parts = (lastCert[0].certificate_code || '').split('-');
      lastNum = parseInt(parts[parts.length - 1]) || 0;
    }

    const newNum = (lastNum + 1).toString().padStart(4, '0');
    const certificateCode = `WA-CERT-${year}-${newNum}`;
    const verificationUrl = `/verify-certificate/${certificateCode}`;

    const { data: result, error } = await supabase.from('certificates').insert({
      certificate_code: certificateCode,
      student_uid: data.studentUid,
      student_name: data.studentName,
      student_id: data.studentId,
      department: data.department,
      exam_id: data.examId || null,
      exam_title: data.examTitle,
      score: data.score,
      issued_by: data.issuedBy || 'System',
      verification_url: verificationUrl,
      pdf_url: data.pdfUrl || '',
      status: 'active'
    }).select().single();

    if (error) throw error;
    return result;
  },

  async verifyCertificate(code: string) {
    const { data: cert } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificate_code', code)
      .eq('status', 'active')
      .maybeSingle();
    if (cert) return { type: 'new', data: mapCertificate(cert) as Certificate };

    const { data: oldCert } = await supabase
      .from('old_certificates')
      .select('*')
      .eq('certificate_code', code)
      .eq('verified', true)
      .maybeSingle();
    if (oldCert) return {
      type: 'old', data: {
        id: oldCert.id,
        certificateCode: oldCert.certificate_code,
        studentName: oldCert.student_name,
        pdfUrl: oldCert.pdf_url,
        verified: oldCert.verified,
        issueDate: oldCert.issue_date,
        department: oldCert.department || ''
      } as OldCertificate
    };

    return null;
  },

  async revokeCertificate(certId: string) {
    const { error } = await supabase.from('certificates').update({ status: 'revoked' }).eq('id', certId);
    if (error) throw error;
  },

  async importOldCertificate(data: Omit<OldCertificate, 'id' | 'verified'>) {
    const { error } = await supabase.from('old_certificates').insert({
      certificate_code: data.certificateCode,
      student_name: data.studentName,
      pdf_url: data.pdfUrl,
      verified: true,
      issue_date: data.issueDate || new Date().toISOString(),
      department: data.department || ''
    });
    if (error) throw error;
  },

  subscribeAllCertificates(callback: (certs: Certificate[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('certificates')
        .select('*')
        .order('issue_date', { ascending: false });
      callback((data || []).map(mapCertificate) as Certificate[]);
    };

    const channel = supabase
      .channel('certs-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates' }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  }
};
