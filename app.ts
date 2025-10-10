import "reflect-metadata";
import Database from "@/config/Database";
import Server from "@/config/Server";
import ScheduleRegister from "@/schedules";
import QueueRegister from "@/queues";

(async () => {
  try {
    await Database.connect();
    Server.start();
    await ScheduleRegister.start();
    await QueueRegister.start();

    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
  } catch (error) {
    console.error("Error during application startup:", error);
  }
})();
