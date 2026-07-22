'use client';

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BlogCardProps {
	id: string;
	title: string;
	excerpt: string;
	image: string;
	date: string;
	readTime: string;
	category: string;
	featured?: boolean;
}

export function BlogCard({
	id,
	title,
	excerpt,
	image,
	date,
	readTime,
	category,
	featured,
}: BlogCardProps) {
	const formattedDate = new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<article className="group gradient-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
			{/* Image */}
			<Link href={`/blog/${id}`} className="block relative overflow-hidden aspect-video">
				<Image
					src={image}
					alt={title}
					fill
					sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
					className="object-cover group-hover:scale-105 transition-transform duration-500"
				/>
				<Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
					{category}
				</Badge>
			</Link>

			{/* Content */}
			<div className="p-6">
				{/* Meta */}
				<div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
					<span className="flex items-center gap-1">
						<Calendar className="h-4 w-4" />
						{formattedDate}
					</span>
					<span className="flex items-center gap-1">
						<Clock className="h-4 w-4" />
						{readTime}
					</span>
				</div>

				{/* Title */}
				<Link href={`/blog/${id}`}>
					<h3 className="text-xl font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
						{title}
					</h3>
				</Link>

				{/* Excerpt */}
				<p className="text-muted-foreground text-sm mb-4 line-clamp-2">
					{excerpt}
				</p>

				{/* Read More */}
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
