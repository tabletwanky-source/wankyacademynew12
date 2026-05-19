import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Smartphone, 
  Lock, 
  Bell, 
  Globe, 
  Save, 
  Loader2,
  Camera,
  Shield,
  Layers,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ProfessorSettings() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    language: 'fr',
    notifications: {
      examSubmissions: true,
      systemAlerts: true,
      studentMessages: true
    }
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        whatsapp: (userData as any).whatsapp || '',
        language: (userData as any).language || 'fr',
        notifications: (userData as any).notifications || {
          examSubmissions: true,
          systemAlerts: true,
          studentMessages: true
        }
      });
    }
  }, [userData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    setLoading(true);

    try {
      await supabase.from('profiles').update({
        full_name: formData.fullName,
        whatsapp: formData.whatsapp
      }).eq('uid', userData.uid);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Configuration du Profil</h1>
        <p className="text-slate-500 mt-1">Gérez vos informations personnelles et préférences académiques.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm border-b-8 border-b-slate-100">
             <div className="h-24 bg-indigo-600 relative">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                   <div className="relative group">
                      <div className="w-24 h-24 rounded-3xl bg-white p-1 border border-slate-200 shadow-xl overflow-hidden">
                         <img 
                           src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.fullName || 'P')}&background=0f172a&color=fff&size=128&bold=true`} 
                           alt="Avatar" 
                           className="w-full h-full object-cover rounded-2xl" 
                         />
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-slate-900 transition-all">
                         <Camera className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             </div>
             <div className="pt-16 pb-8 px-8 text-center space-y-2">
                <h3 className="text-xl font-black text-slate-900 italic uppercase leading-none">{userData?.fullName}</h3>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{userData?.role}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100 mt-2">
                   <Shield className="w-3 h-3 text-emerald-500" />
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Compte Vérifié</span>
                </div>
             </div>
             <div className="px-8 pb-8 space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Département Assigné</p>
                   <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-black text-slate-700 italic uppercase tracking-tight">{userData?.department}</span>
                   </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Cours Assignés</p>
                    <div className="space-y-2">
                       {(userData as any)?.course?.map((c: string, i: number) => (
                         <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-100"></div>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{c}</span>
                         </div>
                       ))}
                       {(!(userData as any)?.course || (userData as any)?.course?.length === 0) && (
                         <p className="text-[10px] text-slate-300 italic font-medium">Aucun cours assigné</p>
                       )}
                    </div>
                 </div>
             </div>
          </div>

          <div className="bg-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden italic shadow-2xl">
             <div className="relative z-10 space-y-4">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Information Importante</h4>
                <p className="text-xs leading-relaxed opacity-70">
                   Vos cours et examens sont liés à votre département. Si vous avez besoin de changer de département, veuillez contacter l'administration.
                </p>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-8">
           <form onSubmit={handleUpdateProfile} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 md:p-12 space-y-10 border-b-8 border-b-slate-100">
              <div className="space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                       <User className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="text-xs font-black uppercase tracking-widest">Informations Générales</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Votre identité publique</p>
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nom Complet</label>
                       <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input 
                            type="text"
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email (Contact)</label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input 
                            readOnly
                            type="email"
                            value={formData.email}
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-sm font-bold text-slate-400 cursor-not-allowed outline-none"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Numéro WhatsApp</label>
                       <div className="relative">
                          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input 
                            type="text"
                            value={formData.whatsapp}
                            onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                            placeholder="+243..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Langue de l'Interface</label>
                       <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <select 
                            value={formData.language}
                            onChange={e => setFormData({ ...formData, language: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                          >
                             <option value="fr">Français (Congo)</option>
                             <option value="en">English (UK)</option>
                          </select>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-8 pt-10 border-t border-slate-50">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                       <Bell className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="text-xs font-black uppercase tracking-widest">Préférences de Notification</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Alertes et communications</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <NotificationToggle 
                       label="Soumissions d'Examens" 
                       description="Recevoir une alerte quand un étudiant soumet ses réponses"
                       checked={formData.notifications.examSubmissions}
                       onChange={() => setFormData({
                          ...formData,
                          notifications: { ...formData.notifications, examSubmissions: !formData.notifications.examSubmissions }
                       })}
                    />
                    <NotificationToggle 
                       label="Messages Étudiants" 
                       description="Notifications pour les nouvelles questions ou commentaires"
                       checked={formData.notifications.studentMessages}
                       onChange={() => setFormData({
                          ...formData,
                          notifications: { ...formData.notifications, studentMessages: !formData.notifications.studentMessages }
                       })}
                    />
                    <NotificationToggle 
                       label="Alertes Système" 
                       description="Mises à jour critiques de la plateforme et maintenance"
                       checked={formData.notifications.systemAlerts}
                       onChange={() => setFormData({
                          ...formData,
                          notifications: { ...formData.notifications, systemAlerts: !formData.notifications.systemAlerts }
                       })}
                    />
                 </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#0f172a] text-white rounded-[2rem] flex items-center justify-center gap-4 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all disabled:opacity-50 group font-black italic tracking-widest"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                <span className="text-xs font-black uppercase tracking-[0.3em] italic">Enregistrer les Modifications</span>
              </button>
           </form>

           <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 space-y-8 shadow-sm border-b-8 border-b-slate-100">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest">SÉCURITÉ DU COMPTE</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Mot de passe et accès</p>
                 </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-900 uppercase">Mot de Passe</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic">Action de sécurité requise</p>
                 </div>
                 <button className="px-8 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Changer le mot de passe
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const NotificationToggle = ({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: () => void }) => (
  <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:border-indigo-100 transition-all duration-300">
     <div className="space-y-1">
        <p className="text-xs font-black text-slate-900 uppercase italic leading-none">{label}</p>
        <p className="text-[10px] font-medium text-slate-400 italic">{description}</p>
     </div>
     <button 
        type="button"
        onClick={onChange}
        className={cn(
           "w-12 h-6 rounded-full transition-all relative shrink-0",
           checked ? "bg-indigo-600 shadow-inner" : "bg-slate-300"
        )}
     >
        <div className={cn(
           "absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all",
           checked ? "left-7" : "left-1"
        )}></div>
     </button>
  </div>
);
