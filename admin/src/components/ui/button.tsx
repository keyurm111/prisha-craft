import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 luxury-shadow transition-all duration-300 active:scale-95",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm transition-all duration-300 active:scale-95",
      outline: "border-2 border-primary/10 bg-transparent hover:bg-primary hover:text-primary-foreground transition-all duration-300 active:scale-95",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
      glass: "bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 transition-all duration-300",
    }
    
    const sizes = {
      default: "h-14 px-8 rounded-full text-[13px] font-black uppercase tracking-widest",
      sm: "h-11 rounded-full px-6 text-xs font-black uppercase tracking-wider",
      lg: "h-16 rounded-full px-12 text-sm font-black uppercase tracking-[0.2em]",
      icon: "h-12 w-12 rounded-full flex items-center justify-center",
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
