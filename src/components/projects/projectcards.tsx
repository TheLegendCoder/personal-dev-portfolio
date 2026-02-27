import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
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
}

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
}: ProjectCardProps) {
	return (
		<article className="group gradient-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
			{/* Image */}
			<Link href={liveUrl} className="block relative overflow-hidden aspect-video" target="_blank" rel="noopener noreferrer">
				<img
					src={image}
					alt={title}
					className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
				/>
				<div className="absolute top-4 left-4 flex gap-2">
					{featured && (
						<Badge className="bg-primary text-primary-foreground">Featured</Badge>
					)}
					{category && (
						<Badge
							className={
								category === 'professional'
									? 'bg-blue-600 text-white'
									: 'bg-violet-600 text-white'
							}
						>
							{category === 'professional' ? 'Professional' : 'Personal'}
						</Badge>
					)}
				</div>
			</Link>

			{/* Content */}
			<div className="p-6">
				{/* Tags */}
				<div className="flex flex-wrap gap-2 mb-3">
					{tags.map((tag) => (
						<Badge key={tag} className="bg-muted text-muted-foreground">{tag}</Badge>
					))}
				</div>

				{/* Title */}
				<Link href={liveUrl} target="_blank" rel="noopener noreferrer">
					<h3 className="text-xl font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
						{title}
					</h3>
				</Link>

				{/* Description */}
				<p className="text-muted-foreground text-sm mb-4 line-clamp-2">
					{description}
				</p>

				{/* Links */}
				<div className="flex items-center gap-4">
					<Link
						href={liveUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
					>
						Live Demo
						<ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
					</Link>
					<Link
						href={githubUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						<Github className="mr-1 h-4 w-4" />
						GitHub
					</Link>
				</div>
			</div>
		</article>
	);
}
