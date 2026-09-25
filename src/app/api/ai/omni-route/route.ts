import { NextRequest, NextResponse } from 'next/server';
import { processOmniRoute } from '@/lib/omni-router';
import { OmniRouteRequest, OmniRouteResponse } from '@/types/stem';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OmniRouteRequest;
    const response: OmniRouteResponse = await processOmniRoute(body);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('API Route /api/ai/omni-route error:', error);
    // Even on server exception, return clean JSON without crashing the caller
    return NextResponse.json(
      {
        success: false,
        providerUsed: 'demo_fallback',
        latencyMs: 0,
        error: error.message || 'Internal server error handled safely.',
        data: null,
      },
      { status: 200 }
    );
  }
}
