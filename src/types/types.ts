import { ReactNode } from "react";

export type LayoutProps = {
  children: ReactNode;
};

export type SectionProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};
