import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProjectCategory } from "@/lib/projects";

interface ProjectCardProps {
	id: string;
	title: string;
	description: string;
	image: string;
	tags: string[];
	liveUrl: string;
	githubUrl: string;
	featured?: boolean;
	category?: ProjectCategory;
	isExperiment?: boolean;
}

/**
 * Editorial case-card: full width, real visual weight per project.
 * Title/image click through to the internal /projects/[id] detail page;
 * live/GitHub are explicit, secondary, external links.
 */
export function ProjectCard({
	id,
	title,
	description,
	image,
	tags,
	liveUrl,
	githubUrl,
	featured,
	category,
	isExperiment,
}: ProjectCardProps) {
	return (
		<article className="group grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 border-b border-border/60 pb-16 last:border-b-0 last:pb-0">
			<Link
				href={`/projects/${id}`}
				className={`block relative overflow-hidden aspect-video bg-muted border border-border ${featured ? 'clip-corner' : ''}`}
			>
				<Image
					src={image}
					alt={title}
					fill
					sizes="(min-width: 768px) 50vw, 100vw"
					className="object-cover group-hover:scale-105 transition-transform duration-500"
				/>
			</Link>

			<div className="flex flex-col justify-center">
				<div className="mono-label flex items-center gap-2 mb-3 pb-3 border-b border-border">
					{category && <span>{category === 'professional' ? 'Professional' : 'Personal'}</span>}
					{isExperiment && (
						<>
							<span aria-hidden="true">·</span>
							<span className="text-accent">Experiment</span>
						</>
					)}
					{featured && (
						<>
							<span aria-hidden="true">·</span>
							<span className="text-primary">Featured</span>
						</>
					)}
				</div>

				<Link href={`/projects/${id}`}>
					<h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
						{title}
					</h3>
				</Link>

				<p className="text-muted-foreground mb-5 leading-relaxed">
					{description}
				</p>

				<div className="flex flex-wrap gap-2 mb-6">
					{tags.map((tag) => (
						<Badge key={tag} variant="secondary">{tag}</Badge>
					))}
				</div>

				<div className="flex flex-wrap items-center gap-x-6 gap-y-2">
					<Link
						href={`/projects/${id}`}
						className="mono-label inline-flex items-center text-primary hover:text-primary/80 transition-colors"
					>
						View Project
						<ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
					</Link>
					{liveUrl && liveUrl !== '#' && (
						<Link
							href={liveUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="mono-label inline-flex items-center hover:text-foreground transition-colors"
						>
							<ExternalLink className="mr-1 h-3.5 w-3.5" />
							Live
						</Link>
					)}
					{githubUrl && (
						<Link
							href={githubUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="mono-label inline-flex items-center hover:text-foreground transition-colors"
						>
							<Github className="mr-1 h-3.5 w-3.5" />
							Source
						</Link>
					)}
				</div>
			</div>
		</article>
	);
}
