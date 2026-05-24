import { SectionProps } from "@/types/types";

const SectionBox = ({ children, id, className }: SectionProps) => {
  return (
    <section
      id={id}
      className={`scroll-mt-[112px] rounded-3xl border border-white/[0.08] bg-zinc-950/75 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-8 ${className ?? ""}`}
    >
      {children}
    </section>
  );
};

export default SectionBox;
