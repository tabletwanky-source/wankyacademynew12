import React from 'react';
import { Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import Footer from '../components/common/Footer';

export default function Privacy() {
  const sections = [
    {
      title: "Data Collection",
      icon: Eye,
      content: "Nous collectons les informations nécessaires à votre parcours académique, notamment votre nom, adresse e-mail et numéro de téléphone lors de l'inscription."
    },
    {
      title: "Student Information",
      icon: Shield,
      content: "Vos dossiers académiques, nòt egzamen ak sètifika yo estoke an sekirite nan baz done nou an."
    },
    {
      title: "Firebase Authentication",
      icon: Lock,
      content: "Nou itilize Firebase Authentication pou asire aksè nan kont ou an sekirite. Kòd aksè ou se pèsonèl."
    },
    {
      title: "Security Measures",
      icon: CheckCircle2,
      content: "Toutes les données sont protégées par les protocoles de sécurité de Google Cloud et Firebase, garantissant une protection maximale contre les accès non autorisés."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto px-6 py-20 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">Politique de Confidentialité</h1>
          <p className="text-slate-500 font-medium">Comment nous protégeons vos données à Wanky Academy.</p>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden p-8 md:p-16 space-y-12">
          <section className="prose prose-slate max-w-none">
            <p className="text-slate-600 font-medium leading-relaxed">
              Chez Wanky Academy, nous accordons une importance primordiale à la protection de votre vie privée. Cette politique explique comment nous traitons vos informations personnelles au sein de notre plateforme d'apprentissage.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4"
              >
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <section.icon className="w-6 h-6" />
                </div>
                <h3 className="font-black text-slate-800 uppercase italic tracking-tight">{section.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>

          <section className="space-y-6 pt-12 border-t border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Utilisation des Cookies</h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              Nous utilisons des cookies essentiels pour maintenir votre session active et sécurisée. Pour plus de détails, consultez notre <a href="/cookies" className="text-indigo-600 underline">Politique de Cookies</a>.
            </p>
            
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Vos Droits</h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              Vous avez le droit d'accéder à vos informations, de les rectifier ou de demander leur suppression. Contactez l'administration pour toute demande concernant vos données.
            </p>
          </section>

          <div className="p-8 bg-[#0f172a] rounded-[2rem] text-white flex items-center justify-between gap-6">
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Dernière mise à jour</p>
               <p className="font-bold">20 Mars 2026</p>
            </div>
            <FileText className="w-8 h-8 text-indigo-400 opacity-50" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
