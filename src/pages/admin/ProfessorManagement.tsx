import React, { useState, useEffect } from 'react';
import { Bell, MoreVertical, Trash2, UserPlus, Mail, Phone, BookOpen, Loader2, Key, ShieldCheck, Copy, Users, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Professor, CourseType } from '../../types';
import { toast } from 'sonner';
import Modal from '../../components/common/Modal';

export default function ProfessorManagement() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState<{ email: string, pass: string } | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    department: 'Informatique' as CourseType,
  });

  useEffect(() => {
    loadProfessors();
  }, []);

  const loadProfessors = async () => {
    try {
      const res = await adminService.getAllProfessors();
      setProfessors(res);
    } catch (error) {
      toast.error('Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  const generateTempPassword = () => {
    return 'Temp@' + Math.floor(10000 + Math.random() * 90000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const tempPass = generateTempPassword();
    
    try {
      await adminService.createProfessor({
        fullName: formData.fullName,
        email: formData.email,
        whatsapp: formData.whatsapp,
        department: formData.department,
        password: tempPass
      });
      
      setGeneratedCreds({ email: formData.email, pass: tempPass });
      toast.success('Professor account created');
      loadProfessors();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!window.confirm('Are you sure you want to remove this professor?')) return;
    try {
      await adminService.deleteUser(uid);
      toast.success('Professor removed');
      loadProfessors();
    } catch (error) {
      toast.error('Failed to remove professor');
    }
  };

  const copyCreds = () => {
    if (generatedCreds) {
      navigator.clipboard.writeText(`Email: ${generatedCreds.email}\nPassword: ${generatedCreds.pass}`);
      toast.success('Credentials copied to clipboard');
    }
  };

  if (loading) return (
    <div className="grid md:grid-cols-3 gap-6">
      {[1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-slate-200"></div>)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 gap-4">
        <div>
          <h2 className="font-bold text-xl text-slate-900">Gestion des Professeurs</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recrutement et Administration du Corps Professoral</p>
        </div>
        <button 
          onClick={() => { 
            setFormData({ fullName: '', email: '', whatsapp: '', department: 'Informatique' });
            setGeneratedCreds(null);
            setIsModalOpen(true); 
          }}
          className="w-full sm:w-auto bg-[#0f172a] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Ajouter Professeur
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professors.map(p => (
          <div key={p.uid} className="bg-white rounded-2xl p-6 border border-slate-200 group hover:border-indigo-300 transition-all relative overflow-hidden">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl border border-indigo-100">
                  {p.fullName.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-slate-900 truncate">{p.fullName}</h3>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{p.department}</p>
                </div>
             </div>
             <div className="space-y-3 mb-6">
               <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
                 <Mail className="w-3.5 h-3.5 text-slate-300" />
                 <span className="truncate">{p.email}</span>
               </div>
               <div className="flex items-center gap-3 text-slate-500 text-xs">
                 <Key className={p.mustChangePassword ? "w-3.5 h-3.5 text-amber-500" : "w-3.5 h-3.5 text-emerald-500"} />
                 <span className={p.mustChangePassword ? "text-amber-600 font-bold" : "text-emerald-600"}>
                    {p.mustChangePassword ? "Mot de passe temporaire" : "Compte sécurisé"}
                 </span>
               </div>
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={() => handleDelete(p.uid)}
                  className="flex-1 py-3 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>
             </div>
          </div>
        ))}
        {professors.length === 0 && (
          <div className="col-span-full py-12 bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-[10px]">Aucun professeur enregistré</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouveau Professeur"
      >
        {!generatedCreds ? (
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nom Complet</span>
                <input 
                  type="text" 
                  required 
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email académique</span>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">WhatsApp (Ex: 18290000000)</span>
                <input 
                  type="text" 
                  value={formData.whatsapp}
                  onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  placeholder="1XXXXXXXXXX"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Département assigné</span>
                <select 
                  required 
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value as CourseType})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                >
                  <option value="Informatique">Informatique</option>
                  <option value="Technique Informatique">Technique Informatique</option>
                  <option value="Auto École">Auto École</option>
                </select>
              </label>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
               <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
               <p className="text-[10px] text-amber-700 font-medium">Un mot de passe temporaire sera généré automatiquement. Le professeur devra le changer lors de sa première connexion.</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#0f172a] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Générer le compte'}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center py-4">
             <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <ShieldCheck className="w-10 h-10" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-900">Compte Créé !</h3>
                <p className="text-sm text-slate-500 mt-1">Veuillez envoyer ces identifiants au professeur.</p>
             </div>

             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-4 font-mono text-xs">
                <div>
                  <p className="text-slate-400 mb-1 uppercase font-bold text-[10px]">Email</p>
                  <p className="text-slate-900 font-bold">{generatedCreds.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1 uppercase font-bold text-[10px]">Mot de passe temporaire</p>
                  <p className="text-indigo-600 font-bold text-lg tracking-wider">{generatedCreds.pass}</p>
                </div>
             </div>

             <div className="flex gap-4">
                <button 
                  onClick={copyCreds}
                  className="flex-1 py-4 bg-[#0f172a] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Fermer
                </button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
