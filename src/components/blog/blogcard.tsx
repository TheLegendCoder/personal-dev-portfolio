'use client';

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface BlogCardProps {
	id: string;
	title: string;
	excerpt: string;
	image: string;
	date: string;
	readTime: string;
	category: string;
	featured?: boolean;
	/** Large bento tile treatment — used for the most recent post on list pages */
	large?: boolean;
}

export function BlogCard({
	id,
	title,
	excerpt,
	image,
	date,
	readTime,
	category,
	large,
}: BlogCardProps) {
	const formattedDate = new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<article className="group bg-card overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
			{/* Image — category label lives below it, never overlaid on the photo */}
			<Link href={`/blog/${id}`} className="block relative overflow-hidden aspect-video bg-muted">
				<Image
					src={image}
					alt={title}
					fill
					sizes={large ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"}
					className="object-cover group-hover:scale-105 transition-transform duration-500"
				/>
			</Link>

			{/* Content */}
			<div className="p-6 flex flex-col flex-1">
				<div className="flex items-center gap-4 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
					<span>{category}</span>
					<span className="flex items-center gap-1 normal-case tracking-normal">
						<Calendar className="h-3.5 w-3.5" />
						{formattedDate}
					</span>
					<span className="flex items-center gap-1 normal-case tracking-normal">
						<Clock className="h-3.5 w-3.5" />
						{readTime}
					</span>
				</div>

				<Link href={`/blog/${id}`}>
					<h3 className={`font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors ${large ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
						{title}
					</h3>
				</Link>

				<p className={`text-muted-foreground text-sm mb-4 flex-1 ${large ? 'line-clamp-3' : 'line-clamp-2'}`}>
					{excerpt}
				</p>

				<Link
					href={`/blog/${id}`}
					className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
				>
					Read More
					<ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
				</Link>
			</div>
		</article>
	);
}
