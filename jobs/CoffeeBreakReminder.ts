import { Scheduler } from "@/schedules/Kernel";

export const CoffeeBreakReminder: Scheduler = {
  name: "CoffeeBreakReminder",
  cron: "*/30 * * * * *",
  handle: async () => {
    const now = new Date().toLocaleTimeString();
    const quotes = [
      "☕ Coffee time! Backend be like: compiling happiness...",
      "💻 Reminder: write code, drink coffee, repeat.",
      "🔥 Coffee break detected — commit messages are now 2x more poetic.",
      "🚀 Taking a coffee break increases productivity by 42%. Science (me) says so.",
      "😎 No coffee, no deploy. Simple math.",
    ];

    const message = quotes[Math.floor(Math.random() * quotes.length)];

    console.log(`[${now}] ${message}`);
  },
};
