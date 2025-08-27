import { User } from "@/entities/User";
import { UserRole } from "@/constants/UserRole";
import Database from "@/config/Database";
import argon2 from "argon2";

const seedDatabase = async () => {
  try {
    await Database.connect();
    console.log("Database connected successfully.");

    const userRepo = Database.dataSource.getRepository(User);

    const users: User[] = await Promise.all(
      Object.values(UserRole).map(async (role, index) =>
        userRepo.create({
          name: `User ${role}`,
          email: `${role.toLowerCase()}@example.com`,
          phone: `+12345678${index}`,
          password: await argon2.hash("password123"),
          attributes: { description: `User with role: ${role}` },
          role,
        }),
      ),
    );

    await userRepo.save(users);
    console.log("Users seeded successfully.");

    console.log("Database seeding completed with all roles!");
  } catch (error) {
    console.error("Error seeding the database:", error);
  } finally {
    console.log("Database connection closed.");
    process.exit(0);
  }
};

seedDatabase();
