import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("homeevo-token")?.value;

  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const secretStr = process.env.JWT_SECRET;
    if (!secretStr) {
      console.error("JWT_SECRET is missing in environment variables");
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    const secret = new TextEncoder().encode(secretStr);
    await jwtVerify(token, secret);
  } catch (error) {
    console.error("JWT validation error in ai mock blueprint endpoint:", error);
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const encoder = new TextEncoder();
  let data;
  try {
    data = await req.json();
  } catch (e) {
    data = {};
  }

  const responseData = {
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" stroke="#E85D04" stroke-width="0.8">
      <rect x="5" y="5" width="90" height="90" rx="3" stroke-dasharray="2 2" stroke="#bbb" />
      <rect x="10" y="10" width="40" height="35" stroke="#3d2b1f" stroke-width="0.6" />
      <text x="15" y="25" fill="#3D2B1F" font-family="sans-serif" font-size="4" font-weight="bold">Master Bedroom</text>
      <rect x="50" y="10" width="40" height="35" stroke="#3d2b1f" stroke-width="0.6" />
      <text x="55" y="25" fill="#3D2B1F" font-family="sans-serif" font-size="4" font-weight="bold">Living Room</text>
      <rect x="10" y="45" width="30" height="45" stroke="#3d2b1f" stroke-width="0.6" />
      <text x="15" y="60" fill="#3D2B1F" font-family="sans-serif" font-size="4" font-weight="bold">Kitchen</text>
      <rect x="40" y="45" width="50" height="45" stroke="#3d2b1f" stroke-width="0.6" />
      <text x="45" y="60" fill="#3D2B1F" font-family="sans-serif" font-size="4" font-weight="bold">Dining &amp; Lounge</text>
      <line x1="10" y1="45" x2="90" y2="45" stroke="#3d2b1f" stroke-width="0.6" />
      <line x1="50" y1="10" x2="50" y2="90" stroke="#3d2b1f" stroke-width="0.6" />
    </svg>`,
    estimate: [
      { item: "Foundation Work", cost: "₹2,40,000" },
      { item: "RCC Framing (Slabs/Columns)", cost: "₹4,80,000" },
      { item: "Brickwork & Plastering", cost: "₹3,10,000" },
      { item: "Electrical & Plumbing Rough-in", cost: "₹1,80,000" },
      { item: "Finishing (Tiles, Paints, Doors)", cost: "₹2,90,000" }
    ],
    materials: [
      "Coromandel 53-Grade Cement (550 Bags)",
      "Vizag Steel Fe550 TMT Rebars (3.5 Tons)",
      "Premium Ceramic Vitrified Tiles (1,200 Sq Ft)",
      "Finolex FR PVC Conduits & Copper Wires",
      "Asian Paints Apex Ultima Emulsion (120 Liters)"
    ]
  };

  const str = JSON.stringify(responseData);

  const stream = new ReadableStream({
    async start(controller) {
      // Chunk size to feed progressively
      const chunkSize = 20;
      for (let i = 0; i < str.length; i += chunkSize) {
        const chunk = str.slice(i, i + chunkSize);
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, 20)); // simulated 20ms network latency per chunk
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    }
  });
}
