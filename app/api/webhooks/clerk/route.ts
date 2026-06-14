import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { Wilaya } from "@prisma/client";

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses, phone_numbers, first_name, last_name } =
      evt.data;

    const email = email_addresses?.[0]?.email_address;
    const phone = phone_numbers?.[0]?.phone_number;
    const fullName =
      [first_name, last_name].filter(Boolean).join(" ") || "Usuario";
    const metadata = evt.data.unsafe_metadata as {
      wilaya?: Wilaya;
      arabicName?: string;
    };

    const wilaya = metadata.wilaya ?? Wilaya.RABOUNI;

    await prisma.user.upsert({
      where: { clerkId: id },
      update: {
        email,
        phone,
        fullName,
        arabicName: metadata.arabicName,
      },
      create: {
        clerkId: id,
        email,
        phone,
        fullName,
        arabicName: metadata.arabicName,
        wilaya,
      },
    });
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      await prisma.user.deleteMany({ where: { clerkId: id } });
    }
  }

  return NextResponse.json({ received: true });
}
