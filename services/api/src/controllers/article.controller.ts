import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Article, IArticle } from '../models/Article';
import { redis, CACHE_KEYS, CACHE_TTL_SECONDS, evictArticleFeeds } from '../config/redis';
import { enqueuePushNotification } from '../queues/pushQueue';
import { enqueueAiSummary } from '../queues/aiSummaryQueue';

const CreateArticleSchema = z.object({
  title: z.string().min(5),
  slug: z.string().optional(),
  summaryBullets: z.array(z.string()).optional(),
  content: z.string().min(20),
  category: z.string(),
  coverImage: z.object({
    url: z.string().url(),
    blurhash: z.string().optional(),
    caption: z.string().optional(),
  }),
  mediaType: z.enum(['standard', 'video', 'shorts']).default('standard'),
  videoUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  isBreaking: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

// Compact Feed Card Projection (Section 7.3: Excludes full body content for feed speed)
const COMPACT_FEED_PROJECTION = {
  title: 1,
  slug: 1,
  summaryBullets: 1,
  category: 1,
  coverImage: 1,
  mediaType: 1,
  videoUrl: 1,
  isBreaking: 1,
  views: 1,
  publishedAt: 1,
  tags: 1,
  createdAt: 1,
};

export const ArticleController = {
  /**
   * Ingestion Pipeline (Section 8)
   * POST /api/v1/articles
   * 1. Validate with Zod
   * 2. Save to MongoDB
   * 3. Evict Redis cache (Deterministic Invalidation)
   * 4. Enqueue BullMQ Push task -> topic: all_news
   */
  async createArticle(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = CreateArticleSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Malformed article payload. Required fields missing or invalid.',
          details: parseResult.error.format(),
        },
      });
    }

    const payload = parseResult.data;
    const slug =
      payload.slug ||
      payload.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') + `-${Date.now()}`;

    const newArticle = new Article({
      ...payload,
      slug,
      publishedAt: new Date(),
    });

    // 1. Save to MongoDB
    await newArticle.save();

    // 2. Deterministic Cache Eviction (Section 5.2 & 8.1)
    await evictArticleFeeds(newArticle.category);

    // 3. Enqueue BullMQ Notification task (Section 8.1, topic: all_news)
    await enqueuePushNotification(newArticle);

    // 4. Enqueue AI Summary if bullets were omitted (Section 11.1)
    if (!newArticle.summaryBullets || newArticle.summaryBullets.length === 0) {
      await enqueueAiSummary({
        articleId: newArticle._id.toString(),
        content: newArticle.content,
        title: newArticle.title,
      });
    }

    return reply.status(201).send({
      data: newArticle,
      meta: { id: newArticle._id.toString(), slug: newArticle.slug },
    });
  },

  /**
   * Read-Through High-Concurrency Feed Retrieval (Section 5.2, 7.1 & TC-API-01)
   * GET /api/v1/feeds/home
   * Checks Redis 'feed:home:v1'. Hit returns in <10ms. Miss queries MongoDB & hydrates with TTL 300s.
   * Response envelope: Section 7.3
   */
  async getHomeFeed(request: FastifyRequest, reply: FastifyReply) {
    const startTime = Date.now();

    try {
      // 1. Redis Cache Lookup (<10ms edge latency target)
      const cached = await redis.get(CACHE_KEYS.HOME_FEED);
      if (cached) {
        const latency = Date.now() - startTime;
        reply.header('X-Cache-Hit', 'HIT');
        reply.header('X-Response-Time-Ms', latency);
        return reply.status(200).send(JSON.parse(cached));
      }
    } catch {
      // Cache layer bypassed gracefully on connection blip
    }

    // 2. Query MongoDB with Compound Index ({ publishedAt: -1, isBreaking: 1 })
    // Compact projection applied
    const articles = await Article.find({}, COMPACT_FEED_PROJECTION)
      .sort({ publishedAt: -1, isBreaking: -1 })
      .limit(30)
      .lean();

    const responseEnvelope = {
      data: articles,
      meta: {
        cursor: articles.length > 0 ? (articles[articles.length - 1] as any).publishedAt : null,
        hasNextPage: articles.length === 30,
        total: articles.length,
      },
    };

    // 3. Hydrate Redis Cache with 300 seconds TTL (Section 5.2)
    try {
      if (articles.length > 0) {
        await redis.set(
          CACHE_KEYS.HOME_FEED,
          JSON.stringify(responseEnvelope),
          'EX',
          CACHE_TTL_SECONDS
        );
      }
    } catch {
      // ignore
    }

    const latency = Date.now() - startTime;
    reply.header('X-Cache-Hit', 'MISS');
    reply.header('X-Response-Time-Ms', latency);
    return reply.status(200).send(responseEnvelope);
  },

  /**
   * Category Feed with Redis Caching (Section 7.1)
   * GET /api/v1/feeds/category/:category
   */
  async getCategoryFeed(
    request: FastifyRequest<{ Params: { category: string } }>,
    reply: FastifyReply
  ) {
    const { category } = request.params;
    const cacheKey = CACHE_KEYS.CATEGORY_FEED(category);

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        reply.header('X-Cache-Hit', 'HIT');
        return reply.status(200).send(JSON.parse(cached));
      }
    } catch {
      // ignore
    }

    // Query MongoDB using category index ({ category: 1, publishedAt: -1 })
    const articles = await Article.find(
      { category: new RegExp(`^${category}$`, 'i') },
      COMPACT_FEED_PROJECTION
    )
      .sort({ publishedAt: -1 })
      .limit(30)
      .lean();

    const responseEnvelope = {
      data: articles,
      meta: {
        category,
        cursor: articles.length > 0 ? (articles[articles.length - 1] as any).publishedAt : null,
        hasNextPage: articles.length === 30,
        total: articles.length,
      },
    };

    try {
      if (articles.length > 0) {
        await redis.set(cacheKey, JSON.stringify(responseEnvelope), 'EX', CACHE_TTL_SECONDS);
      }
    } catch {
      // ignore
    }

    reply.header('X-Cache-Hit', 'MISS');
    return reply.status(200).send(responseEnvelope);
  },

  /**
   * Full Article Detail (Section 7.1)
   * GET /api/v1/articles/:idOrSlug
   */
  async getArticleById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

    let article: IArticle | null = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      article = await Article.findById(id);
    } else {
      article = await Article.findOne({ slug: id });
    }

    if (!article) {
      return reply.status(404).send({
        error: {
          code: 'ARTICLE_NOT_FOUND',
          message: `Article '${id}' not found.`,
        },
      });
    }

    // Increment views asynchronously
    Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } }).catch(() => {});

    return reply.status(200).send({
      data: article,
    });
  },

  /**
   * Related Articles (Section 7.1)
   * GET /api/v1/articles/:id/related
   */
  async getRelatedArticles(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

    let query: any = {};
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      const base = await Article.findById(id).lean();
      if (base) {
        query = { _id: { $ne: base._id }, category: base.category };
      }
    }

    const related = await Article.find(query, COMPACT_FEED_PROJECTION)
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean();

    return reply.status(200).send({
      data: related,
      meta: { total: related.length },
    });
  },
};
