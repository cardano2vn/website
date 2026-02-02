import { NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const POST = async (req: Request) => {
  try {
    const { deviceData } = await req.json();

    if (!deviceData) {
      return NextResponse.json(createErrorResponse('Device data is required', 'MISSING_DEVICE_DATA'), { status: 400 });
    }

    const [{ generateDeviceFingerprint }] = await Promise.all([import('~/lib/device-fingerprint')]);
    const deviceFingerprint = await generateDeviceFingerprint(deviceData.userAgent, deviceData);

    const { getDeviceAttemptDetails } = await import('~/lib/device-attempt-utils');
    const deviceDetails = await getDeviceAttemptDetails(deviceFingerprint);

    if (!deviceDetails) {
      return NextResponse.json(createSuccessResponse({
        isBanned: false,
        failedAttempts: 0,
        bannedUntil: null
      }));
    }

    const now = new Date();
    const isBanExpired = deviceDetails.isBanned && 
                        deviceDetails.bannedUntil && 
                        deviceDetails.bannedUntil < now;

    if (isBanExpired) {
      const { prisma } = await import('~/lib/prisma');
      await prisma.deviceAttempt.update({
        where: { id: deviceDetails.id },
        data: {
          failedAttempts: 0,
          isBanned: false,
          bannedAt: null,
          bannedUntil: null,
          lastAttemptAt: now
        }
      });

      return NextResponse.json(createSuccessResponse({
        isBanned: false,
        failedAttempts: 0,
        bannedUntil: null,
        message: 'Ban has expired, device is now unblocked'
      }));
    }

    return NextResponse.json(createSuccessResponse({
      isBanned: deviceDetails.isBanned,
      failedAttempts: deviceDetails.failedAttempts,
      bannedUntil: deviceDetails.bannedUntil,
      lastAttemptAt: deviceDetails.lastAttemptAt
    }));

  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
};
