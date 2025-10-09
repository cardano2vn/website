import { NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';
import { prisma } from '~/lib/prisma';

export const GET = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const userId = params.id;

    const referralCount = await prisma.referralSubmission.count({
      where: {
        referrerId: userId
      }
    });

    return NextResponse.json(createSuccessResponse({
      referralCount
    }));

  } catch (error) {
    console.error('Error getting referral count:', error);
    return NextResponse.json(createErrorResponse('Failed to get referral count', 'INTERNAL_ERROR'), { status: 500 });
  }
};
