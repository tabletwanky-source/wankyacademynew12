import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Footer from '../components/common/Footer';

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Kijan mwen ka konekte?",
      answer: "Sèvi ak kòd aksè WA-INF-2025-XXXX ou te resevwa lè ou te enskri a."
    },
    {
      question: "Ki kondisyon pou m jwenn yon sètifika?",
      answer: "Ou dwe jwenn yon nòt omwen 70% nan egzamen final la."
    },
    {
      question: "Èske mwen ka refè yon egzamen?",
      answer: "Wi, ou gen dwa a 2 tantativ pou chak egzamen. Pi bon nòt ou a ap konsève."
    },
    {
      question: "Kijan pou m verifye sètifika mwen?",
      answer: "Sèvi ak zouti verifikasyon sou sit nou an lè w eskane kòd QR la oswa lè w antre ID sètifika a."
    },
    {
      question: "Èske sistèm nan travay san entènèt?",
      answer: "Yon koneksyon entènèt nesesè pou validasyon inisyal la ak soumèt rezilta yo."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto px-6 py-20 w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <HelpCircle className="w-4 h-4" /> Centre d'aide
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">FAQ - Questions Fréquentes</h1>
          <p className="text-slate-500 font-medium">Trouvez des réponses rapides aux questions les plus courantes sur Wanky Academy.</p>
        </div>

        {/* Search */}
        <div className="relative mb-12">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input 
            type="text" 
            placeholder="Rechercher une question..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-3xl py-6 pl-16 pr-8 text-sm font-bold shadow-sm focus:border-indigo-600 outline-none transition-all"
          />
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
              >
                <span className="font-black text-slate-800 uppercase italic text-sm tracking-tight group-hover:text-indigo-600 transition-colors">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-indigo-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-300" />
                )}
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8 pt-0 text-slate-600 font-medium leading-relaxed border-t border-slate-50 mt-2 pt-6">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          
          {filteredFaqs.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
               <p className="text-slate-400 font-black uppercase tracking-widest italic">Aucun résultat trouvé pour "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Support CTA */}
        <div className="mt-16 p-10 bg-[#0f172a] rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-100 relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-2xl font-black italic uppercase mb-2">Toujours besoin d'aide ?</h3>
              <p className="text-slate-400 text-sm font-bold">Notre équipe de support est disponible pour répondre à vos questions spécifiques.</p>
           </div>
           <a 
             href="https://wa.me/18293478077" 
             target="_blank" 
             rel="noreferrer"
             className="relative z-10 flex items-center gap-3 px-8 py-4 bg-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all shadow-xl shadow-indigo-500/20"
           >
             <MessageCircle className="w-4 h-4" /> Contactez-nous
           </a>
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
