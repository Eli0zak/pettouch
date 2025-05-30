
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { User } from "lucide-react";

interface UserAvatarProps {
  src?: string | null;
  fallback?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ src, fallback = "U", className, size = "md" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ""}`}>
      <AvatarImage src={src || undefined} alt="Avatar" onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
      }} />
      <AvatarFallback className="bg-muted text-muted-foreground">
        {fallback ? fallback.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}
