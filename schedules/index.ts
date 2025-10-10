import { Kernel } from './Kernel';
import { Logger } from '@/config/Logger';
import { Scheduler } from './Kernel';
import c from "config";
import {CoffeeBreakReminder} from "@/jobs/CoffeeBreakReminder";

class ScheduleRegister {
  private kernel = new Kernel();
  private logger = new Logger();

  private schedulers: Scheduler[] = [CoffeeBreakReminder];
  private readonly isEnabled: boolean;

  constructor() {
    this.isEnabled = c.get('app.scheduler');
  }

  private loadSchedulers(): void {
    this.logger.info('⚙️ Loading schedulers...');
    this.schedulers.forEach((scheduler) => {
      this.kernel.addScheduler(scheduler);
      this.logger.info(`📦 Scheduler registered: ${scheduler.name}`);
    });
  }

  public async start(): Promise<void> {
    if (!this.isEnabled) {
      this.logger.info('⚙️ Scheduler disabled by configuration — skipping registration.');
      return;
    }
    this.logger.info('🚀 ScheduleApp starting...');
    this.loadSchedulers();
    await this.kernel.register();
    await this.kernel.boot();
    this.logger.info('✅ ScheduleApp initialized successfully');
  }

  public async shutdown(): Promise<void> {
    await this.kernel.shutdown();
  }
}
export default new ScheduleRegister();
