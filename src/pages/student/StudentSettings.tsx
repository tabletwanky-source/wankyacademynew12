import React, { useState, useEffect } from 'react';
import { User, Camera, Lock, Bell, Shield, Mail, Phone, MapPin, MessageCircle, Info, Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Save, Image as ImageIcon, Upload, ExternalLink, ChevronRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { uploadImage } from '../../utils/upload';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Student } from '../../types';

export default function StudentSettings() {
  const { studentData, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Profile Data State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    whatsapp: '',
    address: '',
    bio: '',
    emergencyContact: '',
    photoURL: ''
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // URL Photo State
  const [photoMode, setPhotoMode] = useState<'upload' | 'url'>('upload');
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  useEffect(() => {
    if (studentData) {
      setFormData({
        fullName: studentData.fullName || '',
        phone: studentData.phone || '',
        whatsapp: studentData.whatsapp || '',
        address: studentData.address || '',
        bio: studentData.bio || '',
        emergencyContact: studentData.emergencyContact || '',
        photoURL: studentData.photoURL || ''
      });
      setPhotoUrlInput(studentData.photoURL || '');
    }
  }, [studentData]);

  if (!studentData || !user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentService.updateStudentProfile(user.uid, formData);
      toast.success('Profil mis à jour avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image est trop volumineuse (max 2MB)');
      return;
    }

    setUploading(true);
    try {
      const photoURL = await uploadImage(file, `profile-photos/${user.id}`);
      
      await studentService.updateStudentProfile(user.uid, { photoURL });
      setFormData(prev => ({ ...prev, photoURL }));
      toast.success('Photo téléchargée avec succès');
    } catch (error: any) {
      toast.error('Échec du téléchargement de la photo');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlPhotoUpdate = async () => {
    if (!photoUrlInput) return;
    setLoading(true);
    try {
      await studentService.updateStudentProfile(user.uid, { photoURL: photoUrlInput });
      setFormData(prev => ({ ...prev, photoURL: photoUrlInput }));
      toast.success('URL de la photo mise à jour');
    } catch (error) {
      toast.error('L\'URL de l\'image est invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    setLoading(true);
    try {
      await studentService.updateStudentProfile(user.uid, {}, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Mot de passe changé avec succès');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Cette action nécessite une session récente. Veuillez vous reconnecter.');
      } else {
        toast.error(error.message || 'Échec du changement de mot de passe');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Paramètres du Compte</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Gérez votre profil et vos préférences de sécurité</p>
        </div>
        <div className="flex items-center gap-3 self-center md:self-auto">
           <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest italic text-nowrap">Compte Vérifié</span>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Forms */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Profile Information */}
          <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                 <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-slate-800 uppercase italic tracking-tight">Informations de Profil</h2>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Détails personnels et coordonnées</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3" /> Nom Complet
                  </label>
                  <input 
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-600 transition-all font-bold italic"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Numéro de Téléphone
                  </label>
                  <input 
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-600 transition-all font-bold italic"
                    placeholder="Ex: 829-000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </label>
                  <input 
                    type="text"
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-600 transition-all font-bold italic"
                    placeholder="Numéro WhatsApp"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> Contact d'Urgence
                  </label>
                  <input 
                    type="text"
                    value={formData.emergencyContact}
                    onChange={e => setFormData({...formData, emergencyContact: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-600 transition-all font-bold italic"
                    placeholder="Nom ou Numéro"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Adresse Résidentielle
                </label>
                <input 
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-600 transition-all font-bold italic"
                  placeholder="Rue, Appartement, Ville"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-3 h-3" /> À propos de moi (Bio)
                </label>
                <textarea 
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-600 transition-all font-bold italic resize-none"
                  placeholder="Décrivez votre parcours académique..."
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-3 px-8 py-4 bg-[#0f172a] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Sauvegarder les modifications
                </button>
              </div>
            </form>
          </section>

          {/* Section 2: Security Settings */}
          <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-100">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-black text-slate-800 uppercase italic tracking-tight">Paramètres de Sécurité</h2>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protégez votre compte</p>
                </div>
             </div>

             <form onSubmit={handleChangePassword} className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nouveau mot de passe</label>
                      <input 
                        type="password"
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all"
                        required
                        minLength={6}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirmer le mot de passe</label>
                      <input 
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all"
                        required
                        minLength={6}
                      />
                   </div>
                </div>

                <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100">
                   <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                   <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tighter leading-relaxed">
                     Assurez-vous d'utiliser un mot de passe unique. Pour des raisons de sécurité, vous pourriez être déconnecté après cette modification.
                   </p>
                </div>

                <div className="pt-2">
                   <button 
                     type="submit"
                     disabled={loading}
                     className="px-8 py-4 bg-amber-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50"
                   >
                     {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4 mr-2 inline" />}
                     Réinitialiser le mot de passe
                   </button>
                </div>
             </form>
          </section>
        </div>

        {/* Right Column: Photo & Info */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Profile Photo Section */}
          <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden text-center sticky top-8">
             <div className="p-8 bg-slate-50/50 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Photo de Profil</h3>
                
                <div className="relative inline-block group mb-6">
                   <div className="w-32 h-32 rounded-[2rem] border-4 border-white shadow-2xl shadow-indigo-200/50 overflow-hidden bg-slate-100">
                      <img 
                        src={formData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.fullName)}&background=6366f1&color=fff`} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-indigo-600/60 backdrop-blur-sm flex items-center justify-center">
                           <Loader2 className="w-8 h-8 animate-spin text-white" />
                        </div>
                      )}
                   </div>
                   <label className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-slate-900 transition-all active:scale-90 border-4 border-white">
                      <Camera className="w-5 h-5" />
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
                   </label>
                </div>

                <div className="flex bg-slate-200/50 p-1 rounded-xl mb-4">
                   <button 
                     onClick={() => setPhotoMode('upload')}
                     className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${photoMode === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                   >
                     Télécharger
                   </button>
                   <button 
                     onClick={() => setPhotoMode('url')}
                     className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${photoMode === 'url' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                   >
                     Coller URL
                   </button>
                </div>

                <AnimatePresence mode="wait">
                   {photoMode === 'url' && (
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-3"
                     >
                        <input 
                          type="url" 
                          value={photoUrlInput}
                          onChange={e => setPhotoUrlInput(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-indigo-600 shadow-inner"
                        />
                        <button 
                          onClick={handleUrlPhotoUpdate}
                          disabled={loading}
                          className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-slate-900 transition-all"
                        >
                          Appliquer URL
                        </button>
                     </motion.div>
                   )}
                   {photoMode === 'upload' && (
                     <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic"
                     >
                       Formats: JPG, PNG. Max 2MB.
                     </motion.p>
                   )}
                </AnimatePresence>
             </div>

             {/* Account Information */}
             <div className="p-8 space-y-6 text-left">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Info className="w-4 h-4" /> Informations de Compte
                </h3>
                
                {[
                  { label: 'ID Étudiant', value: studentData.studentId, icon: Shield, mono: true },
                  { label: 'Département', value: studentData.department, icon: UserCheck },
                  { label: 'Email', value: studentData.email, icon: Mail },
                  { label: 'Statut', value: studentData.status || 'Active', badge: true }
                ].map((info, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{info.label}</p>
                      <p className={`text-sm font-bold uppercase italic ${info.mono ? 'font-mono tracking-tight text-indigo-600' : 'text-slate-700'}`}>
                        {info.value}
                      </p>
                    </div>
                    {info.icon && !info.badge && <info.icon className="w-4 h-4 text-slate-200" />}
                    {info.badge && (
                      <span className="bg-emerald-100 text-emerald-600 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {info.value}
                      </span>
                    )}
                  </div>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
