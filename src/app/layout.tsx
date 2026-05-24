import "../styles/globals.css";
import { LayoutProps } from "@/types/types";
import MainLayout from "@/components/layout/MainLayout";

export const metadata = {
  title: "Janekit Prakittawornkul | Web Developer",
  description:
    "Portfolio of Janekit Prakittawornkul, a backend and web developer.",
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html>
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
