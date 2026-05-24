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
    <p className="theme-accent-text mb-3 text-xs font-semibold uppercase tracking-[0.3em]">
      {eyebrow}
    </p>
    <h2 className="theme-text-primary text-2xl font-semibold tracking-tight sm:text-3xl">
      {title}
    </h2>
    {description && (
      <p className="theme-text-muted mt-3 max-w-2xl text-sm leading-7 sm:text-base">
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
        className="theme-hero relative overflow-hidden px-6 py-10 sm:px-10 sm:py-12"
      >
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="theme-accent-text mb-4 text-xs font-semibold uppercase tracking-[0.32em]">
            Backend / Web Developer
          </p>
          <h1 className="theme-text-primary text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Janekit
            <span className="theme-text-subtle block">Prakittawornkul</span>
          </h1>
          <p className="theme-text-muted mt-6 max-w-2xl text-base leading-8 sm:text-lg">
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
              className="theme-card theme-text-muted theme-hover inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-colors"
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
              className="theme-card rounded-2xl border p-5"
            >
              <p className="theme-text-primary text-xl font-semibold">{item.value}</p>
              <p className="theme-text-muted mt-2 text-sm leading-6">{item.label}</p>
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
              className="theme-card rounded-2xl border p-5 sm:p-6"
            >
              <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <h3 className="theme-text-primary text-lg font-semibold">
                    {experience.role}
                  </h3>
                  <p className="theme-accent-text mt-1 text-sm">{experience.company}</p>
                </div>
                <span className="theme-text-muted w-fit rounded-full border border-[var(--inner-border)] px-3 py-1 text-xs">
                  {experience.period}
                </span>
              </div>
              <ul className="theme-text-muted space-y-3 text-sm leading-7">
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
              className="theme-card rounded-2xl border p-5"
            >
              <h3 className="theme-accent-text mb-4 text-sm font-semibold">
                {group.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="theme-accent-soft theme-text-muted rounded-lg px-3 py-2 text-xs"
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
              className="theme-card rounded-2xl border p-5"
            >
              <p className="theme-text-subtle text-xs uppercase tracking-[0.2em]">
                {education.period}
              </p>
              <h3 className="theme-text-primary mt-3 text-base font-semibold leading-7">
                {education.institution}
              </h3>
              <p className="theme-text-muted mt-2 text-sm leading-6">
                {education.qualification}
              </p>
              <p className="theme-accent-soft theme-accent-text mt-4 inline-flex rounded-full px-3 py-1 text-xs">
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
            className="theme-card theme-contact flex items-center gap-4 rounded-2xl border p-4 transition-colors"
          >
            <BsEnvelope className="theme-accent-text text-xl" />
            <span className="theme-text-muted text-sm">janekitpk1@gmail.com</span>
          </a>
          <a
            href="tel:+66935813035"
            className="theme-card theme-contact flex items-center gap-4 rounded-2xl border p-4 transition-colors"
          >
            <BsTelephone className="theme-accent-text text-xl" />
            <span className="theme-text-muted text-sm">093-581-3035</span>
          </a>
          <a
            href="https://github.com/Microzzx"
            target="_blank"
            rel="noreferrer"
            className="theme-card theme-contact flex items-center gap-4 rounded-2xl border p-4 transition-colors"
          >
            <BsGithub className="theme-accent-text text-xl" />
            <span className="theme-text-muted text-sm">github.com/Microzzx</span>
          </a>
        </div>
      </SectionBox>
    </div>
  );
}
