import { Queue, type ConnectionOptions } from "bullmq";
import { isRedisUrlConfigured } from "@/server/lib/env";

function createConnection(): ConnectionOptions | null {
  if (!isRedisUrlConfigured()) return null;
  return {
    url: process.env.REDIS_URL!,
    maxRetriesPerRequest: null,
  };
}

const connection = createConnection();

export const notificationQueue = connection
  ? new Queue("tariq-notifications", { connection })
  : null;

export const pdfQueue = connection
  ? new Queue("tariq-pdf", { connection })
  : null;

export const waitlistQueue = connection
  ? new Queue("tariq-waitlist", { connection })
  : null;

interface NotificationJob {
  type: string;
  userId?: string;
  ticketId?: string;
  ticketCode?: string;
  travelDate?: Date;
  wilaya?: string;
  quotaId?: string;
}

interface PDFJob {
  type: string;
  ticketId: string;
}

export async function addNotificationJob(job: NotificationJob) {
  if (!notificationQueue) {
    if (process.env.NODE_ENV === "development") {
      console.info("[queue] notification:", job.type);
    }
    return;
  }
  await notificationQueue.add("notification", job);
}

export async function addPDFJob(job: PDFJob) {
  if (!pdfQueue) {
    if (process.env.NODE_ENV === "development") {
      console.info("[queue] pdf:", job.type);
    }
    return;
  }
  await pdfQueue.add("pdf", job);
}

export async function addWaitlistJob(data: {
  wilaya: string;
  travelDate: Date;
  quotaId: string;
}) {
  if (!waitlistQueue) return;
  await waitlistQueue.add("waitlist", data);
}
