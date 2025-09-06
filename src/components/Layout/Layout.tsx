import { ReactNode, memo } from 'react'

interface LayoutProps {
  children: ReactNode
  className?: string
}

export const Layout = memo(function Layout({
  children,
  className = ''
}: LayoutProps) {
  return (
    <div className={`min-h-screen ${className}`}>
      {/* Main Content - Let children handle their own backgrounds */}
      <main className="min-h-screen">
        {children}
      </main>

    </div>
  )
})

export default Layout