import { FastifyInstance } from 'fastify';
import { ArticleController } from '../../controllers/article.controller';

export async function feedRoutes(fastify: FastifyInstance) {
  // Public high-concurrency cached feed endpoint (Section 4.2 & TC-API-01)
  fastify.get('/feeds/home', ArticleController.getHomeFeed);

  // Category specific cached feed endpoint
  fastify.get('/feeds/category/:category', ArticleController.getCategoryFeed);
}
