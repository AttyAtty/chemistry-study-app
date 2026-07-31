"use client";

export function PrintButton({ label = "印刷・PDF" }: { label?: string }) {
  return <button className="button secondary no-print" type="button" onClick={() => window.print()}>{label}</button>;
}
