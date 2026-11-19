import { APICallError, LoadAPIKeyError, NoObjectGeneratedError, RetryError } from "ai";
import { aiProviders, type AiProvider } from "./providers";

type FailureKind = "rate_limit" | "unavailable" | "auth" | "invalid_output" | "other";

export class AiOperationError extends Error {
  constructor(
    readonly kind: FailureKind,
    readonly statusCode: number | undefined,
  ) {
    super("AI request failed");
    this.name = "AiOperationError";
  }
}

const MAX_ATTEMPTS_PER_PROVIDER = 3;
const MAX_RETRY_DELAY_MS = 15_000;
// A provider that never sends a first token must not hold the interview room
// open indefinitely. Override this on the server with AI_REQUEST_TIMEOUT_MS.
const configuredTimeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS);
export const AI_REQUEST_TIMEOUT_MS = Number.isFinite(configuredTimeoutMs) && configuredTimeoutMs > 0
  ? configuredTimeoutMs
  : 8_000;

function unwrap(error: unknown): unknown {
  while (RetryError.isInstance(error)) error = error.lastError;
  return error;
}

function classify(error: unknown): { kind: FailureKind; statusCode?: number; retryAfterMs?: number } {
  error = unwrap(error);
  if (LoadAPIKeyError.isInstance(error)) return { kind: "auth" };
  if (NoObjectGeneratedError.isInstance(error)) return { kind: "invalid_output" };
  if (
    error instanceof Error &&
    (error.name === "TimeoutError" || /timed? out|timeout|returned no text/i.test(error.message))
  ) {
    return { kind: "unavailable", statusCode: 504 };
  }
  if (!APICallError.isInstance(error)) return { kind: "other" };

  const statusCode = error.statusCode;
  const retryAfter = Object.entries(error.responseHeaders ?? {}).find(
    ([name]) => name.toLowerCase() === "retry-after",
  )?.[1];
  let retryAfterMs: number | undefined;
  if (retryAfter) {
    const seconds = Number(retryAfter);
    retryAfterMs = Number.isFinite(seconds)
      ? Math.max(0, seconds * 1000)
      : Math.max(0, Date.parse(retryAfter) - Date.now());
    if (!Number.isFinite(retryAfterMs)) retryAfterMs = undefined;
  }

  if (statusCode === 429) return { kind: "rate_limit", statusCode, retryAfterMs };
  if (statusCode === 502 || statusCode === 503 || statusCode === 504) {
    return { kind: "unavailable", statusCode, retryAfterMs };
  }
  if (statusCode === 401 || statusCode === 403) return { kind: "auth", statusCode };
  return { kind: "other", statusCode };
}

export function logAiFailure(provider: AiProvider, attempt: number, error: unknown) {
  const failure = classify(error);
  const reason = unwrap(error);
  console.error("[ai provider failure]", {
    provider: provider.name,
    model: provider.modelId,
    attempt,
    statusCode: failure.statusCode ?? null,
    category: failure.kind,
    reason: reason instanceof Error ? reason.message.slice(0, 500) : String(reason).slice(0, 500),
  });
  return failure;
}

export async function runWithAiFallback<T>(
  operation: (provider: AiProvider) => Promise<T>,
): Promise<T> {
  let lastFailure: AiOperationError | undefined;
  for (const [providerIndex, provider] of aiProviders.entries()) {
    if (provider.name === "groq" && !process.env.GROQ_API_KEY) {
      console.error("[ai fallback unavailable] GROQ_API_KEY is missing");
      break;
    }

    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_PROVIDER; attempt++) {
      try {
        return await operation(provider);
      } catch (error) {
        const failure = logAiFailure(provider, attempt, error);
        const retryable = failure.kind === "rate_limit" || failure.kind === "unavailable";
        if (retryable && attempt < MAX_ATTEMPTS_PER_PROVIDER) {
          // A long Retry-After means we should use the next provider now rather
          // than retrying before the provider's requested wait has elapsed.
          const delay = failure.retryAfterMs ?? Math.min(
            MAX_RETRY_DELAY_MS,
            750 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250),
          );
          if (delay <= MAX_RETRY_DELAY_MS) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        const canFallback = retryable || failure.kind === "invalid_output";
        lastFailure = new AiOperationError(failure.kind, failure.statusCode);
        if (canFallback && providerIndex < aiProviders.length - 1) break;
        throw lastFailure;
      }
    }
  }

  throw lastFailure ?? new AiOperationError("unavailable", 503);
}

export function clientAiError(error: unknown): { error: string; status: number } {
  const failure = error instanceof AiOperationError ? error : classify(error);
  switch (failure.kind) {
    case "rate_limit":
      return { error: "The AI service is busy. Please try again shortly.", status: 429 };
    case "unavailable":
      return { error: "The AI service is temporarily unavailable. Please try again shortly.", status: 503 };
    case "auth":
      return { error: "The AI service is not configured correctly. Please contact support.", status: 500 };
    default:
      return { error: "We couldn't complete this AI request. Please try again.", status: 500 };
  }
}
