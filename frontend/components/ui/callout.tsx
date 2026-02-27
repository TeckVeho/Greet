import * as React from "react"
import { cn } from "@/lib/utils"

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  children: React.ReactNode
}

const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  ({ className, icon = "💡", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "my-4 flex gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-900 transition-colors hover:bg-zinc-100",
          className
        )}
        {...props}
      >
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1">{children}</div>
      </div>
    )
  }
)
Callout.displayName = "Callout"

export { Callout }
