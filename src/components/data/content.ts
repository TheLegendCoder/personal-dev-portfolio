// Portfolio content data - easily editable

export const personalInfo = {
  name: "Tsholofelo Ndawonde",
  title: "Software Engineer",
  tagline: "Crafting elegant solutions through code",
  bio: "I document what I learn while building real-world software from scalable web apps to thoughtful product decisions. This is where I share my experiments, lessons, and projects as I grow as an engineer.",
  email: "",
  location: "South Africa",
  availability: "Open to opportunities",
  socialLinks: {
    github: "https://github.com/tsholofelondawonde",
    linkedin: "https://www.linkedin.com/in/ndawonde/",
    twitter: "https://x.com/tsholo_dev",
  },
};
/**
 * /now page content — deliberately a config object, not a Supabase table.
 * A "currently building/learning" blurb touched every few weeks doesn't need a
 * database and an admin form; editing this file and redeploying is the whole
 * update workflow.
 *
 * Ships empty: /now renders an empty state and the home page "Currently" strip
 * doesn't render at all until these are filled in.
 */
export const nowStatus = {
  building: '',
  learning: '',
  exploring: '',
  updatedAt: '', // e.g. '2026-08-27'
};

export interface WorkTheme {
  label: string;
  description: string;
}

/**
 * The "What I work on" strip on the home page. Copy is drawn from the existing
 * About content below (`aboutContent.approachSections` and `personalInfo.bio`)
 * rather than invented — reword freely, it only lives here.
 */
export const workThemes: WorkTheme[] = [
  {
    label: 'Backend & .NET',
    description:
      'C# and the .NET ecosystem in professional work — reliable, long-lived systems built with an eye on performance and maintainability.',
  },
  {
    label: 'TypeScript & the Web',
    description:
      'Node.js and TypeScript across the stack, from APIs and backend services through to modern web interfaces.',
  },
  {
    label: 'Architecture',
    description:
      'How systems evolve over time, and how small design decisions compound as an application grows.',
  },
  {
    label: 'Building in Public',
    description:
      'Documenting what I learn while building real software — the experiments, the lessons, and the things that failed interestingly.',
  },
];

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  featured?: boolean;
  category?: 'professional' | 'personal';
  /** Groups under Experiments on /projects. Independent of category. */
  isExperiment?: boolean;
}

/**
 * Static portfolio projects — used as fallback when Supabase is unavailable.
 * Customize with your real projects. Each project requires:
 * - id (unique identifier)
 * - title, description, image, tags, liveUrl, githubUrl
 * - featured (optional, shows on home page)
 * - category (optional, 'professional' or 'personal', defaults to 'personal')
 */
export const projects: Project[] = [
  {
    id: 'portfolio-website',
    title: 'Personal Portfolio & Blog',
    description: 'A modern portfolio website built with Next.js 15, TypeScript, and Tailwind CSS. Features a comprehensive blog system with MDX support, dark mode, and SEO optimization.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'MDX', 'Supabase'],
    liveUrl: 'https://tsholofelo-ndawonde.vercel.app',
    githubUrl: 'https://github.com/TheLegendCoder/tsholofelo-ndawonde',
    featured: true,
    category: 'personal',
  },
  {
    id: 'realtime-chat-app',
    title: 'Real-time Chat Application',
    description: 'Full-stack chat application with WebSocket support, user authentication, and message persistence. Built with Node.js backend and React frontend.',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
    tags: ['Node.js', 'React', 'Socket.io', 'Express', 'MongoDB'],
    liveUrl: 'https://realtime-chat-example.vercel.app',
    githubUrl: 'https://github.com/TheLegendCoder/realtime-chat',
    featured: true,
    category: 'personal',
  },
  {
    id: 'api-rest-service',
    title: 'RESTful API Service',
    description: 'Production-grade API service with authentication, rate limiting, and comprehensive documentation. Demonstrates best practices in API design and error handling.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    tags: ['.NET', 'C#', 'ASP.NET Core', 'Entity Framework', 'SQL Server'],
    liveUrl: '',
    githubUrl: 'https://github.com/TheLegendCoder/api-service',
    featured: false,
    category: 'professional',
  },
];

export interface SkillGroup {
  group: string;
  items: string[];
}

export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  description: string;
}

/**
 * Real skills/experience content — intentionally empty until populated.
 * The desktop-mode About panel only renders a Skills/Experience tab when
 * the corresponding array here is non-empty.
 */
export const skills: SkillGroup[] = [];
export const experience: ExperienceItem[] = [];

export const aboutContent = {
  intro: "Hi, I’m Tsholofelo Ndawonde. I’m a software engineer.",
  story: "This website serves as a platform where I document my learning process, share project insights, and reflect on my growth as a software engineer in the real world. My goal is to help others by sharing clear and practical lessons from my own journey.",
  approach: `My journey into software development started with a simple curiosity about how websites work. Over time, that curiosity evolved into a habit of building, experimenting, breaking things, and learning through hands-on experience. What began as exploration gradually became a craft and eventually, a career. In my professional work, I primarily use C# and the .NET ecosystem, which has significantly influenced my approach to software design, performance, and maintainability. I’m a big fan of the ecosystem and the discipline it encourages around building reliable, long-lived systems. Alongside that foundation, I’ve been intentionally expanding my expertise into the JavaScript ecosystem, particularly Node.js and TypeScript. Learning across stacks has helped me see familiar problems from new angles and build more flexible, end-to-end solutions from APIs and backend systems to modern web interfaces. I care deeply about clean code, thoughtful architecture, and creating software that is both scalable and user-friendly. I’m especially interested in how systems evolve over time and how small design decisions compound as applications grow. I believe learning is most powerful when it’s shared. Writing helps me think clearly, and building projects helps me test ideas in the real world. Every post and project here represents something I’ve learned, whether it worked perfectly or failed in an interesting way. If you’re learning, building, or figuring things out as you go, you’re in the right place.`,
  approachSections: [
    {
      label: 'Origin',
      text: "My journey into software development started with a simple curiosity about how websites work. Over time, that curiosity evolved into a habit of building, experimenting, breaking things, and learning through hands-on experience. What began as exploration gradually became a craft and eventually, a career.",
    },
    {
      label: 'Stack',
      text: "In my professional work, I primarily use C# and the .NET ecosystem, which has significantly influenced my approach to software design, performance, and maintainability. I’m a big fan of the ecosystem and the discipline it encourages around building reliable, long-lived systems. Alongside that foundation, I’ve been intentionally expanding my expertise into the JavaScript ecosystem, particularly Node.js and TypeScript. Learning across stacks has helped me see familiar problems from new angles and build more flexible, end-to-end solutions from APIs and backend systems to modern web interfaces. I care deeply about clean code, thoughtful architecture, and creating software that is both scalable and user-friendly. I’m especially interested in how systems evolve over time and how small design decisions compound as applications grow.",
    },
    {
      label: 'Philosophy',
      text: "I believe learning is most powerful when it’s shared. Writing helps me think clearly, and building projects helps me test ideas in the real world. Every post and project here represents something I’ve learned, whether it worked perfectly or failed in an interesting way. If you’re learning, building, or figuring things out as you go, you’re in the right place.",
    },
  ],
};
