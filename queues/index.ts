import { Kernel, JobDefinition } from './Kernel';
import { Logger } from '@/config/Logger';
import {MotivationalQuoteJob} from "@/jobs/MotivationalQuoteJob";
import c from "config";
import config from "config";

class QueueRegister {
  private kernel = new Kernel();
  private logger = new Logger();
  private readonly isEnabled: boolean;

  constructor() {
    this.isEnabled = config.get('app.queue');
  }

  private jobs: JobDefinition[] = [
    MotivationalQuoteJob
  ];

  private loadJobs(): void {
    this.logger.info('⚙️ Loading jobs...');
    this.jobs.forEach((job) => {
      this.kernel.addJob(job);
      this.logger.info(`📦 Job registered: ${job.name}`);
    });
  }

  public async start(): Promise<void> {
    if (!this.isEnabled) {
      this.logger.info('⚙️ Queue disabled by configuration — skipping registration.');
      return;
    }

    await this.dispatch('MotivationalQuoteJob', { user: 'Uğur' });

    this.logger.info('🚀 QueueApp starting...');
    this.loadJobs();
    await this.kernel.register();
    await this.kernel.boot();
    this.logger.info('✅ QueueApp initialized successfully');
  }

  public async dispatch(jobName: string, data: any): Promise<void> {
    await this.kernel.dispatch(jobName, data);
  }

  public async shutdown(): Promise<void> {
    await this.kernel.shutdown();
  }
}

export default new QueueRegister();

// await QueueRegister.dispatch('SendEmailJob', {
//   email: 'user@example.com',
//   subject: 'Welcome to the system 🚀',
// });