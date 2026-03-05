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

export const aboutContent = {
  intro: "Hi, I’m Tsholofelo Ndawonde — a software engineer.",
  story: "This website serves as a platform where I document my learning process, share project insights, and reflect on my growth as a software engineer in the real world. My goal is to help others by sharing clear and practical lessons from my own journey.",
  approach: `My journey into software development started with a simple curiosity about how websites work. Over time, that curiosity evolved into a habit of building, experimenting, breaking things, and learning through hands-on experience. What began as exploration gradually became a craft and eventually, a career. In my professional work, I primarily use C# and the .NET ecosystem, which has significantly influenced my approach to software design, performance, and maintainability. I’m a big fan of the ecosystem and the discipline it encourages around building reliable, long-lived systems. Alongside that foundation, I’ve been intentionally expanding my expertise into the JavaScript ecosystem, particularly Node.js and TypeScript. Learning across stacks has helped me see familiar problems from new angles and build more flexible, end-to-end solutions from APIs and backend systems to modern web interfaces. I care deeply about clean code, thoughtful architecture, and creating software that is both scalable and user-friendly. I’m especially interested in how systems evolve over time and how small design decisions compound as applications grow. I believe learning is most powerful when it’s shared. Writing helps me think clearly, and building projects helps me test ideas in the real world. Every post and project here represents something I’ve learned, whether it worked perfectly or failed in an interesting way. If you’re learning, building, or figuring things out as you go, you’re in the right place.`
};
