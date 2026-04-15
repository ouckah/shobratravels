import { z } from "zod";

const name = z.string().trim().min(1).max(120);
const email = z.string().trim().toLowerCase().email().max(200);
const phone = z.string().trim().min(7).max(40);
const shortText = z.string().trim().min(1).max(500);
const longText = z.string().trim().min(1).max(5000);
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}/, "Invalid date")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date");

export const contactSchema = z.object({
  name,
  email,
  message: longText,
});

export const reviewSchema = z.object({
  name,
  content: longText,
  rating: z.number().int().min(1).max(5).optional(),
});

export const registerSchema = z
  .object({
    fullName: name,
    email,
    cellPhone: phone,
    homePhone: z.string().trim().max(40).optional().default(""),
    address: z.string().trim().min(5).max(500),
    tripId: z.string().min(1).max(50),
    tripDateId: z.string().min(1).max(50),
    passportNumber: z.string().trim().min(3).max(40),
    passportCountry: z.string().trim().min(2).max(100),
    passportIssued: isoDate,
    passportExpiry: isoDate,
    passportIssuedBy: z.string().trim().min(1).max(120),
    passportImage: z.string().url().max(500).optional().nullable(),
    paymentMethod: z.enum(["credit_card", "ach"]),
    sourceId: z.string().min(1).max(500),
  })
  .refine((d) => Date.parse(d.passportExpiry) > Date.parse(d.passportIssued), {
    message: "Passport expiry must be after issue date",
    path: ["passportExpiry"],
  });

export const adminLoginSchema = z.object({
  email,
  password: z.string().min(1).max(200),
});

export function formatZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid input";
  const path = first.path.join(".");
  return path ? `${path}: ${first.message}` : first.message;
}
