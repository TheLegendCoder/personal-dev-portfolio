import { useEffect, useRef, useState } from "react"
import { prefersReducedMotion } from "@/lib/gsap"

interface UseInViewOptions {
  threshold?: number | number[]
  margin?: string
  triggerOnce?: boolean
}

/**
 * Hook to detect when an element enters the viewport
 * Useful for triggering animations on scroll
 */
export function useInView(options: UseInViewOptions = {}) {
  const {
    threshold = 0.1,
    margin = "0px",
    triggerOnce = true,
  } = options

  const ref = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [hasBeenInView, setHasBeenInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          setHasBeenInView(true)

          if (triggerOnce) {
            observer.unobserve(entry.target)
          }
        } else if (!triggerOnce) {
          setIsInView(false)
        }
      },
      {
        threshold,
        rootMargin: margin,
      }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [threshold, margin, triggerOnce])

  return {
    ref,
    isInView: triggerOnce ? hasBeenInView : isInView,
    hasBeenInView,
  }
}

/**
 * Hook to track scroll position and apply parallax effects
 */
export function useParallax(options: { strength?: number } = {}) {
  const { strength = 0.5 } = options
  const ref = useRef<HTMLElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (!ref.current) return

    const handleScroll = () => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const elementCenter = rect.top + rect.height / 2
      const windowCenter = window.innerHeight / 2
      const distance = windowCenter - elementCenter
      const parallaxOffset = distance * strength

      setOffset(parallaxOffset)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [strength])

  return {
    ref,
    style: {
      transform: `translateY(${offset}px)`,
    },
  }
}

/**
 * Hook for cursor-following interactions
 */
export function useCursorFollow() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    if (prefersReducedMotion()) return

    const handleMouseMove = (e: MouseEvent) => {
      const el = ref.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      // Limit the movement to a certain distance
      const maxDistance = 15
      const distance = Math.sqrt(x * x + y * y)
      const limitedX = distance === 0 ? 0 : (x / distance) * Math.min(distance, maxDistance)
      const limitedY = distance === 0 ? 0 : (y / distance) * Math.min(distance, maxDistance)

      el.style.transform = `translate(${limitedX}px, ${limitedY}px)`
    }

    const handleMouseLeave = () => {
      if (ref.current) ref.current.style.transform = "translate(0px, 0px)"
    }

    const element = ref.current
    element.addEventListener("mousemove", handleMouseMove)
    element.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      element.removeEventListener("mousemove", handleMouseMove)
      element.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return {
    ref,
    style: {
      transition: "transform 0.3s ease-out",
    },
  }
}
