import { SquareClient, SquareEnvironment } from "square";
import crypto from "crypto";

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
});

const LOCATION_ID = process.env.SQUARE_LOCATION_ID!;
const CC_FEE_RATE = 0.039; // 3.9%
const ACH_FEE_RATE = 0.01; // 1% — absorbed by business, not shown to customer

export function calculateTotal(method: string, tripPrice: number) {
  if (method === "credit_card") {
    const fee = Math.round(tripPrice * CC_FEE_RATE * 100) / 100;
    return { base: tripPrice, fee, total: tripPrice + fee };
  }
  // ACH — 1% absorbed by business
  const fee = Math.round(tripPrice * ACH_FEE_RATE * 100) / 100;
  return { base: tripPrice, fee, total: tripPrice };
}

export async function processPayment(
  sourceId: string,
  amountCents: number,
  buyerEmail: string,
  tripTitle: string
) {
  console.log("Processing payment:", {
    amountCents,
    sourceIdPrefix: sourceId.substring(0, 20) + "...",
    locationId: LOCATION_ID,
    environment: process.env.SQUARE_ENVIRONMENT,
  });

  const response = await client.payments.create({
    sourceId,
    idempotencyKey: crypto.randomUUID(),
    amountMoney: {
      amount: BigInt(amountCents),
      currency: "USD",
    },
    locationId: LOCATION_ID,
    buyerEmailAddress: buyerEmail,
    note: `Shobra Travel Agency — ${tripTitle}`,
  });

  return response.payment;
}
