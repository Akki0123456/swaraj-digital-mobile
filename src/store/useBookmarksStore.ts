import { create } from 'zustand';
import { NewsArticle } from '../types/news';

interface BookmarksState {
  bookmarks: NewsArticle[];
  addBookmark: (article: NewsArticle) => void;
  removeBookmark: (articleId: string) => void;
  toggleBookmark: (article: NewsArticle) => void;
  isBookmarked: (articleId: string) => boolean;
}

export const useBookmarksStore = create<BookmarksState>((set, get) => ({
  bookmarks: [],
  addBookmark: (article) =>
    set((state) => {
      if (state.bookmarks.some((b) => b.id === article.id)) return state;
      return { bookmarks: [article, ...state.bookmarks] };
    }),
  removeBookmark: (articleId) =>
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== articleId),
    })),
  toggleBookmark: (article) => {
    const isBookmarked = get().bookmarks.some((b) => b.id === article.id);
    if (isBookmarked) {
      get().removeBookmark(article.id);
    } else {
      get().addBookmark(article);
    }
  },
  isBookmarked: (articleId) => get().bookmarks.some((b) => b.id === articleId),
}));
