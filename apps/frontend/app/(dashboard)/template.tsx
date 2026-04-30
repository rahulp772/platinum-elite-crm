// Template file for route-specific state
// This component re-renders on each navigation to a route in this group

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  // This component can be used for:
  // - Analytics tracking on route change
  // - Resetting form states when navigating
  // - Adding transition animations between routes
  return <>{children}</>
}