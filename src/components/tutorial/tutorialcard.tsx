'use client';

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface TutorialCardProps {
	id: string;
	title: string;
	excerpt: string;
	image: string;
	date: string;
	readTime: string;
	category: string;
	featured?: boolean;
	/** Large bento tile treatment — used for the most recent tutorial on list pages */
	large?: boolean;
}

export function TutorialCard({
	id,
	title,
	excerpt,
	image,
	date,
	readTime,
	category,
	large,
}: TutorialCardProps) {
	const formattedDate = new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<article className="group grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 border-b border-border/60 pb-16 last:border-b-0 last:pb-0">
			<Link
				href={`/tutorials/${id}`}
				className={`block relative overflow-hidden aspect-video bg-muted border border-border ${large ? 'clip-corner' : ''}`}
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
				<div className="mono-label flex items-center gap-4 mb-3 pb-3 border-b border-border">
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

				<Link href={`/tutorials/${id}`}>
					<h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
						{title}
					</h3>
				</Link>

				<p className="text-muted-foreground mb-5 leading-relaxed">
					{excerpt}
				</p>

				<Link
					href={`/tutorials/${id}`}
					className="mono-label inline-flex items-center text-primary hover:text-primary/80 transition-colors self-start"
				>
					Read More
					<ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
				</Link>
			</div>
		</article>
	);
}
