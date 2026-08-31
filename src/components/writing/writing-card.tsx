'use client';

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackFeaturedContentClick } from "@/lib/posthog-events";
import type { WritingItem } from "@/lib/writing-utils";

interface WritingCardProps {
  item: WritingItem;
  /** Large treatment — the clip-corner accent, used for the lead card only */
  large?: boolean;
  /**
   * Set on cards in the Featured strip. Fires the featured-click event with
   * its 0-indexed slot so we can see whether anything past the first is read.
   */
  featuredPosition?: number;
}

const TYPE_LABEL: Record<WritingItem['type'], string> = {
  article: 'Article',
  tutorial: 'Tutorial',
};

/**
 * One card for both articles and tutorials. Replaces the near-identical
 * BlogCard/TutorialCard pair for the merged /writing stream, adding an explicit
 * type badge — once the two are interleaved, the reader can no longer tell them
 * apart from the surrounding page.
 */
export function WritingCard({ item, large, featuredPosition }: WritingCardProps) {
  const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleClick = () => {
    if (featuredPosition !== undefined) {
      trackFeaturedContentClick(item.type, item.slug, featuredPosition);
    }
  };

  return (
    <article className="group grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 border-b border-border/60 pb-16 last:border-b-0 last:pb-0">
      <Link
        href={item.href}
        onClick={handleClick}
        tabIndex={-1}
        aria-hidden="true"
        className={cn(
          "block relative overflow-hidden aspect-video bg-muted border border-border",
          large && "clip-corner"
        )}
      >
        <Image
          src={item.image}
          alt={item.imageHint || item.title}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      <div className="flex flex-col justify-center">
        <div className="mono-label flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 pb-3 border-b border-border">
          <span className="border border-primary/60 px-2 py-0.5 text-primary">
            {TYPE_LABEL[item.type]}
          </span>
          {item.tags[0] && <span>{item.tags[0]}</span>}
          <span className="flex items-center gap-1 normal-case tracking-normal">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1 normal-case tracking-normal">
            <Clock className="h-3.5 w-3.5" />
            {item.readTime}
          </span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
          <Link
            href={item.href}
            onClick={handleClick}
            className="transition-colors group-hover:text-primary"
          >
            {item.title}
          </Link>
        </h3>

        <p className="text-muted-foreground mb-5 leading-relaxed">
          {item.description}
        </p>

        <span
          aria-hidden="true"
          className="mono-label inline-flex items-center text-primary self-start"
        >
          Read More
          <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </article>
  );
}
