import "../styles/globals.css";
import type { PropsWithChildren } from "react";
import AppShell from "@/components/layout/AppShell";

export const metadata = {
  title: "Janekit Prakittawornkul | Web Developer",
  description:
    "Portfolio of Janekit Prakittawornkul, a backend and web developer.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
