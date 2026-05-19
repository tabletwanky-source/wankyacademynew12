import { supabase } from '../lib/supabase';
import { mapArticle, mapArticleToDb } from '../lib/supabaseHelpers';
import { Article, ArticleComment, ArticleLike } from '../types';

export const blogService = {
  subscribeArticles(callback: (articles: Article[]) => void, onlyPublished = true) {
    const load = async () => {
      let query = supabase.from('articles').select('*').order('created_at', { ascending: false });
      if (onlyPublished) {
        query = query.eq('published', true).eq('status', 'published');
      }
      const { data } = await query;
      callback((data || []).map(mapArticle) as Article[]);
    };

    const channel = supabase
      .channel('articles-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async getArticle(id: string) {
    const { data } = await supabase.from('articles').select('*').eq('id', id).maybeSingle();
    return data ? mapArticle(data) as Article : null;
  },

  async addArticle(data: Omit<Article, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>) {
    const dbData = {
      ...mapArticleToDb(data),
      likes_count: 0,
      comments_count: 0
    };
    const { data: result, error } = await supabase.from('articles').insert(dbData).select().single();
    if (error) throw error;
    return result;
  },

  async updateArticle(id: string, data: Partial<Article>) {
    const { error } = await supabase.from('articles').update({
      ...mapArticleToDb(data),
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (error) throw error;
  },

  async deleteArticle(id: string) {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) throw error;
  },

  subscribeComments(articleId: string, callback: (comments: ArticleComment[]) => void) {
    const load = async () => {
      const { data } = await supabase
        .from('article_comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });
      callback((data || []).map(r => ({
        id: r.id,
        articleId: r.article_id,
        userId: r.user_id,
        userName: r.user_name,
        content: r.content,
        createdAt: r.created_at
      })) as ArticleComment[]);
    };

    const channel = supabase
      .channel(`comments-${articleId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'article_comments', filter: `article_id=eq.${articleId}` }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async addComment(articleId: string, data: Omit<ArticleComment, 'id' | 'createdAt'>) {
    const { error } = await supabase.from('article_comments').insert({
      article_id: articleId,
      user_id: data.userId || null,
      user_name: data.userName,
      content: data.content
    });
    if (error) throw error;

    const { data: article } = await supabase.from('articles').select('comments_count').eq('id', articleId).single();
    if (article) {
      await supabase.from('articles').update({ comments_count: (article.comments_count || 0) + 1 }).eq('id', articleId);
    }
  },

  async toggleLike(articleId: string, userId: string) {
    const { data: existing } = await supabase
      .from('article_likes')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', userId)
      .maybeSingle();

    const { data: article } = await supabase.from('articles').select('likes_count').eq('id', articleId).single();
    const currentLikes = article?.likes_count || 0;

    if (!existing) {
      await supabase.from('article_likes').insert({ article_id: articleId, user_id: userId });
      await supabase.from('articles').update({ likes_count: currentLikes + 1 }).eq('id', articleId);
      return true;
    } else {
      await supabase.from('article_likes').delete().eq('id', existing.id);
      await supabase.from('articles').update({ likes_count: Math.max(0, currentLikes - 1) }).eq('id', articleId);
      return false;
    }
  },

  async checkUserLike(articleId: string, userId: string) {
    const { data } = await supabase
      .from('article_likes')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', userId)
      .maybeSingle();
    return !!data;
  }
};
