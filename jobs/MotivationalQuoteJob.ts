import { JobDefinition } from '@/queues/Kernel';

export const MotivationalQuoteJob: JobDefinition = {
  name: 'MotivationalQuoteJob',

  handle: async (data: { user: string }) => {
    const quotes = [
      "🚀 Keep pushing code like it's production-ready (but test it first pls).",
      "☕ Coffee first, deploy later.",
      "🔥 If it works on your machine, it’s still your machine’s fault.",
      "🐛 Fix one bug, get two free!",
      "💡 Remember: logs are love, logs are life.",
      "😎 Ship fast, break nothing (hopefully).",
    ];

    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    console.log(`💬 Hey ${data.user}, your motivational quote of the moment:`);
    await new Promise((r) => setTimeout(r, 1200));
    console.log(`✨ ${quote}`);
  },
};
