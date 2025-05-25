import type { APIRoute } from "astro";
import { AI_CONFIG } from "@/lib/config/ai.config";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const apiKey = import.meta.env.OPENAI_API_KEY;
    const apiUrl = import.meta.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          apiUrl,
          apiKeyValid: false,
          apiKeyPrefix: null,
          error: "OpenAI API key not configured",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Test API key with a minimal request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.OPENAI.MODEL,
        messages: [{ role: "user", content: "test" }],
        max_tokens: 5,
      }),
    });

    // Check if we got HTML instead of JSON
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      return new Response(
        JSON.stringify({
          apiUrl,
          apiKeyValid: false,
          apiKeyPrefix: apiKey.slice(0, 3),
          error: `Invalid API URL: Endpoint returned HTML instead of JSON. Please check if the API URL (${apiUrl}) is correct.`,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({
          apiUrl,
          apiKeyValid: false,
          apiKeyPrefix: apiKey.slice(0, 3),
          error: `Failed to parse API response: ${parseError instanceof Error ? parseError.message : "Unknown error"}. Please check if the API URL (${apiUrl}) is correct.`,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          apiUrl,
          apiKeyValid: false,
          apiKeyPrefix: apiKey.slice(0, 3),
          error: `API key validation failed: ${responseData.error?.message || "Unknown error"}`,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        apiUrl,
        apiKeyValid: true,
        apiKeyPrefix: apiKey.slice(0, 3),
        error: null,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return new Response(
        JSON.stringify({
          apiUrl: import.meta.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions",
          apiKeyValid: false,
          apiKeyPrefix: import.meta.env.OPENAI_API_KEY?.slice(0, 3) || null,
          error: `Failed to connect to API: ${error.message}. Please check your internet connection and if the API URL is accessible.`,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        apiUrl: import.meta.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions",
        apiKeyValid: false,
        apiKeyPrefix: import.meta.env.OPENAI_API_KEY?.slice(0, 3) || null,
        error: `API validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
