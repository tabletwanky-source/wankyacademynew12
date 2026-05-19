import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Settings, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Car,
  CreditCard,
  Info
} from 'lucide-react';
import { financeService } from '../../services/financeService';
import { FinancialSettings } from '../../types';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function AdminFinancialSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<FinancialSettings>({
    informatique: { registrationFee: 2000, monthlyFee: 2000 },
    techniqueInfo: { registrationFee: 2000, monthlyFee: 2000 },
    autoEcole: { registrationFee: 2000, installment1: 3500, installment2: 3500, total: 7000 }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await financeService.getSettings();
      if (data) setSettings(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await financeService.updateSettings(settings);
      toast.success('Paramètres financiers mis à jour');
    } catch (error) {
      toast.error('Échec de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Chargement des tarifs...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Configuration Financière</h1>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Gérez les frais de scolarité et d'inscription</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer les modifications
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Informatique */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-indigo-50/30">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                 <Building2 className="w-5 h-5" />
              </div>
              <div>
                 <h2 className="font-black text-slate-800 uppercase italic">Informatique</h2>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paiement Mensuel</p>
              </div>
           </div>
           <div className="p-6 space-y-4">
              <div>
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Frais d'Inscription (RD$)</label>
                 <input 
                   type="number" 
                   value={settings.informatique.registrationFee}
                   onChange={e => setSettings({...settings, informatique: {...settings.informatique, registrationFee: Number(e.target.value)}})}
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-600 transition-all"
                 />
              </div>
              <div>
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mensualité (RD$)</label>
                 <input 
                   type="number" 
                   value={settings.informatique.monthlyFee}
                   onChange={e => setSettings({...settings, informatique: {...settings.informatique, monthlyFee: Number(e.target.value)}})}
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-600 transition-all"
                 />
              </div>
           </div>
        </div>

        {/* Technique Informatique */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-emerald-50/30">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                 <Settings className="w-5 h-5" />
              </div>
              <div>
                 <h2 className="font-black text-slate-800 uppercase italic">Technique Info</h2>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paiement Mensuel</p>
              </div>
           </div>
           <div className="p-6 space-y-4">
              <div>
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Frais d'Inscription (RD$)</label>
                 <input 
                   type="number" 
                   value={settings.techniqueInfo.registrationFee}
                   onChange={e => setSettings({...settings, techniqueInfo: {...settings.techniqueInfo, registrationFee: Number(e.target.value)}})}
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-emerald-600 transition-all"
                 />
              </div>
              <div>
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mensualité (RD$)</label>
                 <input 
                   type="number" 
                   value={settings.techniqueInfo.monthlyFee}
                   onChange={e => setSettings({...settings, techniqueInfo: {...settings.techniqueInfo, monthlyFee: Number(e.target.value)}})}
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-emerald-600 transition-all"
                 />
              </div>
           </div>
        </div>

        {/* Auto École */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden md:col-span-2">
           <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-amber-50/30">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-100">
                 <Car className="w-5 h-5" />
              </div>
              <div>
                 <h2 className="font-black text-slate-800 uppercase italic">Auto École</h2>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paiement par Versements</p>
              </div>
           </div>
           <div className="p-6 grid md:grid-cols-4 gap-4">
              <div>
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Inscription (RD$)</label>
                 <input 
                   type="number" 
                   value={settings.autoEcole.registrationFee}
                   onChange={e => setSettings({...settings, autoEcole: {...settings.autoEcole, registrationFee: Number(e.target.value)}})}
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-amber-600 transition-all"
                 />
              </div>
              <div>
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">1e Versement (RD$)</label>
                 <input 
                   type="number" 
                   value={settings.autoEcole.installment1}
                   onChange={e => setSettings({...settings, autoEcole: {...settings.autoEcole, installment1: Number(e.target.value)}})}
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-amber-600 transition-all"
                 />
              </div>
              <div>
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">2e Versement (RD$)</label>
                 <input 
                   type="number" 
                   value={settings.autoEcole.installment2}
                   onChange={e => setSettings({...settings, autoEcole: {...settings.autoEcole, installment2: Number(e.target.value)}})}
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-amber-600 transition-all"
                 />
              </div>
              <div>
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total Pack (RD$)</label>
                 <input 
                   type="number" 
                   value={settings.autoEcole.total}
                   onChange={e => setSettings({...settings, autoEcole: {...settings.autoEcole, total: Number(e.target.value)}})}
                   className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 font-black text-amber-700 outline-none transition-all cursor-not-allowed"
                   readOnly
                 />
              </div>
           </div>
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start gap-4">
         <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
         <p className="text-[10px] font-bold text-amber-900 uppercase tracking-tighter leading-relaxed">
           Ces paramètres contrôlent les options de paiement par défaut pour tous les nouveaux paiements. Toute modification ici sera immédiatement reflétée dans les sélections possibles pour les nouveaux encaissements.
         </p>
      </div>
    </div>
  );
}
