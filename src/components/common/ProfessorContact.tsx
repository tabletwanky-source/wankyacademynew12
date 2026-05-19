import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle, Phone, Loader2 } from 'lucide-react';
import { studentService } from '../../services/studentService';

interface ProfessorContactProps {
  professorUid: string;
  variant?: 'compact' | 'full';
}

export default function ProfessorContact({ professorUid, variant = 'full' }: ProfessorContactProps) {
  const [professor, setProfessor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (professorUid) {
      studentService.getProfessorData(professorUid).then(data => {
        setProfessor(data);
        setLoading(false);
      });
    }
  }, [professorUid]);

  if (loading) return <Loader2 className="w-4 h-4 animate-spin text-slate-300" />;
  if (!professor) return null;

  return (
    <div className={`flex items-center gap-2 ${variant === 'full' ? 'mt-4' : ''}`}>
      <a 
        href={`mailto:${professor.email}`}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200"
        title="Contact via Email"
      >
        <Mail className="w-3.5 h-3.5" />
        {variant === 'full' && 'Email Professor'}
      </a>
      
      {professor.whatsapp && (
        <a 
          href={`https://wa.me/${professor.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
          title="Contact via WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {variant === 'full' && 'WhatsApp'}
        </a>
      )}
    </div>
  );
}
