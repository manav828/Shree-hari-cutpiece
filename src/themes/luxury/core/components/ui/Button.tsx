import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  href?: string;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  href,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = variant === "primary" ? "btn-primary" : "btn-secondary";

  if (href) {
    return (
      <Link href={href} className={cn(baseStyles, className)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cn(baseStyles, className)} {...props}>
      {children}
    </button>
  );
}
