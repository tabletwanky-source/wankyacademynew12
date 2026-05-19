import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Send, 
  Loader2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Tag,
  ArrowRight
} from 'lucide-react';
import { blogService } from '../../services/blogService';
import { Article, ArticleComment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function ArticleDetail() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [authorProfile, setAuthorProfile] = useState<any>(null);

  useEffect(() => {
    if (!articleId) return;

    const loadArticle = async () => {
      try {
        const data = await blogService.getArticle(articleId);
        if (!data || (!data.published && userData?.role !== 'admin' && userData?.uid !== data.authorId)) {
          toast.error("Article non trouvé ou non publié");
          navigate('/blog');
          return;
        }
        setArticle(data);
        
        if (user) {
          const liked = await blogService.checkUserLike(articleId, user.uid);
          setIsLiked(liked);
        }
      } catch (err) {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
    const unsubComments = blogService.subscribeComments(articleId, setComments);
    return () => unsubComments();
  }, [articleId, user, userData]);

  const handleLike = async () => {
    if (!user || !articleId) {
      toast.error("Connectez-vous pour aimer cet article");
      return;
    }
    try {
      const liked = await blogService.toggleLike(articleId, user.uid);
      setIsLiked(liked);
      // Update local count for UI responsiveness
      if (article) {
        setArticle({ ...article, likesCount: liked ? article.likesCount + 1 : article.likesCount - 1 });
      }
    } catch (err) {
      toast.error("Erreur de synchronisation");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !articleId) return;

    setSubmittingComment(true);
    try {
      await blogService.addComment(articleId, {
        articleId,
        userName: userData?.fullName || 'Visiteur Anonyme',
        userId: user?.uid,
        content: newComment
      });
      setNewComment('');
      toast.success("Commentaire ajouté !");
    } catch (err) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-8">
       <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-[#0f172a]" />
          <div className="absolute inset-0 flex items-center justify-center">
             <Calendar className="w-6 h-6 text-indigo-500 animate-pulse" />
          </div>
       </div>
       <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-300 italic">Édition de l'article en cours...</p>
    </div>
  );

  if (!article) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Article Header */}
      <div className="relative pt-32 pb-40 px-6 bg-slate-900 border-b border-white/5 overflow-hidden">
        {/* Background Image */}
        {article.thumbnail && (
          <div className="absolute inset-0 opacity-20">
            <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover blur-2xl scale-110" />
            <div className="absolute inset-0 bg-slate-900/80"></div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-12">
           <button 
             onClick={() => navigate('/blog')}
             className="flex items-center gap-3 text-white/50 hover:text-white transition-all text-xs font-black uppercase tracking-widest italic group"
           >
             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" /> Retour au Blog
           </button>

           <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-6">
                 <span className="px-5 py-1.5 bg-indigo-600 text-white text-[10px] font-black italic rounded-full uppercase tracking-widest shadow-xl shadow-indigo-900/50">
                    {article.category || 'ACADÉMIQUE'}
                 </span>
                 <div className="flex items-center gap-3 text-white/40 text-[10px] font-black uppercase tracking-widest italic">
                    <Calendar className="w-4 h-4 text-indigo-400" /> {new Date(article.createdAt?.toDate?.() || article.createdAt).toLocaleDateString('fr-FR')}
                 </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white italic leading-[1] uppercase tracking-tighter decoration-indigo-500 decoration-8">
                {article.title}
              </h1>

              <div className="flex items-center gap-6 pt-6">
                 <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white border-2 border-white/10 shadow-2xl relative">
                    <User className="w-6 h-6" />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-md">
                       <ShieldCheck className="w-3 h-3" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <p className="text-white font-black italic uppercase tracking-tight text-lg">{article.authorName}</p>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">{article.authorRole}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 -mt-24 pb-32">
         <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200 overflow-hidden relative">
            {/* Visual Header */}
            {article.thumbnail && article.thumbnail !== "" && (
              <div className="aspect-[21/9] bg-slate-900 relative">
                 <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Floating Interaction Bar */}
            <div className="absolute top-0 right-10 translate-y-1/2 flex flex-col gap-4">
               <button 
                onClick={handleLike}
                className={cn(
                  "p-5 rounded-3xl shadow-2xl transition-all active:scale-90 flex items-center justify-center gap-3",
                  isLiked ? "bg-indigo-600 text-white" : "bg-white text-slate-400 hover:text-indigo-600"
                )}
               >
                  <ThumbsUp className={cn("w-6 h-6", isLiked && "fill-current")} />
                  {article.likesCount > 0 && <span className="text-sm font-black">{article.likesCount}</span>}
               </button>
               <button className="p-5 bg-white text-slate-400 hover:text-indigo-600 rounded-3xl shadow-2xl transition-all">
                  <Share2 className="w-6 h-6" />
               </button>
            </div>

            <div className="p-10 md:p-24 space-y-12">
               {/* Body Content */}
               <div className="article-content prose prose-slate prose-lg max-w-none prose-headings:italic prose-headings:uppercase prose-headings:font-black prose-headings:tracking-tighter prose-p:italic prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-[#0f172a] prose-blockquote:border-indigo-600 prose-blockquote:bg-indigo-50 prose-blockquote:rounded-2xl prose-blockquote:px-8 prose-blockquote:py-6 prose-img:rounded-[2.5rem] prose-img:shadow-2xl">
                  {/* Since content might be HTML, use dangerouslySetInnerHTML carefully if needed, or just plain text/paragraphs */}
                  <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }} />
               </div>

               {/* Tags & Meta Details */}
               <div className="flex flex-wrap gap-3 pt-12 border-t border-slate-50">
                  {['Academic', 'Reference', 'Learning'].map(tag => (
                    <span key={tag} className="px-5 py-2 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest italic rounded-xl flex items-center gap-2">
                       <Tag className="w-3.5 h-3.5" /> {tag}
                    </span>
                  ))}
               </div>

               {/* Author Bio Card */}
               <div className="bg-slate-50 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="w-24 h-24 bg-[#0f172a] rounded-[2rem] flex items-center justify-center text-white shrink-0 shadow-2xl italic font-black text-2xl border-4 border-white">
                     {article.authorName.charAt(0)}
                  </div>
                  <div className="space-y-4 text-center md:text-left">
                     <div className="space-y-1">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">{article.authorName}</h3>
                        <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Auteur Certifié Wanky Academy</p>
                     </div>
                     <p className="text-sm text-slate-500 italic leading-relaxed">
                        Expert en éducation et formateur passionné à Wanky Academy. Dédié à la diffusion des connaissances académiques et technologiques.
                     </p>
                     <button className="text-[10px] font-black uppercase tracking-widest text-indigo-500 underline underline-offset-4 flex items-center gap-2 mx-auto md:mx-0">
                        Voir toutes les publications <ArrowRight className="w-3 h-3" />
                     </button>
                  </div>
               </div>

               {/* Discussion System */}
               <div className="space-y-12">
                  <div className="flex items-center justify-between">
                     <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 border-l-8 border-indigo-600 pl-6">
                        Discussion <span className="text-indigo-600 ml-2">({comments.length})</span>
                     </h3>
                  </div>

                  <form onSubmit={handleComment} className="space-y-6">
                     <div className="relative group">
                        <textarea 
                          rows={4}
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          placeholder="Partagez vos réflexions ou posez une question académique..."
                          className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm italic focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none resize-none placeholder:text-slate-300 shadow-inner"
                        ></textarea>
                        <div className="absolute bottom-6 right-6">
                           <button 
                             type="submit"
                             disabled={submittingComment || !newComment.trim()}
                             className="px-8 py-4 bg-[#0f172a] text-white rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-indigo-900/10 disabled:opacity-50"
                           >
                             {submittingComment ? <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> : <Send className="w-4 h-4" />}
                             PUBLIER MON COMMENTAIRE
                           </button>
                        </div>
                     </div>
                  </form>

                  <div className="space-y-6">
                     {comments.map((comment, i) => (
                       <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={comment.id} 
                        className="flex gap-6 group"
                       >
                          <div className="w-14 h-14 bg-white border border-slate-100 rounded-[1.25rem] shadow-xl flex items-center justify-center text-[#0f172a] font-black italic text-lg shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                             {comment.userName.charAt(0)}
                          </div>
                          <div className="flex-1 space-y-2">
                             <div className="flex items-center gap-4">
                                <p className="text-sm font-black italic uppercase tracking-tight text-slate-900">{comment.userName}</p>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest border-l border-slate-100 pl-4">
                                   {new Date(comment.createdAt?.toDate?.() || comment.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                             </div>
                             <p className="text-sm text-slate-500 italic bg-white border border-slate-100 p-6 rounded-[2rem] rounded-tl-none leading-relaxed shadow-sm">
                                {comment.content}
                             </p>
                          </div>
                       </motion.div>
                     ))}
                     {comments.length === 0 && (
                       <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-white">
                          <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 italic">Soyez le premier à enrichir la discussion</p>
                       </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Share Article Section */}
         <div className="mt-20 text-center space-y-8">
            <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-300 italic">Cet article vous a été utile ?</h4>
            <div className="flex justify-center gap-6">
               <button className="px-10 py-5 bg-[#0f172a] text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-3 shadow-2xl">
                  <Share2 className="w-4 h-4" /> Partager l'article
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
