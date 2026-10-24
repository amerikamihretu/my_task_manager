import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import { startTestDB, stopTestDB, clearTestDB } from "./setup.js";

before(startTestDB);
after(stopTestDB);
beforeEach(clearTestDB);

async function registerUser(name, email) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name, email, password: "password123" });

  assert.equal(res.status, 201, `register failed for ${email}`);
  return res.headers["set-cookie"].find((c) => c.startsWith("token="));
}

test("task endpoints require authentication", async () => {
  const res = await request(app).get("/api/tasks");
  assert.equal(res.status, 401);
});

test("user can create and list their own tasks", async () => {
  const cookie = await registerUser("Alice", "alice@example.com");

  const create = await request(app)
    .post("/api/tasks")
    .set("Cookie", cookie)
    .send({ title: "Buy milk", priority: "high" });

  assert.equal(create.status, 201);
  assert.equal(create.body.data.task.title, "Buy milk");

  const list = await request(app).get("/api/tasks").set("Cookie", cookie);

  assert.equal(list.status, 200);
  assert.equal(list.body.data.tasks.length, 1);
});

test("a user cannot see another user's task", async () => {
  const alice = await registerUser("Alice", "alice@example.com");
  const bob = await registerUser("Bob", "bob@example.com");

  const create = await request(app)
    .post("/api/tasks")
    .set("Cookie", alice)
    .send({ title: "Alice private task" });

  const taskId = create.body.data.task.id;

  const forbidden = await request(app)
    .get(`/api/tasks/${taskId}`)
    .set("Cookie", bob);

  assert.equal(forbidden.status, 404);
});

test("a user cannot update or delete another user's task", async () => {
  const alice = await registerUser("Alice", "alice@example.com");
  const bob = await registerUser("Bob", "bob@example.com");

  const create = await request(app)
    .post("/api/tasks")
    .set("Cookie", alice)
    .send({ title: "Private" });

  const taskId = create.body.data.task.id;

  const update = await request(app)
    .put(`/api/tasks/${taskId}`)
    .set("Cookie", bob)
    .send({ title: "Hacked" });

  assert.equal(update.status, 404);

  const del = await request(app)
    .delete(`/api/tasks/${taskId}`)
    .set("Cookie", bob);

  assert.equal(del.status, 404);
});

test("user can update status and priority", async () => {
  const cookie = await registerUser("Alice", "alice@example.com");

  const create = await request(app)
    .post("/api/tasks")
    .set("Cookie", cookie)
    .send({ title: "Task" });

  const id = create.body.data.task.id;

  const res = await request(app)
    .put(`/api/tasks/${id}`)
    .set("Cookie", cookie)
    .send({ status: "completed", priority: "low" });

  assert.equal(res.status, 200);
  assert.equal(res.body.data.task.status, "completed");
  assert.equal(res.body.data.task.priority, "low");
});

test("user can delete their own task", async () => {
  const cookie = await registerUser("Alice", "alice@example.com");

  const create = await request(app)
    .post("/api/tasks")
    .set("Cookie", cookie)
    .send({ title: "Task" });

  const id = create.body.data.task.id;

  const del = await request(app)
    .delete(`/api/tasks/${id}`)
    .set("Cookie", cookie);
  assert.equal(del.status, 200);

  const list = await request(app).get("/api/tasks").set("Cookie", cookie);

  assert.equal(list.body.data.tasks.length, 0);
});

test("list endpoint respects status and priority filters", async () => {
  const cookie = await registerUser("Alice", "alice@example.com");

  await request(app)
    .post("/api/tasks")
    .set("Cookie", cookie)
    .send({ title: "A", status: "pending", priority: "high" });
  await request(app)
    .post("/api/tasks")
    .set("Cookie", cookie)
    .send({ title: "B", status: "completed", priority: "low" });
  await request(app)
    .post("/api/tasks")
    .set("Cookie", cookie)
    .send({ title: "C", status: "pending", priority: "low" });

  const filtered = await request(app)
    .get("/api/tasks?status=pending&priority=low")
    .set("Cookie", cookie);

  assert.equal(filtered.status, 200);
  assert.equal(filtered.body.data.tasks.length, 1);
  assert.equal(filtered.body.data.tasks[0].title, "C");
});
