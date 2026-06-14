import type { Prisma, Wilaya } from "@prisma/client";
import { format } from "date-fns";
import { TICKET_CODE_PREFIX } from "@/lib/constants";

type TransactionClient = Prisma.TransactionClient;

export async function generateTicketCode(
  tx: TransactionClient,
  wilaya: Wilaya,
  travelDate: Date,
): Promise<string> {
  const dateStr = format(travelDate, "yyyyMMdd");
  const prefix = `${TICKET_CODE_PREFIX}-${wilaya}-${dateStr}`;

  const lastTicket = await tx.ticket.findFirst({
    where: { ticketCode: { startsWith: prefix } },
    orderBy: { ticketCode: "desc" },
    select: { ticketCode: true },
  });

  let sequence = 1;
  if (lastTicket) {
    const parts = lastTicket.ticketCode.split("-");
    const lastSeq = parseInt(parts[parts.length - 1] ?? "0", 10);
    sequence = lastSeq + 1;
  }

  return `${prefix}-${sequence.toString().padStart(4, "0")}`;
}
