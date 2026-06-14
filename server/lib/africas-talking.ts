interface SMSParams {
  to: string;
  message: string;
}

export async function sendSMS(params: SMSParams): Promise<boolean> {
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  const username = process.env.AFRICASTALKING_USERNAME;

  if (!apiKey || !username) return false;

  try {
    const response = await fetch(
      "https://api.africastalking.com/version1/messaging",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          apiKey,
        },
        body: new URLSearchParams({
          username,
          to: params.to,
          message: params.message,
          from: process.env.AFRICASTALKING_SENDER_ID ?? "TARIQ",
        }),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}

export async function sendTicketSMS(
  phone: string,
  ticketCode: string,
  travelDate: string,
) {
  return sendSMS({
    to: phone,
    message: `TARIQ طريق: تذكرتك ${ticketCode} ليوم ${travelDate}. احتفظ بالرمز QR.`,
  });
}
