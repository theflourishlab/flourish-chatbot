import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import type { ToolSet } from "ai";

let composioClient: Composio | null = null;

function getComposioClient(): Composio | null {
  if (!process.env.COMPOSIO_API_KEY) {
    return null;
  }

  if (!composioClient) {
    composioClient = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
      provider: new VercelProvider(),
    });
  }

  return composioClient;
}

/**
 * Loads Composio tool-router tools for the given user.
 *
 * Creates a tool-router session scoped to `userId` and returns the resulting
 * AI SDK tool set, ready to spread into `streamText({ tools })`.
 *
 * Returns an empty tool set when `COMPOSIO_API_KEY` is not configured, or if
 * the session fails to initialize, so the chat keeps working without Composio.
 */
export async function getComposioTools(userId: string): Promise<ToolSet> {
  const composio = getComposioClient();

  if (!composio) {
    return {};
  }

  try {
    const session = await composio.create(userId);
    return (await session.tools()) as ToolSet;
  } catch (error) {
    console.error("Failed to load Composio tools:", error);
    return {};
  }
}
