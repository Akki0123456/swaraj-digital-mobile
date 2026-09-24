import { Schema, model, Document, models } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  summaryBullets: string[];
  content: string;
  category: string;
  coverImage: {
    url: string;
    blurhash?: string;
    caption?: string;
  };
  mediaType: 'standard' | 'video' | 'shorts';
  videoUrl?: string;
  audioUrl?: string;
  isBreaking: boolean;
  views: number;
  publishedAt: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    summaryBullets: [{ type: String }],
    content: { type: String, required: true },
    category: { type: String, required: true, index: true },
    coverImage: {
      url: { type: String, required: true },
      blurhash: { type: String },
      caption: { type: String },
    },
    mediaType: {
      type: String,
      enum: ['standard', 'video', 'shorts'],
      default: 'standard',
    },
    videoUrl: { type: String },
    audioUrl: { type: String },
    isBreaking: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date, default: Date.now, index: true },
    tags: [{ type: String, index: true }],
  },
  { timestamps: true }
);

// High-Concurrency Feed Retrieval Indexes (Section 4.1)
ArticleSchema.index({ publishedAt: -1, isBreaking: 1 });
ArticleSchema.index({ category: 1, publishedAt: -1 });

export const Article = (models.Article as any) || model<IArticle>('Article', ArticleSchema);
