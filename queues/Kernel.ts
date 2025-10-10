import { Worker, Queue, Job } from "bullmq";
import config from "config";
import { Logger } from "@/config/Logger";
import { Redis } from "@/config/Redis";

export interface JobDefinition {
  name: string;
  handle: (data: any) => Promise<void> | void;
}

export class Kernel {
  private jobs: JobDefinition[] = [];
  private logger = new Logger();
  private worker: Worker | null = null;
  private queue = new Queue("jobs", { connection: new Redis().client });
  private isRegistered = false;
  private readonly isEnabled: boolean;

  constructor() {
    this.isEnabled = config.get("app.queue");
  }

  public addJob(job: JobDefinition): void {
    this.jobs.push(job);
  }

  public async register(): Promise<void> {
    if (!this.isEnabled) {
      this.logger.info(
        "⚙️ Queue disabled by configuration — skipping registration.",
      );
      return;
    }

    this.logger.info("📦 Registering jobs...");

    this.worker = new Worker(
      "jobs",
      async (job: Job) => {
        const found = this.jobs.find((j) => j.name === job.name);
        if (!found) {
          this.logger.error(`⚠️ Unknown job received: ${job.name}`);
          return;
        }

        const start = Date.now();
        try {
          await found.handle(job.data);
          this.logger.info(
            `✅ ${job.name} completed (${Date.now() - start}ms)`,
          );
        } catch (err: any) {
          this.logger.error(`❌ ${job.name} failed`, { error: err.message });
        }
      },
      {
        connection: new Redis().client,
        removeOnComplete: {
          age: 60 * 60,
          count: 1000,
        },
        removeOnFail: {
          age: 24 * 60 * 60,
        },
      },
    );

    this.worker.on("completed", (job) => {
      this.logger.info(`🎉 Job ${job.name} processed successfully`);
    });

    this.worker.on("failed", (job, err) => {
      this.logger.error(`💥 Job ${job?.name} failed`, { error: err.message });
    });

    this.isRegistered = true;
  }

  public async boot(): Promise<void> {
    if (!this.isEnabled) {
      this.logger.info("⚙️ Queue disabled by configuration — boot skipped.");
      return;
    }
    if (!this.isRegistered) {
      this.logger.error("⚠️ Kernel boot attempted before registration.");
      return;
    }

    this.logger.info("🚀 Queue worker booted successfully");
  }

  public async dispatch(jobName: string, data: any): Promise<void> {
    if (!this.isEnabled) {
      this.logger.info(
        "⚙️ Queue disabled by configuration — dispatch skipped.",
      );
      return;
    }

    await this.queue.add(jobName, data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: true,
    });

    this.logger.info(`🚀 Job dispatched: ${jobName}`);
  }

  public async shutdown(): Promise<void> {
    if (!this.isEnabled) return;
    this.logger.info("🛑 Shutting down queue...");
    await this.worker?.close();
    await this.queue.close();
    this.logger.info("🧹 Queue shutdown completed");
  }
}
