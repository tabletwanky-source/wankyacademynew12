import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Shield, 
  Mail, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  UserMinus, 
  Key, 
  Edit3, 
  Download,
  Trash2,
  ChevronRight,
  ExternalLink,
  Ban,
  UserCheck,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppUser, UserRole, UserStatus, CourseType } from '../../types';
import { userService } from '../../services/userService';
import UserFormModal from '../../components/admin/UserFormModal';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [deptFilter, setDeptFilter] = useState<CourseType | 'all'>('all');
  
  const [selectedUser, setSelectedUser] = useState<AppUser | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const unsub = userService.subscribeAllUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((u as any).studentId?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesDept = deptFilter === 'all' || u.department === deptFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesDept;
    });
  }, [users, searchTerm, roleFilter, statusFilter, deptFilter]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      students: users.filter(u => u.role === 'student').length,
      professors: users.filter(u => u.role === 'professor').length,
      suspended: users.filter(u => u.status === 'suspended').length
    };
  }, [users]);

  const handleDelete = async (uid: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return;
    
    try {
      await userService.adminDeleteUser(uid);
      toast.success("Utilisateur supprimé");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    try {
      await userService.adminResetPassword(selectedUser.uid, newPassword);
      toast.success("Mot de passe réinitialisé");
      setIsResetModalOpen(false);
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const exportToCSV = () => {
    const headers = ['UID', 'Nom', 'Email', 'Role', 'Departement', 'Statut', 'Code Etudiant'];
    const rows = filteredUsers.map(u => [
      u.uid,
      u.fullName,
      u.email,
      u.role,
      u.department,
      u.status,
      (u as any).studentId || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 italic">Système Privilégié</p>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Gestion des Utilisateurs</h2>
           <p className="text-slate-400 mt-1 font-medium text-xs">Contrôlez les accès, profils et rôles de toute la plateforme.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 italic"
          >
            <Download className="w-4 h-4" /> Exporter
          </button>
          <button 
            onClick={() => { setSelectedUser(undefined); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-200 italic"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'indigo' },
          { label: 'Etudiants', value: stats.students, color: 'blue' },
          { label: 'Profs', value: stats.professors, color: 'emerald' },
          { label: 'Actifs', value: stats.active, color: 'emerald' },
          { label: 'Suspendus', value: stats.suspended, color: 'rose' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-b-4 border-b-slate-50">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{stat.label}</p>
             <h4 className={`text-2xl font-black text-slate-900 tracking-tight italic`}>{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher par nom, email ou code..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select 
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Admins</option>
              <option value="professor">Profs</option>
              <option value="student">Étudiants</option>
            </select>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="pending">En attente</option>
              <option value="disabled">Désactivé</option>
            </select>
            <select 
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Toutes les filières</option>
              <option value="Informatique">Informatique</option>
              <option value="Technique Informatique">Technique Informatique</option>
              <option value="Auto École">Auto École</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table / List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Utilisateur</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Role & Filère</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Code Étudiant</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Statut</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode='popLayout'>
                {filteredUsers.map((u) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={u.uid} 
                    className="group hover:bg-slate-50/50 transition-all"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                            {u.profileImageUrl ? (
                              <img src={u.profileImageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-6 h-6 text-slate-300" />
                            )}
                         </div>
                         <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 italic tracking-tight group-hover:text-indigo-600 transition-colors">{u.fullName}</p>
                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5" /> {u.email}
                            </p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-1">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit",
                            u.role === 'admin' ? "bg-purple-50 text-purple-600 border border-purple-100" :
                            u.role === 'professor' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                            "bg-amber-50 text-amber-600 border border-amber-100"
                          )}>
                             <Shield className="w-3 h-3" /> {u.role}
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">{u.department}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       {(u as any).studentId ? (
                         <div className="flex items-center gap-2">
                           <span className="font-mono text-[10px] font-black bg-indigo-50 text-indigo-600 px-2.5 py-1.5 rounded-lg border border-indigo-100 shadow-sm">
                            {(u as any).studentId}
                           </span>
                         </div>
                       ) : (
                         <span className="text-[10px] text-slate-300 font-black italic uppercase">—</span>
                       )}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            u.status === 'active' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                            u.status === 'suspended' ? "bg-rose-500" :
                            u.status === 'pending' ? "bg-amber-500 animate-pulse" : "bg-slate-300"
                          )}></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                             {u.status}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            to={`/admin-dashboard/users/${u.uid}`}
                            className="p-2.5 hover:bg-slate-200/50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all font-black text-xs"
                            title="Voir Profil"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => { setSelectedUser(u); setIsFormOpen(true); }}
                            className="p-2.5 hover:bg-slate-200/50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => { setSelectedUser(u); setIsResetModalOpen(true); }}
                            className="p-2.5 hover:bg-slate-200/50 rounded-xl text-slate-400 hover:text-amber-600 transition-all"
                            title="Réinitialiser MDP"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button 
                             onClick={() => handleDelete(u.uid)}
                             className="p-2.5 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all font-black text-xs"
                             title="Supprimer"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <UserFormModal 
          user={selectedUser}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => { setIsFormOpen(false); }}
        />
      )}

      {/* Password Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
             <div className="text-center space-y-4 mb-8">
                <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto text-amber-500 border border-amber-100">
                   <Key className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">Réinitialiser</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Nouveau mot de passe pour {selectedUser?.fullName}</p>
                </div>
             </div>
             
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mot de passe temporaire</label>
                   <input 
                     type="text" 
                     value={newPassword}
                     onChange={e => setNewPassword(e.target.value)}
                     placeholder="Générer un mot de passe fort"
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50"
                   />
                </div>
                
                <div className="flex gap-3">
                   <button 
                     onClick={() => setIsResetModalOpen(false)}
                     className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all italic"
                   >
                     Annuler
                   </button>
                   <button 
                     onClick={handleResetPassword}
                     className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl italic"
                   >
                     Confirmer
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
