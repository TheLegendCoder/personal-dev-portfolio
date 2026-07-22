import * as React from "react"
import { cn } from "@/lib/utils"
import { useCursorFollow, useInView } from "@/hooks/use-scroll-animation"

interface EmotionalHeroProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  description?: React.ReactNode
  cta?: {
    label: string
    onClick: () => void
  }
  backgroundPattern?: boolean
  className?: string
}

const EmotionalHero = React.forwardRef<HTMLDivElement, EmotionalHeroProps>(
  (
    {
      title,
      subtitle,
      description,
      cta,
      backgroundPattern = true,
      className,
    },
    ref
  ) => {
    const { ref: cursorRef, style: cursorStyle } = useCursorFollow()
    const { ref: textRef, isInView } = useInView({ threshold: 0.5 })

    return (
      <div
        ref={ref}
        className={cn(
          "relative min-h-screen flex items-center justify-center overflow-hidden",
          "bg-gradient-to-b from-background via-background/95 to-background",
          className
        )}
      >
        {/* Animated background pattern */}
        {backgroundPattern && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating gradient orbs */}
            <div
              className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl animate-float"
              style={{ animationDuration: "6s" }}
            />
            <div
              className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 blur-3xl animate-float"
              style={{ animationDuration: "8s", animationDelay: "1s" }}
            />

            {/* Grid pattern subtle background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted))_1px,transparent_1px)] bg-[size:50px_50px] opacity-5" />
          </div>
        )}

        {/* Content container */}
        <div
          ref={cursorRef as React.Ref<HTMLDivElement>}
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          style={cursorStyle as React.CSSProperties}
        >
          {/* Animated subtitle with stagger */}
          {subtitle && (
            <div
              className="animate-fade-in mb-6 opacity-0"
              style={{ animationDelay: "0.1s", animationFillMode: "forwards" } as React.CSSProperties}
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
                ✨ {subtitle}
              </span>
            </div>
          )}

          {/* Main title with word reveal animation */}
          <div
            ref={textRef as React.Ref<HTMLDivElement>}
            className="animate-fade-up mb-6 opacity-0"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" } as React.CSSProperties}
          >
            {typeof title === "string" ? (
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="text-foreground">
                  {title}
                </span>
              </h1>
            ) : (
              title
            )}
          </div>

          {/* Description with fade */}
          {description && (
            <div
              className="animate-fade-in mb-8 opacity-0 max-w-2xl mx-auto"
              style={{ animationDelay: "0.3s", animationFillMode: "forwards" } as React.CSSProperties}
            >
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                {typeof description === "string" ? description : description}
              </p>
            </div>
          )}

          {/* CTA Button with spring animation */}
          {cta && (
            <div
              className="animate-fade-up opacity-0"
              style={{ animationDelay: "0.4s", animationFillMode: "forwards" } as React.CSSProperties}
            >
              <button
                onClick={cta.onClick}
                className={cn(
                  "inline-flex items-center justify-center px-8 py-4 rounded-lg",
                  "bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold",
                  "hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300",
                  "relative overflow-hidden group"
                )}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 -left-full group-hover:left-full transition-left duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative flex items-center gap-2">
                  {cta.label}
                  <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                    →
                  </span>
                </span>
              </button>
            </div>
          )}

          {/* Floating elements */}
          <div className="mt-20 relative h-20">
            <div
              className="absolute left-1/2 -translate-x-1/2 text-primary/60 animate-gentle-float text-sm font-medium"
              style={{ animationDelay: "0.5s" }}
            >
              ↓ Scroll to explore
            </div>
          </div>
        </div>
      </div>
    )
  }
)

EmotionalHero.displayName = "EmotionalHero"

export { EmotionalHero }
