import "dotenv/config";
import { put } from "@vercel/blob";
import { readFile } from "fs/promises";
import path from "path";

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN not set");
  }

  const logoPath = path.resolve(process.cwd(), "public/logo.png");
  const buffer = await readFile(logoPath);

  const blob = await put("email-assets/logo.png", buffer, {
    access: "public",
    contentType: "image/png",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  console.log("Logo URL:", blob.url);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
