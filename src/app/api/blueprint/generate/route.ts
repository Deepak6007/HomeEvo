import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { hfClient, HF_MODEL, HF_MODEL_FALLBACK } from "@/lib/hf-client"
import { BlueprintRequestSchema } from "@/lib/validators/blueprint"
import { SYSTEM_PROMPT, buildBlueprintPrompt } from "@/lib/prompts/blueprint"

export const runtime = 'edge'
export const maxDuration = 60 // 60 seconds timeout

// Simple in-memory rate limiting map for edge/serverless context
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  // Rate limiting check: max 5 blueprint generations per hour
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip, 5, 3600 * 1000)) {
    return NextResponse.json({ 
      success: false, 
      error: 'Rate limit exceeded. You can generate up to 5 blueprints per hour.' 
    }, { status: 429 });
  }

  // STEP A — Authentication check
  const token = request.cookies.get("homeevo-token")?.value

  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const secretStr = process.env.JWT_SECRET
    if (!secretStr) {
      console.error("JWT_SECRET is missing in environment variables")
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
    }

    const secret = new TextEncoder().encode(secretStr)
    const { payload } = await jwtVerify(token, secret)
    
    const role = payload.role as string
    if (!role || role.toUpperCase() !== 'CLIENT') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
  } catch (error) {
    console.error("JWT validation error in blueprint generate endpoint:", error)
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  // STEP B — Parse and validate request body
  let body
  try {
    body = await request.json()
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid JSON request body' }, { status: 400 })
  }

  const parsed = BlueprintRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ 
      success: false, 
      errors: parsed.error.flatten().fieldErrors 
    }, { status: 400 })
  }

  // STEP C — Build the prompts
  const userPrompt = buildBlueprintPrompt(parsed.data)

  // STEP D — Call HuggingFace with streaming
  let stream
  try {
    stream = await hfClient.chat.completions.create({
      model: HF_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4096,
      temperature: 0.3,
      stream: true,
      response_format: { type: 'json_object' }
    })
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || 
                        error?.message?.toLowerCase().includes('rate limit') ||
                        error?.message?.toLowerCase().includes('too many requests') ||
                        error?.message?.toLowerCase().includes('rate_limit')

    if (isRateLimit) {
      console.warn("Primary model rate limited. Retrying with fallback model:", HF_MODEL_FALLBACK)
      try {
        stream = await hfClient.chat.completions.create({
          model: HF_MODEL_FALLBACK,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 4096,
          temperature: 0.3,
          stream: true,
          response_format: { type: 'json_object' }
        })
      } catch (fallbackError: any) {
        console.error("Fallback model also failed:", fallbackError)
        return NextResponse.json({ 
          success: false, 
          error: "Blueprint generation is temporarily busy. Please try again in 30 seconds." 
        }, { status: 503 })
      }
    } else {
      console.error("Hugging Face API call failed:", error)
      return NextResponse.json({ 
        success: false, 
        error: error.message || "Failed to generate blueprint" 
      }, { status: error?.status || 500 })
    }
  }

  // STEP E — Stream the response back using Server-Sent Events (SSE)
  const encoder = new TextEncoder()
  
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        let accumulatedJson = ''
        
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            accumulatedJson += content
            // Send the raw content chunk to client for progressive display
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: content })}\n\n`))
          }
          
          // Check if stream is done
          if (chunk.choices[0]?.finish_reason === 'stop') {
            // Validate the final JSON before sending DONE
            try {
              JSON.parse(accumulatedJson)
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            } catch (err) {
              console.error("Final accumulated JSON was malformed:", accumulatedJson)
              // JSON was malformed — send error
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ error: 'Generated response was not valid JSON. Please try again.' })}\n\n`
              ))
            }
          }
        }
      } catch (error: any) {
        console.error("Streaming error:", error)
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ error: 'Generation failed during stream. Please try again.' })}\n\n`
        ))
      } finally {
        controller.close()
      }
    }
  })
  
  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    }
  })
}
