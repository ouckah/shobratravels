import { SquareClient, SquareEnvironment, WebhooksHelper } from "square";
import crypto from "crypto";

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
});

const LOCATION_ID = process.env.SQUARE_LOCATION_ID!;
const DEPOSIT_AMOUNT = 1200; // $1,200 deposit
const CC_FEE_RATE = 0.039; // 3.9% — passed to customer
const ACH_FEE_RATE = 0.01; // 1% — absorbed by business

export function calculateDeposit(method: string) {
  if (method === "credit_card") {
    const fee = Math.round(DEPOSIT_AMOUNT * CC_FEE_RATE * 100) / 100;
    return { base: DEPOSIT_AMOUNT, fee, total: DEPOSIT_AMOUNT + fee };
  }
  // ACH — 1% absorbed, customer pays $1,200 flat
  const fee = Math.round(DEPOSIT_AMOUNT * ACH_FEE_RATE * 100) / 100;
  return { base: DEPOSIT_AMOUNT, fee, total: DEPOSIT_AMOUNT };
}

export async function processPayment(
  sourceId: string,
  amountCents: number,
  buyerEmail: string,
  tripTitle: string
) {
  const response = await client.payments.create({
    sourceId,
    idempotencyKey: crypto.randomUUID(),
    amountMoney: {
      amount: BigInt(amountCents),
      currency: "USD",
    },
    locationId: LOCATION_ID,
    buyerEmailAddress: buyerEmail,
    note: `Shobra Travel Agency — Deposit for ${tripTitle}`,
  });

  return response.payment;
}

export async function createBalancePaymentLink(args: {
  registrationId: string;
  clientName: string;
  clientEmail: string;
  tripTitle: string;
  balanceAmount: number;
}): Promise<{ url: string; id: string; orderId: string } | null> {
  const amountCents = Math.round(args.balanceAmount * 100);
  if (amountCents <= 0) return null;

  const response = await client.checkout.paymentLinks.create({
    idempotencyKey: `balance-${args.registrationId}`,
    quickPay: {
      name: `Balance — ${args.tripTitle}`,
      priceMoney: { amount: BigInt(amountCents), currency: "USD" },
      locationId: LOCATION_ID,
    },
    description: `Remaining trip balance for ${args.clientName} — ${args.tripTitle}`,
    prePopulatedData: { buyerEmail: args.clientEmail },
  });

  const link = response.paymentLink;
  if (!link?.url || !link?.id || !link?.orderId) return null;

  return { url: link.url, id: link.id, orderId: link.orderId };
}

export async function verifySquareWebhookSignature(args: {
  requestBody: string;
  signatureHeader: string;
  notificationUrl: string;
}): Promise<boolean> {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!signatureKey) return false;

  return WebhooksHelper.verifySignature({
    requestBody: args.requestBody,
    signatureHeader: args.signatureHeader,
    signatureKey,
    notificationUrl: args.notificationUrl,
  });
}

export async function getPaymentById(paymentId: string) {
  const response = await client.payments.get({ paymentId });
  return response.payment;
}
