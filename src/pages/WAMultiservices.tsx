import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  MessageSquare,
  ChevronRight,
  Upload,
  Calendar,
  User,
  Mail,
  Smartphone,
  ExternalLink,
  Shield,
  Zap,
  Handshake,
  Lock,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { multiService } from '../services/multiService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

const SERVICES = [
  { id: 'kopi', name: 'Kopi', details: 'Nwa & blan (5 pesos), Koulè (20 pesos)', icon: FileText },
  { id: 'skane', name: 'Skane', details: 'Skanaj dokiman rapid', icon: Search },
  { id: 'mirex', name: 'Legalizasyon MIREX', details: 'Pwosesis legalizasyon ofisyèl', icon: ShieldCheck },
  { id: 'visa-brezil', name: 'Randevou Visa Brezil (RD)', details: 'Asistans pou randevou', icon: Calendar },
  { id: 'tretman', name: 'Tretman tèks', details: 'Sizisman ak fòma tèks', icon: FileText },
  { id: 'visa-kolonbi', name: 'Demann Visa Kolonbi', details: 'Asistans dosye viza', icon: ExternalLink },
  { id: 'maryaj', name: 'Kat maryaj', details: 'Konsepsyon ak enpresyon', icon: CheckCircle },
  { id: 'setifika', name: 'Sètifika', details: 'Enpresyon sètifika divès', icon: FileText },
  { id: 'foto', name: 'Foto pou paspò / viza', details: 'Foto idantite ofisyèl', icon: User },
];

export default function WAMultiservices() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    whatsapp: '',
    email: '',
    service: '',
    details: '',
    appointmentDate: '',
    documentUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await multiService.createRequest(formData);
      toast.success('Demann ou an voye avèk siksè!');
      setSuccess(true);
      setFormData({
        fullName: '',
        phone: '',
        whatsapp: '',
        email: '',
        service: '',
        details: '',
        appointmentDate: '',
        documentUrl: ''
      });
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (num: string) => {
    window.open(`https://wa.me/${num.replace(/[^0-9]/g, '')}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sticky Mobile Call Button */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden flex flex-col gap-3">
        <button 
          onClick={() => openWhatsApp('8293478077')}
          className="w-14 h-14 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce"
        >
          <Smartphone className="w-6 h-6" />
        </button>
        <a 
          href="tel:8296209249"
          className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center"
        >
          <Phone className="w-6 h-6" />
        </a>
      </div>

      {/* Hero Section */}
      <section className="relative bg-white pt-24 pb-32 overflow-hidden border-b border-slate-100">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 text-xs font-black uppercase tracking-widest mb-8 border border-indigo-100"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Sèvis Rapid e Pwofesyonèl
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight"
            >
              WA <span className="text-indigo-600 italic">MULTISERVICES</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl mb-12 font-medium uppercase tracking-[0.2em] italic"
            >
              SÈVIS ADMINISTRATIF RAPID, FYAB E PWOFESYONÈL
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="px-6 py-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold shadow-sm"
            >
              <MapPin className="w-4 h-4" />
              Services available only in Santo Domingo, Dominican Republic.
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Nou Ofri Ou</h2>
            <div className="w-24 h-1.5 bg-indigo-600 rounded-full"></div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Eksplore Sèvis Nou Yo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-200 hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
            >
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
                <service.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 italic uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                {service.name}
              </h3>
              <p className="text-slate-500 text-sm font-medium italic leading-relaxed flex-1">
                {service.details}
              </p>
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Disponib</span>
                </div>
                <button 
                  onClick={() => {
                    setFormData({...formData, service: service.name});
                    document.getElementById('request-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors flex items-center gap-2"
                >
                  Kòmande <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Request Form Section */}
      <section id="request-form" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight italic uppercase">Fè yon Demann</h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed italic">
                Ranpli fòm sa a pou nou ka kòmanse trete demand ou a rapidman. Yon ajan ap kontakte ou nan mwens ke 2 èdtan.
              </p>
            </div>

            {/* Guarantees */}
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { label: 'Sèvis serye e sekirize', icon: Shield, col: 'bg-indigo-500/10 text-indigo-400' },
                { label: 'Rapidite ak efikasite', icon: Zap, col: 'bg-emerald-500/10 text-emerald-400' },
                { label: 'Konfyans ak pwofesyonalis', icon: Handshake, col: 'bg-amber-500/10 text-amber-400' },
                { label: 'Diskresyon garanti', icon: Lock, col: 'bg-purple-500/10 text-purple-400' },
              ].map((g, i) => (
                <div key={i} className="flex flex-col gap-4 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${g.col}`}>
                    <g.icon className="w-6 h-6" />
                  </div>
                  <p className="font-bold uppercase tracking-widest text-[10px] leading-tight">{g.label}</p>
                </div>
              ))}
            </div>

            {/* Notices */}
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Nòt Enpòtan :</p>
              <div className="space-y-3">
                {[
                  'Pou tout demann viza yo, nou travay sèlman ak dokiman orijinal.',
                  'Viza se yon koutwazi yon peyi souverèn bay; sa pa garanti otomatikman.',
                  'Lè yo konfime randevou ou, se lè sa a ou dwe fin peye.',
                  'Nou pa yon ajans vwayaj. Nou fasilite kliyan yo pran randevou.'
                ].map((note, i) => (
                  <div key={i} className="flex gap-4 items-start text-sm text-slate-300 italic">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                    <p>{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative">
            <div className="absolute top-0 right-12 -translate-y-1/2 flex gap-4">
               <div className="px-6 py-3 bg-indigo-600 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-xl">Sekirize</div>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center text-center gap-6"
                >
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Demann Voye!</h3>
                  <p className="text-slate-500 font-medium italic">Nou resevwa enfòmasyon ou yo. Yon moun ap kontakte ou nan yon ti kras tan.</p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="mt-8 px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-3"
                  >
                    Fè yon lòt demann <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                         <User className="w-3 h-3" /> Non Komplè
                       </label>
                       <input 
                        required
                        type="text" 
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        placeholder="John Doe"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                         <Mail className="w-3 h-3" /> Email
                       </label>
                       <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        placeholder="email@ekzanp.com"
                       />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                         <Phone className="w-3 h-3" /> Telefòn
                       </label>
                       <input 
                        required
                        type="tel" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        placeholder="829-000-0000"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                         <Smartphone className="w-3 h-3" /> WhatsApp
                       </label>
                       <input 
                        required
                        type="tel" 
                        value={formData.whatsapp}
                        onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        placeholder="WhatsApp Number"
                       />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                         <ChevronRight className="w-3 h-3" /> Sèvis Bezwen
                       </label>
                       <select 
                        required
                        value={formData.service}
                        onChange={e => setFormData({...formData, service: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none"
                       >
                         <option value="">-- Chwazi --</option>
                         {SERVICES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                         <Calendar className="w-3 h-3" /> Randevou
                       </label>
                       <input 
                        required
                        type="date" 
                        value={formData.appointmentDate}
                        onChange={e => setFormData({...formData, appointmentDate: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                      <Upload className="w-3 h-3" /> Link Dokiman (Opsyonèl)
                    </label>
                    <input 
                      type="url" 
                      value={formData.documentUrl}
                      onChange={e => setFormData({...formData, documentUrl: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="https://link-to-doc.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                      <MessageSquare className="w-3 h-3" /> Detay Adisyonèl
                    </label>
                    <textarea 
                      rows={3}
                      value={formData.details}
                      onChange={e => setFormData({...formData, details: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="Ban nou plis detay sou sa ou bezwen..."
                    />
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full py-6 bg-slate-900 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                    Voye Demann Nan
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Kontakte Nou</h3>
              <div className="space-y-4">
                <a href="tel:8296209249" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefòn</p>
                    <p className="font-bold text-slate-900 tracking-tight">829-620-9249</p>
                  </div>
                </a>
                <button onClick={() => openWhatsApp('8293478077')} className="flex items-center gap-4 group w-full text-left">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</p>
                    <p className="font-bold text-slate-900 tracking-tight">+1 (829) 347-8077</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Adrès</h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Santo Domingo, RD</p>
                  <p className="font-bold text-slate-900 tracking-tight leading-relaxed italic">Antre Pasini</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Orè Travay</h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disponibilite</p>
                  <p className="font-bold text-slate-900 tracking-tight leading-relaxed italic">Lendi - Samdi: 8:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg">WA</div>
             <span className="font-black text-slate-900 tracking-tighter uppercase italic">Multiservices</span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">© 2026 WA MULTISERVICES. TOUT DWA REZÈVE.</p>
        </div>
      </footer>
    </div>
  );
}
