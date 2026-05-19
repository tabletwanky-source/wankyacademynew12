import React from 'react';
import { Copyright, Youtube, BookOpen, Scale, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import Footer from '../components/common/Footer';

export default function CopyrightPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="flex-1 max-w-4xl mx-auto px-6 py-20 w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Copyright className="w-4 h-4" /> Propriété Intellectuelle
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">Copyright & Fair Use</h1>
          <p className="text-slate-500 font-medium">Protection du contenu et respect des droits de tiers.</p>
        </div>

        <div className="space-y-10">
          {/* Section 1 */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-12 shadow-sm"
          >
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center">
                   <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">1. INTRODUCTION</h2>
             </div>
             <p className="text-slate-600 font-medium leading-relaxed md:text-lg">
               Wanky Academy s'engage à respecter les droits de propriété intellectuelle tout en favorisant l'accès à l'éducation numérique.
             </p>
          </motion.section>

          {/* Section 2 */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-12 shadow-sm overflow-hidden relative"
          >
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center">
                   <Youtube className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">2. DROIT D'AUTEUR & VIDÉOS</h2>
             </div>
             
             <div className="space-y-6 relative z-10">
                <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-indigo-600">
                   <p className="text-slate-700 font-bold italic mb-2 uppercase text-xs tracking-widest">Avis Original :</p>
                   <p className="text-slate-600 font-medium leading-relaxed">
                     Tout le contenu original créé par Wanky Academy (textes, logos, structures de cours, quiz) est protégé par le droit d'auteur. Toute reproduction non autorisée est strictement interdite.
                   </p>
                </div>

                <div className="p-6 bg-amber-50 rounded-2xl border-l-4 border-amber-500">
                   <p className="text-amber-800 font-bold italic mb-2 uppercase text-xs tracking-widest flex items-center gap-2">
                     <AlertTriangle className="w-3 h-3" /> Avertissement Vidéos Externes :
                   </p>
                   <p className="text-amber-700 font-medium leading-relaxed italic">
                     Wanky Academy utilise des vidéos éducatives provenant de YouTube. Ces vidéos appartiennent à leurs créateurs respectifs. Nous les utilisons uniquement à des fins éducatives sous la doctrine du "Fair Use".
                   </p>
                </div>
             </div>
             <Copyright className="absolute top-1/2 -translate-y-1/2 right-0 w-64 h-64 text-slate-50 -mr-16 rotate-12 -z-10" />
          </motion.section>

          {/* Section 3 */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-100"
          >
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                   <Scale className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">3. FAIR USE</h2>
             </div>
             <p className="text-slate-300 font-medium leading-relaxed md:text-lg mb-8">
               Conformément aux lois internationales, l'utilisation de contenus tiers sur cette plateforme est limitée à des fins d'enseignement, de critique et de recherche, sans but lucratif direct sur le contenu d'autrui.
             </p>
             <div className="flex items-center gap-3 py-4 px-6 bg-white/5 rounded-2xl border border-white/10 italic">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <p className="text-sm font-bold text-slate-400">Date d'effet : <span className="text-white">20 Mars 2026</span></p>
             </div>
          </motion.section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
