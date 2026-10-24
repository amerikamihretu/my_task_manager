import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import { startTestDB, stopTestDB, clearTestDB } from "./setup.js";

before(startTestDB);
after(stopTestDB);
beforeEach(clearTestDB);

test("register creates a user and sets an HttpOnly cookie", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Alice",
      email: "Alice@Example.com",
      password: "password123",
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.email, "alice@example.com");
  assert.equal(res.body.data.user.password, undefined);

  const cookie = res.headers["set-cookie"]?.find((c) => c.startsWith("token="));
  assert.ok(cookie, "token cookie should be set");
  assert.match(cookie, /HttpOnly/i);
});

test("register rejects duplicate email with 409", async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
    });

  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Bob", email: "alice@example.com", password: "password456" });

  assert.equal(res.status, 409);
  assert.equal(res.body.success, false);
});

test("login succeeds with correct credentials", async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
    });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "alice@example.com", password: "password123" });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.email, "alice@example.com");
});

test("login fails with wrong password and returns 401", async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
    });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "alice@example.com", password: "wrongpass" });

  assert.equal(res.status, 401);
});

test("GET /api/auth/me without cookie returns 401", async () => {
  const res = await request(app).get("/api/auth/me");
  assert.equal(res.status, 401);
});

test("GET /api/auth/me with the cookie returns the user", async () => {
  const register = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
    });

  const cookie = register.headers["set-cookie"].find((c) =>
    c.startsWith("token="),
  );

  const res = await request(app).get("/api/auth/me").set("Cookie", cookie);

  assert.equal(res.status, 200);
  assert.equal(res.body.data.user.email, "alice@example.com");
  assert.equal(res.body.data.user.password, undefined);
});

test("user can upload and remove an avatar", async () => {
  const register = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
    });

  const cookie = register.headers["set-cookie"].find((c) =>
    c.startsWith("token="),
  );
  const upload = await request(app)
    .patch("/api/auth/profile")
    .set("Cookie", cookie)
    .field("name", "Alice")
    .attach("avatar", Buffer.from("test-image"), {
      filename: "avatar.png",
      contentType: "image/png",
    });

  assert.equal(upload.status, 200);
  assert.match(
    upload.body.data.user.avatar,
    /^https:\/\/res\.cloudinary\.com\/test\//,
  );

  const remove = await request(app)
    .delete("/api/auth/profile/avatar")
    .set("Cookie", cookie);

  assert.equal(remove.status, 200);
  assert.equal(remove.body.data.user.avatar, null);
});
