import { convertToModelMessages, streamText, type TextStreamPart, type ToolSet } from "ai";
import { AI_REQUEST_TIMEOUT_MS, logAiFailure, runWithAiFallback } from "./resilience";

export async function startInterviewStream({
  system,
  messages,
  signal,
}: {
  system: string;
  messages: Awaited<ReturnType<typeof convertToModelMessages>>;
  signal: AbortSignal;
}): Promise<ReadableStream<TextStreamPart<ToolSet>>> {
  // Read through the first text chunk before committing the HTTP stream.
  // Provider errors reported inside the SDK stream can then trigger a retry
  // or fallback without sending a partial answer to the candidate.
  const { provider, reader, buffered } = await runWithAiFallback(async (provider) => {
    const result = streamText({
      model: provider.model,
      system,
      messages,
      maxRetries: 0,
      abortSignal: signal,
      timeout: {
        totalMs: AI_REQUEST_TIMEOUT_MS,
        firstChunkMs: AI_REQUEST_TIMEOUT_MS,
      },
      onError: () => {}, // The retry helper logs classified provider failures.
    });
    const reader = result.stream.getReader();
    const buffered: TextStreamPart<ToolSet>[] = [];
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) throw new Error("Interview model returned no text");
        if (value.type === "error") throw value.error;
        buffered.push(value);
        if (value.type === "text-delta" && value.text.length > 0) {
          return { provider, reader, buffered };
        }
      }
    } catch (error) {
      await reader.cancel().catch(() => {});
      throw error;
    }
  });

  return new ReadableStream<TextStreamPart<ToolSet>>({
    async start(controller) {
      for (const part of buffered) controller.enqueue(part);
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value.type === "error") {
            logAiFailure(provider, 1, value.error);
            controller.enqueue({ type: "error", error: value.error });
            break;
          }
          controller.enqueue(value);
        }
      } catch (error) {
        logAiFailure(provider, 1, error);
        controller.enqueue({ type: "error", error });
      } finally {
        await reader.cancel().catch(() => {});
        controller.close();
      }
    },
    cancel() {
      return reader.cancel();
    },
  });
}
