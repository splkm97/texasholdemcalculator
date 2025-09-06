/**
 * Performance optimization utilities for the poker calculator
 */

import { useCallback, useMemo, useRef } from 'react'

// Debounce utility for expensive operations
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }) as T
}

// Throttle utility for frequent operations
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T {
  let inThrottle = false
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, delay)
    }
  }) as T
}

// Memoization cache for expensive calculations
class MemoCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>()
  private maxSize: number
  private ttl: number // time to live in milliseconds
  
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutes default
    this.maxSize = maxSize
    this.ttl = ttl
  }
  
  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    
    if (!entry) return undefined
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return undefined
    }
    
    return entry.value
  }
  
  set(key: string, value: T): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  size(): number {
    return this.cache.size
  }
}

// Global calculation cache
export const calculationCache = new MemoCache<any>(200, 10 * 60 * 1000) // 10 minutes

// Create a memoized calculation key from request
export function createCalculationKey(request: any): string {
  return JSON.stringify({
    playerHand: request.playerHand?.map((c: any) => c?.id).sort(),
    communityCards: request.communityCards?.map((c: any) => c?.id).filter(Boolean).sort(),
    stage: request.stage,
    method: request.preferredMethod
  })
}

// React hooks for performance optimization

// Debounced callback hook
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T {
  const callbackRef = useRef<T>(callback)
  callbackRef.current = callback
  
  return useCallback(
    debounce((...args: Parameters<T>) => callbackRef.current(...args), delay),
    deps
  ) as T
}

// Throttled callback hook
export function useThrottledCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T {
  const callbackRef = useRef<T>(callback)
  callbackRef.current = callback
  
  return useCallback(
    throttle((...args: Parameters<T>) => callbackRef.current(...args), delay),
    deps
  ) as T
}

// Memoized calculation hook
export function useMemoizedCalculation<T, K>(
  calculator: (key: K) => T,
  key: K,
  deps: React.DependencyList = []
): T {
  return useMemo(() => {
    const cacheKey = JSON.stringify(key)
    const cached = calculationCache.get(cacheKey)
    
    if (cached !== undefined) {
      return cached
    }
    
    const result = calculator(key)
    calculationCache.set(cacheKey, result)
    
    return result
  }, [key, ...deps])
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>()
  private maxSamples = 100
  
  measure<T>(name: string, operation: () => T): T {
    const start = performance.now()
    
    try {
      const result = operation()
      this.recordMetric(name, performance.now() - start)
      return result
    } catch (error) {
      this.recordMetric(name, performance.now() - start, true)
      throw error
    }
  }
  
  async measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const start = performance.now()
    
    try {
      const result = await operation()
      this.recordMetric(name, performance.now() - start)
      return result
    } catch (error) {
      this.recordMetric(name, performance.now() - start, true)
      throw error
    }
  }
  
  private recordMetric(name: string, duration: number, error = false): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const samples = this.metrics.get(name)!
    samples.push(duration)
    
    // Keep only the latest samples
    if (samples.length > this.maxSamples) {
      samples.shift()
    }
    
    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms${error ? ' (failed)' : ''}`)
    }
  }
  
  getMetrics(name: string): { avg: number; min: number; max: number; count: number } | null {
    const samples = this.metrics.get(name)
    
    if (!samples || samples.length === 0) {
      return null
    }
    
    const sum = samples.reduce((a, b) => a + b, 0)
    
    return {
      avg: sum / samples.length,
      min: Math.min(...samples),
      max: Math.max(...samples),
      count: samples.length
    }
  }
  
  getAllMetrics(): Record<string, ReturnType<typeof this.getMetrics>> {
    const result: Record<string, ReturnType<typeof this.getMetrics>> = {}
    
    for (const name of this.metrics.keys()) {
      result[name] = this.getMetrics(name)
    }
    
    return result
  }
  
  clearMetrics(): void {
    this.metrics.clear()
  }
}

// Global performance monitor
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const measureCallback = useCallback(<T>(name: string, operation: () => T): T => {
    return performanceMonitor.measure(name, operation)
  }, [])
  
  const measureAsyncCallback = useCallback(async <T>(name: string, operation: () => Promise<T>): Promise<T> => {
    return performanceMonitor.measureAsync(name, operation)
  }, [])
  
  const getMetrics = useCallback((name?: string) => {
    return name ? performanceMonitor.getMetrics(name) : performanceMonitor.getAllMetrics()
  }, [])
  
  return {
    measure: measureCallback,
    measureAsync: measureAsyncCallback,
    getMetrics,
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor)
  }
}

// Image lazy loading utility
export function createImageLoader() {
  const loadedImages = new Set<string>()
  
  return {
    preloadImage: (src: string): Promise<void> => {
      if (loadedImages.has(src)) {
        return Promise.resolve()
      }
      
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          loadedImages.add(src)
          resolve()
        }
        img.onerror = reject
        img.src = src
      })
    },
    
    isLoaded: (src: string): boolean => {
      return loadedImages.has(src)
    }
  }
}

// Virtual scrolling utility for large lists
export function calculateVirtualScrolling(
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  scrollTop: number,
  overscan = 5
): { startIndex: number; endIndex: number; totalHeight: number } {
  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    totalItems - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight)
  )
  
  const startIndex = Math.max(0, visibleStart - overscan)
  const endIndex = Math.min(totalItems - 1, visibleEnd + overscan)
  
  return {
    startIndex,
    endIndex,
    totalHeight: totalItems * itemHeight
  }
}

// Bundle size optimization - lazy component loader
export function createLazyLoader<T>(loader: () => Promise<{ default: T }>) {
  let componentPromise: Promise<T> | null = null
  
  return {
    load: (): Promise<T> => {
      if (!componentPromise) {
        componentPromise = loader().then(module => module.default)
      }
      return componentPromise
    },
    
    preload: (): void => {
      // Start loading immediately but don't wait
      if (!componentPromise) {
        componentPromise = loader().then(module => module.default)
      }
    }
  }
}