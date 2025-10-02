'use client';

// This component is kept for potential future providers (e.g., ThemeProvider, QueryClientProvider).
// For now, it just renders its children.
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}