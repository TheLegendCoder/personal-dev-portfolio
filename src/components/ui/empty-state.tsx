"use client";

import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionText?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText = "Check back soon",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 lg:py-20 space-y-6 animate-fade-in">
      <div className="rounded-full bg-primary/10 p-4">
        {icon}
      </div>
      <div className="text-center space-y-3 max-w-md">
        <h3 className="text-2xl sm:text-3xl font-semibold text-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
          {description}
        </p>
      </div>
      <span
        aria-disabled="true"
        className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-60"
      >
        {actionText}
      </span>
    </div>
  );
}
