import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Configure the test environment BEFORE any module reads these variables.
// These run at module load time, which is before any test body executes.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-at-least-32-characters-long";
process.env.JWT_EXPIRES_IN = "7d";
process.env.SESSION_COOKIE_MAX_AGE_MS = "604800000";
process.env.CLIENT_ORIGIN = "http://localhost:5173";

let mongod;

export async function startTestDB() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri("mytask_test");
  await mongoose.connect(uri);
}

export async function stopTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}
