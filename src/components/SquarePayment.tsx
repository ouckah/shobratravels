"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, Lock } from "lucide-react";

declare global {
  interface Window {
    Square: {
      payments: (
        appId: string,
        locationId: string
      ) => Promise<SquarePayments>;
    };
  }
}

interface SquarePayments {
  card: () => Promise<SquareCard>;
  ach: () => Promise<SquareACH>;
}

interface SquareCard {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<{ status: string; token: string; errors?: { message: string }[] }>;
  destroy: () => void;
}

interface SquareACH {
  tokenize: (options: {
    accountHolderName: string;
  }) => Promise<{ status: string; token: string; errors?: { message: string }[] }>;
  destroy: () => void;
}

type Props = {
  method: "credit_card" | "ach";
  registrationId: string;
  holderName: string;
  total: string;
  fee: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
};

export default function SquarePayment({
  method,
  registrationId,
  holderName,
  total,
  fee,
  onSuccess,
  onError,
}: Props) {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<SquareCard | null>(null);
  const achRef = useRef<SquareACH | null>(null);
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const script = document.createElement("script");
    script.src =
      process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === "production"
        ? "https://web.squarecdn.com/v1/square.js"
        : "https://sandbox.web.squarecdn.com/v1/square.js";
    script.onload = async () => {
      try {
        const payments = await window.Square.payments(
          process.env.NEXT_PUBLIC_SQUARE_APP_ID!,
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
        );

        if (method === "credit_card") {
          const card = await payments.card();
          await card.attach("#square-card-container");
          cardRef.current = card;
        } else {
          const ach = await payments.ach();
          achRef.current = ach;
        }
        setReady(true);
      } catch (err) {
        console.error("Square init error:", err);
        onError("Failed to load payment form. Please refresh and try again.");
      }
    };
    document.head.appendChild(script);

    return () => {
      cardRef.current?.destroy();
      achRef.current?.destroy();
    };
  }, [method, onError]);

  const handlePay = useCallback(async () => {
    setProcessing(true);
    try {
      let tokenResult;

      if (method === "credit_card" && cardRef.current) {
        tokenResult = await cardRef.current.tokenize();
      } else if (method === "ach" && achRef.current) {
        tokenResult = await achRef.current.tokenize({
          accountHolderName: holderName,
        });
      }

      if (!tokenResult || tokenResult.status !== "OK") {
        const errorMsg =
          tokenResult?.errors?.[0]?.message || "Payment verification failed";
        onError(errorMsg);
        setProcessing(false);
        return;
      }

      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          registrationId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Payment failed");
      }

      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setProcessing(false);
    }
  }, [method, holderName, registrationId, onSuccess, onError]);

  return (
    <div className="mt-6">
      {method === "credit_card" && (
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
            Card Details
          </label>
          <div
            id="square-card-container"
            ref={cardContainerRef}
            className="min-h-[44px] border-2 border-neutral-200 p-1"
          />
        </div>
      )}

      {method === "ach" && ready && (
        <div className="mb-6 bg-green-50 border border-green-200 p-5 text-sm text-neutral-600">
          <p>
            Clicking &ldquo;Pay&rdquo; will open a secure bank authorization
            prompt from Square. You&apos;ll select your bank and authorize a
            one-time debit of <strong>{total}</strong>.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={!ready || processing}
        className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-4 uppercase tracking-wider text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processing...
          </>
        ) : !ready ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <Lock size={14} />
            Pay {total}
          </>
        )}
      </button>

      <p className="text-center text-neutral-400 text-xs mt-3 flex items-center justify-center gap-1">
        <Lock size={10} />
        Secured by Square &middot; {fee} processing fee
      </p>
    </div>
  );
}
