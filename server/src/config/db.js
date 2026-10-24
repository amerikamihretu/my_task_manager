import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not defined. Check server/.env.");

  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(uri);
    console.log(
      `[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`,
    );
  } catch (error) {
    console.error("[db] MongoDB connection failed:", error.message);
    throw error;
  }

  mongoose.connection.on("error", (err) =>
    console.error("[db] runtime error:", err.message),
  );
  mongoose.connection.on("disconnected", () =>
    console.warn("[db] disconnected"),
  );
}
