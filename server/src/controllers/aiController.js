import { z } from "zod";

const generatedTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).default(""),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.union([z.string(), z.null()]).default(null),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  subtasks: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(200),
        completed: z.boolean().default(false),
      }),
    )
    .max(20)
    .default([]),
});

const generatedPlanSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  tasks: z.array(generatedTaskSchema).max(20),
});

function normalizeDueDate(value) {
  if (value === null) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function extractJson(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Gemini returned an invalid task plan.");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

function buildPrompt(prompt, tasks) {
  const taskContext = tasks.length
    ? JSON.stringify(tasks)
    : "No existing tasks are available.";

  return `You are a task planning assistant inside a personal task manager.
Convert the user's request into a practical plan of 1 to 20 tasks.
Return ONLY valid JSON with this exact shape:
{"message":"brief explanation","tasks":[{"title":"...","description":"...","priority":"low|medium|high","dueDate":"ISO-8601 date or null","tags":["..."],"subtasks":[{"title":"...","completed":false}]}]}
Use null when no due date is known. Do not invent a precise date when the user did not provide enough information.
Keep titles actionable, descriptions concise, tags lowercase, and subtasks useful.
Today is ${new Date().toISOString().slice(0, 10)}.
Existing tasks (use them only for context and do not repeat them unnecessarily): ${taskContext}

User request: ${prompt}`;
}

const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);
const FALLBACK_STATUSES = new Set([404, ...RETRYABLE_STATUSES]);

function getRetrySettings() {
  const retries = Number.parseInt(process.env.GEMINI_MAX_RETRIES || "2", 10);
  const baseDelay = Number.parseInt(
    process.env.GEMINI_RETRY_BASE_DELAY_MS || "700",
    10,
  );

  return {
    retries: Number.isInteger(retries) && retries >= 0 ? retries : 2,
    baseDelay:
      Number.isInteger(baseDelay) && baseDelay >= 0 ? baseDelay : 700,
  };
}

async function requestPlan(model, request) {
  const { retries, baseDelay } = getRetrySettings();
  let response;
  let lastNetworkError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
      response = await fetch(endpoint, request);
      if (!RETRYABLE_STATUSES.has(response.status) || attempt === retries) {
        return response;
      }
    } catch (error) {
      lastNetworkError = error;
      if (attempt === retries) throw error;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, baseDelay * 2 ** attempt),
    );
  }

  throw lastNetworkError || new Error("Gemini request failed.");
}

function getProviderError(response, providerError) {
  let providerMessage = "";
  try {
    providerMessage = JSON.parse(providerError)?.error?.message || "";
  } catch {
    providerMessage = "";
  }

  const error = new Error(
    response.status === 400
      ? "Gemini rejected the request. Check GEMINI_MODEL and GEMINI_API_KEY in server/.env."
      : response.status === 429
        ? "The AI service quota or rate limit was reached. Please try again later."
        : response.status === 503
          ? "The AI service is busy right now. Please try again shortly."
          : providerMessage || `Gemini request failed (${response.status}).`,
  );
  error.statusCode =
    response.status === 429
      ? 429
      : response.status === 503
        ? 503
        : 502;
  return error;
}

export async function planTasks(req, res, next) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      const error = new Error(
        "AI planning is not configured. Add GEMINI_API_KEY to server/.env.",
      );
      error.statusCode = 503;
      throw error;
    }

    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const fallbackModel =
      process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash";
    const request = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(req.body.prompt, req.body.tasks) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    };

    const models = [model];
    if (fallbackModel && fallbackModel !== model) models.push(fallbackModel);

    let response;
    for (const candidateModel of models) {
      try {
        response = await requestPlan(candidateModel, request);
      } catch (error) {
        console.error(
          `[ai] Gemini request failed for ${candidateModel}:`,
          error,
        );
        if (candidateModel === models.at(-1)) {
          error.statusCode = 502;
          error.message = "The AI service could not be reached. Please try again.";
          throw error;
        }
        continue;
      }

      if (response.ok) break;

      const shouldTryFallback =
        candidateModel !== models.at(-1) &&
        FALLBACK_STATUSES.has(response.status);
      if (!shouldTryFallback) break;

      console.warn(
        `[ai] ${candidateModel} returned ${response.status}; trying ${fallbackModel}.`,
      );
    }

    if (!response.ok) {
      const providerError = await response.text();
      console.error(
        "[ai] Gemini request failed:",
        response.status,
        providerError,
      );
      throw getProviderError(response, providerError);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("");
    if (!text) {
      const error = new Error("The AI service returned an empty task plan.");
      error.statusCode = 502;
      throw error;
    }

    const plan = generatedPlanSchema.parse(extractJson(text));
    plan.tasks = plan.tasks.map((task) => ({
      ...task,
      dueDate: normalizeDueDate(task.dueDate),
    }));
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof z.ZodError) {
      error.statusCode = 502;
      error.message = "The AI service returned an invalid task plan.";
    }
    next(error);
  }
}
