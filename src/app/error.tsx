"use client";
import React from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold text-red-600">Ha ocurrido un error</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Reintentar
      </button>
    </div>
  );
}
