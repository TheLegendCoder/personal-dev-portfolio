'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import styles from "./stagger.module.css"
import { gsap, ScrollTrigger, STAGGER_CARD, EASE } from "@/lib/gsap"

interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  staggerChildren?: boolean
  delayChildren?: number
  variant?: "fade" | "slide-up" | "bounce" | "cascade"
}

const StaggerContainer = React.forwardRef<
  HTMLDivElement,
  StaggerContainerProps
>(
  (
    {
      className,
      staggerChildren = true,
      delayChildren = 0,
      variant = "cascade",
      children,
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      const container = containerRef.current
      if (!container || !staggerChildren) return

      const items = Array.from(container.children) as HTMLElement[]
      if (items.length === 0) return

      gsap.registerPlugin(ScrollTrigger)

      const ctx = gsap.context(() => {
        gsap.from(items, {
          y: variant === "fade" ? 0 : 40,
          opacity: 0,
          duration: 0.8,
          ease: EASE,
          stagger: STAGGER_CARD,
          delay: delayChildren / 1000,
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            once: true,
          },
        })
      }, container)

      return () => ctx.revert()
    }, [staggerChildren, delayChildren, variant])

    return (
      <div
        ref={containerRef}
        className={cn(styles.staggerContainer, className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

StaggerContainer.displayName = "StaggerContainer"

const StaggerItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "fade" | "slide-up" | "bounce" | "cascade"
  }
>(({ className, variant = "cascade", ...props }, ref) => {
  const variantMap = {
    fade: "fade-in",
    "slide-up": "bounce-up",
    bounce: "bounce-in",
    cascade: "cascade-in",
  }

  return (
    <div
      ref={ref}
      className={cn(`animate-${variantMap[variant]}`, className)}
      {...props}
    />
  )
})

StaggerItem.displayName = "StaggerItem"

export { StaggerContainer, StaggerItem }
