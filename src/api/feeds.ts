import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { NewsArticle } from '../types/news';
import { OfflineStorage } from '../hooks/useOfflineCache';
import { getLiveNews, FetchNewsParams } from '../services/newsService';
import { useUserPreferences } from '../store/userPreferences';

export const FEED_QUERY_KEYS = {
  home: ['feeds', 'home'] as const,
  category: (cat: string) => ['feeds', 'category', cat] as const,
  article: (id: string) => ['articles', id] as const,
  related: (id: string) => ['articles', id, 'related'] as const,
};

/**
 * Maps Fastify API Article format (MongoDB schema Section 6.1) to Mobile NewsArticle model
 */
export function mapBackendArticleToNewsArticle(raw: any): NewsArticle {
  return {
    id: raw._id || raw.id || `art-${Date.now()}`,
    title: raw.title,
    summary:
      raw.summaryBullets?.[0] ||
      raw.summary ||
      (raw.content ? raw.content.substring(0, 140) + '...' : ''),
    content: raw.content || '',
    category: raw.category || 'General',
    categoryId: raw.category ? raw.category.toLowerCase() : 'all',
    imageUrl:
      raw.coverImage?.url ||
      raw.imageUrl ||
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    author: raw.author || 'Swaraj Digital Desk',
    publishedAt: raw.publishedAt ? new Date(raw.publishedAt).toLocaleDateString() : 'Recently',
    readingTimeMinutes: Math.max(2, Math.ceil((raw.content?.length || 500) / 700)),
    isBreaking: Boolean(raw.isBreaking),
    isFeatured: Boolean(raw.views > 20000),
    isTrending: Boolean(raw.views > 15000),
    viewsCount: raw.views || 0,
    source: 'Swaraj Digital',
    tags: raw.tags || ['National', 'News'],
  };
}

/**
 * High-Concurrency Home Feed Hook with Read-Through Redis Edge Cache + Top 30 Offline Disk Sync
 * Section 10.1: Cap hydration to the top/latest 30 articles
 * Complies with SLA <= 30ms API Edge Cache & TC-MOB-03 Offline Recovery
 */
export function useHomeFeedQuery(params?: FetchNewsParams) {
  const isOffline = useUserPreferences((s) => s.isOffline);
  const language = useUserPreferences((s) => s.language);

  return useQuery({
    queryKey: [...FEED_QUERY_KEYS.home, language, params?.category, params?.locationQuery],
    queryFn: async (): Promise<NewsArticle[]> => {
      // 1. If user explicitly toggled offline or network is dead, read disk cache immediately
      if (isOffline) {
        const cached = await OfflineStorage.getFeed('home');
        if (cached && cached.length > 0) return cached.slice(0, 30);
      }

      // 2. Attempt Fastify backend with Redis edge cache (<10ms target)
      try {
        const response = await apiClient.get('/feeds/home');
        // Handle Section 7.3 response envelope: { data: [...], meta: {...} }
        const rawList = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        if (Array.isArray(rawList) && rawList.length > 0) {
          const mapped = rawList.map(mapBackendArticleToNewsArticle).slice(0, 30);
          // Persist top 30 to offline disk storage (Section 10.1)
          await OfflineStorage.setFeed('home', mapped);
          return mapped;
        }
      } catch (backendError) {
        // Fastify backend might be running locally or in development - cascade to live news service
      }

      // 3. Resilient Fallback: NewsData / GNews / NewsAPI live feeds
      try {
        const liveArticles = await getLiveNews({
          category: params?.category || 'all',
          locationQuery: params?.locationQuery,
          searchQuery: params?.searchQuery,
          language: language,
        });

        if (liveArticles && liveArticles.length > 0) {
          const top30 = liveArticles.slice(0, 30);
          await OfflineStorage.setFeed('home', top30);
          return top30;
        }
      } catch (liveError) {
        console.warn('Live API fallback also failed:', liveError);
      }

      // 4. Final offline fallback from disk
      const offlineFallback = await OfflineStorage.getFeed('home');
      return (offlineFallback || []).slice(0, 30);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes (300 seconds TTL matching Redis feed:home:v1)
    gcTime: 1000 * 60 * 60 * 24, // 24 hours retention
  });
}

/**
 * Category-specific Feed Hook (Section 7.1)
 */
export function useCategoryFeedQuery(category: string) {
  return useQuery({
    queryKey: FEED_QUERY_KEYS.category(category),
    queryFn: async (): Promise<NewsArticle[]> => {
      try {
        const response = await apiClient.get(`/feeds/category/${encodeURIComponent(category)}`);
        const rawList = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        if (Array.isArray(rawList) && rawList.length > 0) {
          return rawList.map(mapBackendArticleToNewsArticle).slice(0, 30);
        }
      } catch {
        // Fallback to live service
      }
      const live = await getLiveNews({ category });
      return live.slice(0, 30);
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Article detail hook with offline disk storage (Section 7.1)
 */
export function useArticleDetailQuery(articleId: string, initialData?: NewsArticle) {
  return useQuery({
    queryKey: FEED_QUERY_KEYS.article(articleId),
    queryFn: async (): Promise<NewsArticle> => {
      try {
        const response = await apiClient.get(`/articles/${articleId}`);
        const articleData = response.data?.data || response.data;
        if (articleData) {
          const mapped = mapBackendArticleToNewsArticle(articleData);
          await OfflineStorage.setArticle(mapped);
          return mapped;
        }
      } catch {
        // Try reading cached article from disk
        const cached = await OfflineStorage.getArticle(articleId);
        if (cached) return cached;
      }

      if (initialData) return initialData;
      throw new Error(`Article ${articleId} not found`);
    },
    initialData: initialData,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Related Articles Query Hook (Section 7.1)
 */
export function useRelatedArticlesQuery(articleId: string) {
  return useQuery({
    queryKey: FEED_QUERY_KEYS.related(articleId),
    queryFn: async (): Promise<NewsArticle[]> => {
      try {
        const response = await apiClient.get(`/articles/${articleId}/related`);
        const rawList = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
        if (Array.isArray(rawList) && rawList.length > 0) {
          return rawList.map(mapBackendArticleToNewsArticle);
        }
      } catch {
        // ignore
      }
      return [];
    },
    staleTime: 1000 * 60 * 10,
  });
}
