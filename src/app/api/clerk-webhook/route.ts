/* eslint-disable camelcase */
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { Webhook } from 'svix';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // Check headers
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get body
  const body = await req.json();

  // Create Svix instance with secret
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Process webhook events
  const { id } = evt.data;
  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created':
        return handleUserCreated(evt.data);
      case 'user.updated':
        return handleUserUpdated(evt.data);
      case 'user.deleted':
        return handleUserDeleted(evt.data);
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
        return new Response('', { status: 200 });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Error processing webhook', { status: 500 });
  }
}

async function handleUserCreated(data: any) {
  const { id, email_addresses, image_url, first_name, last_name, username } = data;

  const user = {
    clerkId: id,
    email: email_addresses[0]?.email_address,
    username: username ?? '',
    name: first_name ?? '',
    profileImage: image_url ?? '',
  };

  const newUser = await prisma.user.create({
    data: user,
  });

  // Optionally update user metadata
  // await clerkClient.users.updateUserMetadata(id, {
  //   publicMetadata: {
  //     userId: newUser.id,
  //   },
  // });

  return NextResponse.json({ message: 'OK', user: newUser });
}

async function handleUserUpdated(data: any) {
  const { id, image_url, first_name, last_name, username } = data;

  const userUpdate = {
    firstName: first_name ?? '',
    lastName: last_name ?? '',
    username: username ?? '',
    photo: image_url ?? '',
  };

  const updatedUser = await prisma.user.update({
    where: { clerkId: id },
    data: userUpdate,
  });

  return NextResponse.json({ message: 'OK', user: updatedUser });
}

async function handleUserDeleted(data: any) {
  const { id } = data;

  const deletedUser = await prisma.user.delete({
    where: { clerkId: id },
  });

  return NextResponse.json({ message: 'OK', user: deletedUser });
}
