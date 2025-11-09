"use client";
import React from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen p-6 bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50">
        <div className="max-w-xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Error global</h1>
          <p className="text-sm">{error.message}</p>
          <button
            onClick={() => reset()}
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
