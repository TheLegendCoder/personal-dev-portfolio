// Portfolio content data - easily editable

/**
 * Shared user-facing copy.
 *
 * These strings previously lived inline in each route, which meant the same
 * sentence existed in three or four near-identical variants that drifted
 * whenever one was edited. Anything that appears on more than one surface —
 * or that carries the site's positioning — belongs here.
 *
 * Positioning note: the site is an engineering identity (architecture, .NET,
 * cloud, distributed systems, security, AI), not a React/web-development blog.
 * Keep new copy in that register.
 */
export const copy = {
  /** The Writing hub's hero line and its meta description. */
  writingIntro:
    "Ideas, lessons, and engineering perspectives from building real-world software.",
  /** Longer form of the same idea, used on /blog and in metadata. */
  writingPositioning:
    "Writing about the things I discover while building software — from architecture and engineering decisions to lessons learned along the way.",
  writingEmptyState:
    "I'm working on pieces about architecture, distributed systems, and the engineering decisions behind real projects. Check back soon.",

  blogIntro:
    "Writing about the things I discover while building software — from architecture and engineering decisions to lessons learned along the way.",
  blogMetaDescription:
    "Engineering writing on architecture, .NET, cloud, security, and the decisions behind real-world systems. Lessons from projects that actually shipped.",

  tutorialsIntro:
    "Step-by-step guides through the engineering problems I've had to solve — architecture, .NET, cloud, and the tooling around them.",
  tutorialsMetaDescription:
    "Practical, step-by-step engineering guides covering architecture, .NET, cloud infrastructure, security, and testing.",
  tutorialsEmptyState:
    "I'm writing step-by-step guides on architecture, .NET, cloud infrastructure, and testing — the things I wish had been written down when I needed them.",

  workIntro:
    "Systems I've designed, built, and shipped — plus the experiments I run to work out how something really behaves.",
  workMetaDescription:
    "Professional engineering work and personal experiments — architecture, .NET, cloud infrastructure, and the systems behind them.",

  projectsIntro:
    "Professional work and personal experiments — the systems, services, and tools I've designed and shipped.",
  projectsMetaDescription:
    "A collection of professional work and personal experiments spanning architecture, .NET, cloud infrastructure, and distributed systems.",

  /** Shared across /projects and the home page's featured strip. */
  projectsEmptyState:
    "I am working on it. Check back soon to see what I've been building.",
  /** Shared across the home page's writing and projects strips. */
  loadError: "Having trouble loading this right now. Please try again shortly.",
} as const;

export const personalInfo = {
  name: "Tsholofelo Ndawonde",
  title: "Software Engineer",
  tagline: "Building systems that hold up under real conditions",
  bio: "I document what I learn while building real-world software — from architecture and distributed systems to the engineering decisions behind them. This is where I share my experiments, lessons, and projects as I grow as an engineer.",
  email: "",
  location: "South Africa",
  availability: "Open to opportunities",
  socialLinks: {
    github: "https://github.com/tsholofelondawonde",
    linkedin: "https://www.linkedin.com/in/ndawonde/",
    twitter: "https://x.com/tsholo_dev",
  },
};
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
