import 'server-only'
import OpenAI from 'openai'

const hfToken = process.env.HF_TOKEN || 'build_time_placeholder';

export const hfClient = new OpenAI({
  baseURL: 'https://router.huggingface.co/v1',
  apiKey: hfToken,
})

export const HF_MODEL = process.env.HF_MODEL || 'Qwen/Qwen2.5-72B-Instruct'
export const HF_MODEL_FALLBACK = process.env.HF_MODEL_FALLBACK || 'mistralai/Mistral-7B-Instruct-v0.3'

/**
 * Verifies if the HF_TOKEN is valid by attempting a minimal chat completion request.
 * Returns true if successful, false otherwise.
 */
export async function checkHFToken(): Promise<boolean> {
  if (!process.env.HF_TOKEN) {
    console.error("checkHFToken: HF_TOKEN is missing in environment variables")
    return false
  }

  try {
    const response = await hfClient.chat.completions.create({
      model: HF_MODEL,
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 5,
    })
    return !!response.choices?.[0]?.message?.content
  } catch (error) {
    console.error("checkHFToken: Failed to query Hugging Face Inference Router:", error)
    
    // Attempt fallback model health check just in case
    try {
      console.log("checkHFToken: Attempting fallback model check...")
      const fallbackResponse = await hfClient.chat.completions.create({
        model: HF_MODEL_FALLBACK,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      })
      return !!fallbackResponse.choices?.[0]?.message?.content
    } catch (fallbackError) {
      console.error("checkHFToken: Fallback check also failed:", fallbackError)
      return false
    }
  }
}
