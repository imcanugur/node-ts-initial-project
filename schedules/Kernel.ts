import cron, { ScheduledTask } from 'node-cron';
import { Logger } from '@/config/Logger';
import c from "config";

export interface Scheduler {
  name: string;
  cron: string;
  handle: () => Promise<void> | void;
}

export class Kernel {
  private schedulers: Scheduler[] = [];
  private logger = new Logger();
  private tasks: ScheduledTask[] = [];
  private isRegistered = false;


  public addScheduler(scheduler: Scheduler): void {
    this.schedulers.push(scheduler);
  }

  public async register(): Promise<void> {
    this.logger.info('🕒 Registering schedules...');
    for (const scheduler of this.schedulers) {
      if (scheduler?.cron && typeof scheduler.handle === 'function') {
        const task = cron.schedule(scheduler.cron, async () => {
          const start = Date.now();
          try {
            await scheduler.handle();
            this.logger.info(
              `✅ ${scheduler.name} executed successfully (${Date.now() - start}ms)`,
            );
          } catch (err: any) {
            this.logger.error(`❌ ${scheduler.name} failed`, {
              error: err.message,
            });
          }
        });

        this.tasks.push(task);
        this.logger.info(`📅 Scheduled: ${scheduler.name} (${scheduler.cron})`);
      } else {
        this.logger.error(`⚠️ Invalid scheduler skipped`, { scheduler });
      }
    }

    this.isRegistered = true;
  }

  public async boot(): Promise<void> {
    if (!this.isRegistered) {
      this.logger.error('⚠️ Kernel boot attempted before registration.');
      return;
    }
    this.tasks.forEach((task) => task.start());
    this.logger.info('✅ All schedulers booted successfully');
  }

  public async shutdown(): Promise<void> {
    this.logger.info('🛑 Shutting down all schedulers...');
    this.tasks.forEach((task) => task.stop());
    this.logger.info('🧹 Kernel shutdown completed');
  }
}
