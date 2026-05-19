import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Smartphone, 
  Phone,
  Mail, 
  Calendar, 
  Loader2, 
  MoreVertical,
  ExternalLink,
  Filter,
  User,
  MessageCircle,
  XCircle,
  TrendingUp,
  CreditCard,
  Target
} from 'lucide-react';
import { multiService } from '../../services/multiService';
import { ServiceRequest } from '../../types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ServiceRequestManager() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceRequest['status'] | 'all'>('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await multiService.getAllRequests();
      setRequests(data);
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: ServiceRequest['status']) => {
    try {
      await multiService.updateRequestStatus(id, status);
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
      toast.success(`Statut mis à jour : ${status}`);
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer définitivement cette demande ?')) return;
    try {
      await multiService.deleteRequest(id);
      setRequests(requests.filter(r => r.id !== id));
      toast.success('Demande supprimée');
    } catch (err) {
      toast.error('Error deleting request');
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    completed: requests.filter(r => r.status === 'completed').length,
    processing: requests.filter(r => r.status === 'processing').length
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Chargement des demandes...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Gestion des Services</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Suivez et traitez les demandes de WA Multiservices.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Demandes', value: stats.total, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'En Attente', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'En Cours', value: stats.processing, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Terminé', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", item.bg, item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter italic">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-all font-bold" />
            <input 
              type="text" 
              placeholder="Rechercher par nom ou service..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold placeholder:italic"
            />
          </div>

          <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
            {['all', 'pending', 'processing', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  statusFilter === status 
                    ? "bg-white text-slate-900 shadow-md border border-slate-100" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {status === 'all' ? 'Tous' : status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Randevou</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredRequests.map((req) => (
                  <motion.tr 
                    layout
                    key={req.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg">
                          {req.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors italic uppercase">{req.fullName}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest"><Phone className="w-2.5 h-2.5" /> {req.phone}</span>
                            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest"><Mail className="w-2.5 h-2.5" /> {req.email.split('@')[0]}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight italic">{req.service}</p>
                        <p className="text-[9px] text-slate-400 font-medium italic mt-1 line-clamp-1">{req.details}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                        req.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                        req.status === 'processing' ? "bg-blue-50 text-blue-600 border-blue-100" :
                        req.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        "bg-red-50 text-red-600 border-red-100"
                      )}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-900 italic uppercase">Randevou: {req.appointmentDate}</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-1">Voye: {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={`https://wa.me/${req.whatsapp.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        
                        <div className="relative group/menu">
                          <button className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl opacity-0 group-hover/menu:opacity-100 invisible group-hover/menu:visible transition-all z-20 overflow-hidden">
                             <button 
                               onClick={() => handleStatusUpdate(req.id, 'processing')}
                               className="w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-3"
                             >
                               <Target className="w-3.5 h-3.5" /> En cours
                             </button>
                             <button 
                               onClick={() => handleStatusUpdate(req.id, 'completed')}
                               className="w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-3"
                             >
                               <CheckCircle className="w-3.5 h-3.5" /> Terminé
                             </button>
                             <button 
                               onClick={() => handleStatusUpdate(req.id, 'cancelled')}
                               className="w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                             >
                               <XCircle className="w-3.5 h-3.5" /> Annulé
                             </button>
                             <div className="h-[1px] bg-slate-50 my-1"></div>
                             <button 
                               onClick={() => handleDelete(req.id)}
                               className="w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center gap-3"
                             >
                               <Trash2 className="w-3.5 h-3.5" /> Supprimer
                             </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {filteredRequests.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 italic">Aucune demande trouvée</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
