import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";
import { createSuccessResponse, createErrorResponse } from "~/lib/api-response";

export async function GET() {
  try {
    const welcomeModal = await prisma.welcomeModal.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(createSuccessResponse(welcomeModal));
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to fetch welcome modal', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
