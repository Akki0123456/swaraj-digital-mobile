import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { enqueuePushNotification } from '../queues/pushQueue';

const DispatchAlertSchema = z.object({
  articleId: z.string(),
  title: z.string().min(3),
  summaryBullet: z.string().optional(),
  category: z.string().default('Breaking'),
  imageUrl: z.string().url().default('https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80'),
  isBreaking: z.boolean().default(true),
  slug: z.string().optional(),
});

export const NotificationController = {
  /**
   * Emergency breaking notification trigger endpoint
   * POST /api/v1/notifications/dispatch
   */
  async dispatchBreakingAlert(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = DispatchAlertSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    const payload = parseResult.data;
    const job = await enqueuePushNotification({
      articleId: payload.articleId,
      slug: payload.slug || `alert-${payload.articleId}`,
      title: payload.title,
      summaryBullet: payload.summaryBullet,
      category: payload.category,
      imageUrl: payload.imageUrl,
      isBreaking: payload.isBreaking,
    });

    return reply.status(202).send({
      message: 'Breaking notification dispatched to queue',
      jobId: job.id,
      topic: 'all_news',
    });
  },
};
