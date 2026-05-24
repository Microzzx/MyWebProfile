import { SectionProps } from "@/types/types";

const SectionBox = ({ children, id, className }: SectionProps) => {
  return (
    <section
      id={id}
      className={`theme-panel scroll-mt-[112px] rounded-3xl border p-6 backdrop-blur-xl transition-colors duration-300 sm:p-8 ${className ?? ""}`}
    >
      {children}
    </section>
  );
};

export default SectionBox;
