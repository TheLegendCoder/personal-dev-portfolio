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
    github: "https://github.com/TheLegendCoder",
    linkedin: "https://www.linkedin.com/in/ndawonde/",
    twitter: "https://x.com/tsholofelo_dev",
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
}

export const projects: Project[] = [
  {
    id: "portfolio",
    title: "CMS-backed Portfolio",
    description:
      "A production-grade personal portfolio built with Next.js 15, TypeScript, and MDX. Features full SEO, structured data, PostHog analytics, and a GSAP-driven cinematic UI system.",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&q=80",
    tags: ["Next.js", "TypeScript", "GSAP", "Tailwind CSS", "MDX"],
    liveUrl: "https://tsholofelo.dev",
    githubUrl: "https://github.com/TheLegendCoder/tsholofelo-ndawonde",
    featured: true,
  },
  {
    id: "content-repurposing",
    title: "Content Repurposing System",
    description:
      "An automated pipeline that ingests long-form content and transforms it into platform-optimised formats using AI. Built with Node.js, TypeScript, and structured prompt engineering.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    tags: ["Node.js", "TypeScript", "AI / LLM", "REST API", "Automation"],
    liveUrl: "",
    githubUrl: "https://github.com/TheLegendCoder",
    featured: true,
  },
  {
    id: "production-api",
    title: "Production API — C# / Azure",
    description:
      "A robust REST API built with ASP.NET Core and deployed on Azure App Service. Includes JWT authentication, structured logging, health checks, and a full CI/CD pipeline via GitHub Actions.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    tags: ["C#", ".NET", "Azure", "CI/CD", "GitHub Actions", "SQL Server"],
    liveUrl: "",
    githubUrl: "https://github.com/TheLegendCoder",
    featured: true,
  },
];


export const aboutContent = {
  intro: "Hi, I’m Tsholofelo Ndawonde — a software engineer.",
  story: "This website serves as a platform where I document my learning process, share project insights, and reflect on my growth as a software engineer in the real world. My goal is to help others by sharing clear and practical lessons from my own journey.",
  approach: `My journey into software development started with a simple curiosity about how websites work. Over time, that curiosity evolved into a habit of building, experimenting, breaking things, and learning through hands-on experience. What began as exploration gradually became a craft and eventually, a career. In my professional work, I primarily use C# and the .NET ecosystem, which has significantly influenced my approach to software design, performance, and maintainability. I’m a big fan of the ecosystem and the discipline it encourages around building reliable, long-lived systems. Alongside that foundation, I’ve been intentionally expanding my expertise into the JavaScript ecosystem, particularly Node.js and TypeScript. Learning across stacks has helped me see familiar problems from new angles and build more flexible, end-to-end solutions from APIs and backend systems to modern web interfaces. I care deeply about clean code, thoughtful architecture, and creating software that is both scalable and user-friendly. I’m especially interested in how systems evolve over time and how small design decisions compound as applications grow. I believe learning is most powerful when it’s shared. Writing helps me think clearly, and building projects helps me test ideas in the real world. Every post and project here represents something I’ve learned, whether it worked perfectly or failed in an interesting way. If you’re learning, building, or figuring things out as you go, you’re in the right place.`
};
