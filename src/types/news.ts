export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  categoryId: string;
  imageUrl: string;
  author: string;
  authorAvatar?: string;
  publishedAt: string; // ISO or human readable
  readingTimeMinutes: number;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  trendingRank?: number;
  viewsCount: number;
  source: string;
  tags: string[];
}

export interface NewsCategory {
  id: string;
  name: string;
  marathiName: string;
  icon: string;
  description: string;
  color: string;
}

export interface VideoNewsItem {
  id: string;
  title: string;
  category: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  viewsCount: number;
  publishedAt: string;
  author: string;
}
