import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Layers, 
  Lock, 
  Camera, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { AppUser, CourseType, UserRole, UserStatus, Student } from '../../types';
import { userService } from '../../services/userService';
import { toast } from 'sonner';

interface UserFormModalProps {
  user?: AppUser;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserFormModal({ user, onClose, onSuccess }: UserFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'student' as UserRole,
    department: user?.department || 'Informatique' as CourseType,
    phoneNumber: user?.phoneNumber || '',
    status: user?.status || 'active' as UserStatus,
    studentId: (user as Student)?.studentId || ''
  });

  const [generatingId, setGeneratingId] = useState(false);

  useEffect(() => {
    // Auto-generate student ID if creating a new student or switching to student role
    if (!user && formData.role === 'student' && !formData.studentId) {
      handleGenerateId();
    }
  }, [formData.role]);

  const handleGenerateId = async () => {
    setGeneratingId(true);
    try {
      const id = await userService.generateNextStudentId(formData.department);
      setFormData(prev => ({ ...prev, studentId: id }));
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la génération du code étudiant");
    } finally {
      setGeneratingId(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Update
        await userService.adminUpdateUser(user.uid, formData);
        toast.success("Utilisateur mis à jour avec succès");
      } else {
        // Create
        if (!formData.password) throw new Error("Le mot de passe est requis pour un nouvel utilisateur");
        await userService.adminCreateUser(formData);
        toast.success("Utilisateur créé avec succès");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tight">
              {user ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestion des accès et profils</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nom Complet</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  required
                  type="text" 
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Jean Dupont"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemple.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50"
                />
              </div>
            </div>

            {!user && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    required
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="tel" 
                  value={formData.phoneNumber}
                  onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+243..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Rôle</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <select 
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50"
                >
                  <option value="student">Étudiant</option>
                  <option value="professor">Professeur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Département</label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <select 
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50"
                >
                  <option value="Informatique">Informatique</option>
                  <option value="Technique Informatique">Technique Informatique</option>
                  <option value="Auto École">Auto École</option>
                </select>
              </div>
            </div>

            {formData.role === 'student' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex justify-between">
                  <span>Code Étudiant</span>
                  <button 
                    type="button" 
                    onClick={handleGenerateId}
                    className="text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={cn("w-2 h-2", generatingId && "animate-spin")} /> Régénérer
                  </button>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    required
                    type="text" 
                    value={formData.studentId}
                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="WA-INFO-2026-0001"
                    className="w-full bg-indigo-50 border border-indigo-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-black text-indigo-700 outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Statut du compte</label>
              <div className="grid grid-cols-2 gap-2">
                {(['active', 'pending', 'suspended', 'disabled'] as UserStatus[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: s })}
                    className={cn(
                      "py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                      formData.status === s 
                        ? "bg-slate-900 text-white border-slate-900" 
                        : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {s === 'active' && '🟢 Actif'}
                    {s === 'pending' && '🟡 En attente'}
                    {s === 'suspended' && '🔴 Suspendu'}
                    {s === 'disabled' && '⚫ Désactivé'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 px-6 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all italic"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || generatingId}
            className="flex-[2] py-4 px-12 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-200 italic flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {user ? 'Enregistrer les modifications' : 'Créer l\'utilisateur'}
          </button>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
