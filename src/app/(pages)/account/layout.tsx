import React from "react";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-background text-foreground">
       {children}
    </section>
  );
}
