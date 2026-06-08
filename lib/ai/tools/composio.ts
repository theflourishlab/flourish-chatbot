import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import type { ToolSet } from "ai";

let composioClient: Composio<VercelProvider> | null = null;

function getComposioClient(): Composio<VercelProvider> | null {
  if (!process.env.COMPOSIO_API_KEY) {
    console.warn(
      "[composio] COMPOSIO_API_KEY is not set in this environment — no Composio tools will be loaded."
    );
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
    const tools = (await session.tools()) as ToolSet;
    const toolNames = Object.keys(tools);
    console.log(
      `[composio] loaded ${toolNames.length} tool(s) for user "${userId}" (session ${session.sessionId}): ${toolNames.join(", ") || "none"}`
    );
    return tools;
  } catch (error) {
    console.error(
      `[composio] failed to load tools for user "${userId}":`,
      error
    );
    return {};
  }
}
