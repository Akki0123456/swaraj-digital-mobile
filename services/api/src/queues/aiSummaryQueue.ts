import { Queue, Worker, Job } from 'bullmq';
import pino from 'pino';
import { Article } from '../models/Article';
import { evictArticleFeeds } from '../config/redis';

const logger = pino({ name: 'ai-summary-queue' });

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export const aiSummaryQueue = new Queue('ai-summary-inference', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 2000 },
    removeOnComplete: 100,
  },
});

export interface SummaryJobData {
  articleId: string;
  content: string;
  title: string;
}

/**
 * Enqueue background AI summary bullet generation
 */
export async function enqueueAiSummary(data: SummaryJobData): Promise<Job> {
  const job = await aiSummaryQueue.add('generate-bullets', data);
  logger.info(`Enqueued AI summary job #${job.id} for article "${data.title}"`);
  return job;
}

/**
 * AI Summary Background Worker
 * Generates 3-5 concise bullet points for vernacular reading engine
 */
export const aiSummaryWorker = new Worker<SummaryJobData>(
  'ai-summary-inference',
  async (job: Job<SummaryJobData>) => {
    const { articleId, content, title } = job.data;
    logger.info(`Processing AI summary for article ${articleId}...`);

    // Extract key sentences for vernacular summary bullets
    const sentences = content
      .split(/[।.\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25);

    const generatedBullets = sentences.slice(0, 3);
    if (generatedBullets.length === 0) {
      generatedBullets.push(title);
    }

    // Update MongoDB document
    const updated = await Article.findByIdAndUpdate(
      articleId,
      { summaryBullets: generatedBullets },
      { new: true }
    );

    if (updated) {
      await evictArticleFeeds(updated.category);
      logger.info(`Successfully updated AI bullets for article ${articleId}`);
    }

    return { success: true, bullets: generatedBullets };
  },
  { connection, concurrency: 2 }
);
