import { FastifyInstance } from 'fastify';
import { ArticleController } from '../../controllers/article.controller';
import { NotificationController } from '../../controllers/notification.controller';

export async function articleRoutes(fastify: FastifyInstance) {
  // Ingestion endpoint (Section 5)
  fastify.post('/articles', ArticleController.createArticle);

  // Single article retrieval
  fastify.get('/articles/:id', ArticleController.getArticleById);

  // Related content endpoint (Section 7.1)
  fastify.get('/articles/:id/related', ArticleController.getRelatedArticles);

  // Direct notification trigger
  fastify.post('/notifications/dispatch', NotificationController.dispatchBreakingAlert);
}
