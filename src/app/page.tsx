import SectionBox from "@/components/SectionBox";
import Link from "next/link";
import { BsArrowUpRight, BsEnvelope, BsGithub, BsTelephone } from "react-icons/bs";

const EXPERIENCES = [
  {
    role: "Backend Developer",
    company: "iSoftel (Thailand) Co., Ltd.",
    period: "2023 - Present",
    points: [
      "Design and develop RESTful APIs in Golang for a telecommunications web application with a Next.js frontend.",
      "Build scalable MySQL data workflows and integrate AIS third-party APIs for telecom services and real-time data exchange.",
      "Optimize backend logic and database queries while enhancing legacy Java Spring Boot systems.",
    ],
  },
  {
    role: "Full-Stack Web Developer Intern",
    company: "CP ALL Public Co., Ltd.",
    period: "2022 - 2023",
    points: [
      "Developed a full-stack contractor recruitment application supporting 7-Eleven store expansion projects.",
      "Built frontend interfaces with React.js and Tailwind CSS, supported by Node.js and MySQL.",
    ],
  },
];

const SKILL_GROUPS = [
  { title: "Languages", skills: ["Golang", "Java", "JavaScript", "TypeScript"] },
  { title: "Frameworks", skills: ["Gin", "Fiber", "Spring Boot", "React.js", "Next.js"] },
  { title: "Data", skills: ["MySQL", "Redis"] },
  { title: "Tools", skills: ["Docker", "PM2", "Git"] },
];

const EDUCATION = [
  {
    institution: "Prince of Songkla University, Hatyai Campus",
    qualification: "Bachelor Degree, Computer Engineering",
    period: "2019 - 2023",
    result: "GPAX 3.03",
  },
  {
    institution: "Saengthong Vitthaya School",
    qualification: "Senior High School, Computer Engineering Program",
    period: "2016 - 2018",
    result: "GPAX 3.58",
  },
];

const SectionHeading = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) => (
  <div className="mb-7">
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
      {eyebrow}
    </p>
    <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
      {title}
    </h2>
    {description && (
      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
        {description}
      </p>
    )}
  </div>
);

export default function HomePage() {
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <SectionBox
        id="Profile"
        className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(24,24,27,0.94),rgba(15,12,28,0.94))] px-6 py-10 sm:px-10 sm:py-12"
      >
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-violet-300">
            Backend / Web Developer
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            Janekit
            <span className="block text-white/45">Prakittawornkul</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
            I build web applications and backend services with Golang, Java,
            React, and Next.js, with experience in telecom integrations,
            database performance, and full-stack product delivery.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#Experience"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-400"
            >
              View experience
              <BsArrowUpRight />
            </Link>
            <Link
              href="#Contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/[0.09] hover:text-white"
            >
              Contact me
              <BsArrowUpRight />
            </Link>
          </div>
        </div>
      </SectionBox>

      <SectionBox id="About">
        <SectionHeading
          eyebrow="About"
          title="Building reliable web products"
          description="My objective is to keep improving as a web application developer while delivering practical, maintainable systems that support real business workflows."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { value: "3+", label: "Years professional experience" },
            { value: "Go + Java", label: "Backend focus" },
            { value: "React / Next.js", label: "Frontend delivery" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
            >
              <p className="text-xl font-semibold text-white">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-white/50">{item.label}</p>
            </div>
          ))}
        </div>
      </SectionBox>

      <SectionBox id="Experience">
        <SectionHeading
          eyebrow="Experience"
          title="Professional journey"
          description="Backend development for telecommunications systems and earlier full-stack product experience."
        />
        <div className="flex flex-col gap-4">
          {EXPERIENCES.map((experience) => (
            <article
              key={experience.role}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 sm:p-6"
            >
              <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {experience.role}
                  </h3>
                  <p className="mt-1 text-sm text-violet-300">{experience.company}</p>
                </div>
                <span className="w-fit rounded-full border border-white/[0.08] px-3 py-1 text-xs text-white/50">
                  {experience.period}
                </span>
              </div>
              <ul className="space-y-3 text-sm leading-7 text-white/60">
                {experience.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-[11px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </SectionBox>

      <SectionBox id="Skills">
        <SectionHeading eyebrow="Skills" title="Technical toolkit" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SKILL_GROUPS.map((group) => (
            <div
              key={group.title}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
            >
              <h3 className="mb-4 text-sm font-semibold text-violet-300">
                {group.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-white/[0.06] px-3 py-2 text-xs text-white/70"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionBox>

      <SectionBox id="Education">
        <SectionHeading eyebrow="Education" title="Academic background" />
        <div className="grid gap-4 lg:grid-cols-2">
          {EDUCATION.map((education) => (
            <article
              key={education.institution}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                {education.period}
              </p>
              <h3 className="mt-3 text-base font-semibold leading-7 text-white">
                {education.institution}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                {education.qualification}
              </p>
              <p className="mt-4 inline-flex rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                {education.result}
              </p>
            </article>
          ))}
        </div>
      </SectionBox>

      <SectionBox id="Contact">
        <SectionHeading
          eyebrow="Contact"
          title="Let's work together"
          description="Available to discuss web development and backend engineering opportunities."
        />
        <div className="grid gap-3 md:grid-cols-3">
          <a
            href="mailto:janekitpk1@gmail.com"
            className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition-colors hover:border-violet-400/30 hover:bg-violet-500/[0.06]"
          >
            <BsEnvelope className="text-xl text-violet-300" />
            <span className="text-sm text-white/70">janekitpk1@gmail.com</span>
          </a>
          <a
            href="tel:+66935813035"
            className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition-colors hover:border-violet-400/30 hover:bg-violet-500/[0.06]"
          >
            <BsTelephone className="text-xl text-violet-300" />
            <span className="text-sm text-white/70">093-581-3035</span>
          </a>
          <a
            href="https://github.com/Microzzx"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition-colors hover:border-violet-400/30 hover:bg-violet-500/[0.06]"
          >
            <BsGithub className="text-xl text-violet-300" />
            <span className="text-sm text-white/70">github.com/Microzzx</span>
          </a>
        </div>
      </SectionBox>
    </div>
  );
}
