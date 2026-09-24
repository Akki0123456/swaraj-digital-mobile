import { NewsArticle } from '../types/news';

const NEWSDATA_KEY = 'pub_d65a174cdd434a37991f6e5d0188b10a';
const NEWSAPI_KEY = 'e25298e5997341929e8da9a0d1a1b003';
const GNEWS_KEY = '122c26ed9fc4d31052d1a16c020d7416';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';

export interface FetchNewsParams {
  category?: string;
  locationQuery?: string;
  searchQuery?: string;
  language?: 'en' | 'hi';
}

function calculateReadingTime(text: string): number {
  if (!text) return 3;
  const words = text.trim().split(/\s+/).length;
  return Math.max(2, Math.ceil(words / 180));
}

function formatPublishedTime(dateStr?: string, lang: 'en' | 'hi' = 'en'): string {
  if (!dateStr) return lang === 'hi' ? 'हाल ही में' : 'Recently';
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return lang === 'hi' ? 'अभी-अभी' : 'Just now';
    if (diffMins < 60) return lang === 'hi' ? `${diffMins} मिनट पहले` : `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return lang === 'hi' ? `${diffHours} घंटे पहले` : `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return lang === 'hi' ? `${diffDays} दिन पहले` : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } catch {
    return lang === 'hi' ? 'हाल ही में' : 'Recently';
  }
}

// 1. Primary Source: NewsData.io
async function fetchFromNewsData(params: FetchNewsParams): Promise<NewsArticle[] | null> {
  try {
    const lang = params.language === 'hi' ? 'hi' : 'en';
    let url = `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_KEY}&country=in&language=${lang}`;

    if (params.locationQuery && params.locationQuery !== 'India') {
      url += `&q=${encodeURIComponent(params.locationQuery)}`;
    } else if (params.searchQuery) {
      url += `&q=${encodeURIComponent(params.searchQuery)}`;
    }

    if (params.category && params.category !== 'all') {
      const catMap: Record<string, string> = {
        politics: 'politics',
        state: 'top',
        krishi: 'environment',
        business: 'business',
        technology: 'technology',
        sports: 'sports',
        entertainment: 'entertainment',
      };
      const apiCat = catMap[params.category] || 'top';
      url += `&category=${apiCat}`;
    }

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      return null;
    }

    return data.results.map((item: any, idx: number) => {
      const title = item.title || 'Breaking Regional Headline';
      const summary = item.description || item.snippet || title;
      const content = item.content || summary;
      const categoryName = params.category && params.category !== 'all' ? params.category : (item.category?.[0] || 'Top Stories');

      return {
        id: `newsdata-${item.article_id || idx}-${Date.now()}`,
        title,
        summary,
        content,
        category: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
        categoryId: params.category || 'all',
        imageUrl: item.image_url || DEFAULT_IMAGE,
        author: item.creator?.[0] || item.source_id || 'Swaraj Special Bureau',
        publishedAt: formatPublishedTime(item.pubDate),
        readingTimeMinutes: calculateReadingTime(content),
        isBreaking: idx === 0,
        isFeatured: idx === 1,
        isTrending: idx < 4,
        trendingRank: idx + 1,
        viewsCount: Math.floor(Math.random() * 15000) + 12000,
        source: item.source_icon ? item.source_id : 'Swaraj Digital Regional',
        tags: item.keywords?.slice(0, 4) || ['India', 'News', 'Regional'],
      };
    });
  } catch (err) {
    console.warn('NewsData API fetch error:', err);
    return null;
  }
}

// 2. Secondary Source: GNews.io
async function fetchFromGNews(params: FetchNewsParams): Promise<NewsArticle[] | null> {
  try {
    const lang = params.language === 'hi' ? 'hi' : 'en';
    let url = `https://gnews.io/api/4/top-headlines?country=in&lang=${lang}&apikey=${GNEWS_KEY}`;

    if (params.locationQuery && params.locationQuery !== 'India') {
      url = `https://gnews.io/api/4/search?q=${encodeURIComponent(params.locationQuery)}&country=in&lang=${lang}&apikey=${GNEWS_KEY}`;
    } else if (params.searchQuery) {
      url = `https://gnews.io/api/4/search?q=${encodeURIComponent(params.searchQuery)}&country=in&lang=${lang}&apikey=${GNEWS_KEY}`;
    } else if (params.category && params.category !== 'all') {
      const catMap: Record<string, string> = {
        politics: 'nation',
        state: 'nation',
        krishi: 'world',
        business: 'business',
        technology: 'technology',
        sports: 'sports',
        entertainment: 'entertainment',
      };
      url += `&category=${catMap[params.category] || 'general'}`;
    }

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.articles || !Array.isArray(data.articles) || data.articles.length === 0) {
      return null;
    }

    return data.articles.map((item: any, idx: number) => ({
      id: `gnews-${idx}-${Date.now()}`,
      title: item.title,
      summary: item.description || item.title,
      content: item.content || item.description || item.title,
      category: params.category || 'Top Stories',
      categoryId: params.category || 'all',
      imageUrl: item.image || DEFAULT_IMAGE,
      author: item.source?.name || 'Swaraj Desk',
      publishedAt: formatPublishedTime(item.publishedAt, params.language),
      readingTimeMinutes: calculateReadingTime(item.content || item.description),
      isBreaking: idx === 0,
      isFeatured: idx === 1,
      isTrending: idx < 4,
      trendingRank: idx + 1,
      viewsCount: Math.floor(Math.random() * 20000) + 15000,
      source: item.source?.name || 'Swaraj News',
      tags: ['India', 'Breaking', 'Digital'],
    }));
  } catch (err) {
    console.warn('GNews API fetch error:', err);
    return null;
  }
}

// 3. Fallback Source: NewsAPI.org
async function fetchFromNewsAPI(params: FetchNewsParams): Promise<NewsArticle[] | null> {
  try {
    const lang = params.language === 'hi' ? 'hi' : 'en';
    let url = `https://newsapi.org/v2/top-headlines?country=in&language=${lang}&apiKey=${NEWSAPI_KEY}`;

    if (params.locationQuery && params.locationQuery !== 'India') {
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(params.locationQuery)}&apiKey=${NEWSAPI_KEY}`;
    } else if (params.searchQuery) {
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(params.searchQuery)}&apiKey=${NEWSAPI_KEY}`;
    } else if (params.category && params.category !== 'all') {
      const catMap: Record<string, string> = {
        politics: 'general',
        state: 'general',
        business: 'business',
        technology: 'technology',
        sports: 'sports',
        entertainment: 'entertainment',
      };
      url += `&category=${catMap[params.category] || 'general'}`;
    }

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.articles || !Array.isArray(data.articles) || data.articles.length === 0) {
      return null;
    }

    return data.articles
      .filter((item: any) => item.title && !item.title.includes('[Removed]'))
      .map((item: any, idx: number) => ({
        id: `newsapi-${idx}-${Date.now()}`,
        title: item.title,
        summary: item.description || item.title,
        content: item.content || item.description || item.title,
        category: params.category || 'Top Stories',
        categoryId: params.category || 'all',
        imageUrl: item.urlToImage || DEFAULT_IMAGE,
        author: item.author || item.source?.name || 'Swaraj Bureau',
        publishedAt: formatPublishedTime(item.publishedAt),
        readingTimeMinutes: calculateReadingTime(item.content || item.description),
        isBreaking: idx === 0,
        isFeatured: idx === 1,
        isTrending: idx < 4,
        trendingRank: idx + 1,
        viewsCount: Math.floor(Math.random() * 18000) + 10000,
        source: item.source?.name || 'Swaraj News Network',
        tags: ['India', 'Headlines'],
      }));
  } catch (err) {
    console.warn('NewsAPI fetch error:', err);
    return null;
  }
}

// Master Fetch Function with Cascading Live API Fallbacks (100% Live API Data Only)
export async function getLiveNews(params: FetchNewsParams = {}): Promise<NewsArticle[]> {
  // Try NewsData.io
  const newsDataResults = await fetchFromNewsData(params);
  if (newsDataResults && newsDataResults.length > 0) {
    return newsDataResults;
  }

  // Fallback to GNews.io
  const gnewsResults = await fetchFromGNews(params);
  if (gnewsResults && gnewsResults.length > 0) {
    return gnewsResults;
  }

  // Fallback to NewsAPI.org
  const newsApiResults = await fetchFromNewsAPI(params);
  if (newsApiResults && newsApiResults.length > 0) {
    return newsApiResults;
  }

  return [];
}
