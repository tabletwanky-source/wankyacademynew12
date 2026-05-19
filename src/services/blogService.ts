import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc,
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  increment,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Article, ArticleComment, ArticleLike } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

export const blogService = {
  subscribeArticles(callback: (articles: Article[]) => void, onlyPublished = true) {
    let q = query(
      collection(db, 'articles'),
      orderBy('createdAt', 'desc')
    );
    
    if (onlyPublished) {
      q = query(q, where('published', '==', true), where('status', '==', 'published'));
    }

    return onSnapshot(q, (snap) => {
      const articles = snap.docs.map(d => ({ ...d.data(), id: d.id })) as Article[];
      callback(articles);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'articles');
    });
  },

  async getArticle(id: string) {
    try {
      const docRef = doc(db, 'articles', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as Article;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `articles/${id}`);
      throw error;
    }
  },

  async addArticle(data: Omit<Article, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>) {
    try {
      return await addDoc(collection(db, 'articles'), {
        ...data,
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'articles');
      throw error;
    }
  },

  async updateArticle(id: string, data: Partial<Article>) {
    try {
      const ref = doc(db, 'articles', id);
      await updateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `articles/${id}`);
      throw error;
    }
  },

  async deleteArticle(id: string) {
    try {
      await deleteDoc(doc(db, 'articles', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `articles/${id}`);
      throw error;
    }
  },

  // Comments
  subscribeComments(articleId: string, callback: (comments: ArticleComment[]) => void) {
    const q = query(
      collection(db, 'articleComments'),
      where('articleId', '==', articleId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const comments = snap.docs.map(d => ({ ...d.data(), id: d.id })) as ArticleComment[];
      callback(comments);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'articleComments');
    });
  },

  async addComment(articleId: string, data: Omit<ArticleComment, 'id' | 'createdAt'>) {
    try {
      // 1. Add comment
      await addDoc(collection(db, 'articleComments'), {
        ...data,
        articleId,
        createdAt: serverTimestamp()
      });
      
      // 2. Increment comment count
      const articleRef = doc(db, 'articles', articleId);
      await updateDoc(articleRef, {
        commentsCount: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'articleComments');
      throw error;
    }
  },

  // Likes
  async toggleLike(articleId: string, userId: string) {
    try {
      const q = query(
        collection(db, 'articleLikes'),
        where('articleId', '==', articleId),
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      
      const articleRef = doc(db, 'articles', articleId);

      if (snap.empty) {
        // Like
        await addDoc(collection(db, 'articleLikes'), {
          articleId,
          userId,
          createdAt: serverTimestamp()
        });
        await updateDoc(articleRef, {
          likesCount: increment(1)
        });
        return true;
      } else {
        // Unlike
        await deleteDoc(doc(db, 'articleLikes', snap.docs[0].id));
        await updateDoc(articleRef, {
          likesCount: increment(-1)
        });
        return false;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'articleLikes');
      throw error;
    }
  },

  async checkUserLike(articleId: string, userId: string) {
    try {
      const q = query(
        collection(db, 'articleLikes'),
        where('articleId', '==', articleId),
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      return !snap.empty;
    } catch (error) {
      return false;
    }
  }
};
