import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { PawPrint, Cat, Dog, Bird } from "lucide-react";
import { useState } from "react";

interface PetAvatarProps {
  src?: string | null;
  fallback?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  petType?: string;
}

export function PetAvatar({
  src,
  fallback,
  className,
  size = "md",
  petType = "pet",
}: PetAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  // دالة لتحديد الأيقونة بناءً على نوع الحيوان
  const getFallbackIcon = () => {
    const iconClass = `${iconSizes[size]} text-muted-foreground`;
    switch (petType.toLowerCase()) {
      case "cat":
        return <Cat className={iconClass} />;
      case "dog":
        return <Dog className={iconClass} />;
      case "bird":
        return <Bird className={iconClass} />;
      default:
        return <PawPrint className={iconClass} />;
    }
  };

  // تحسين رابط الصورة بناءً على الحجم
  const optimizedSrc = src
    ? `${src}?w=${size === "sm" ? 32 : size === "md" ? 40 : size === "lg" ? 64 : 96}&q=75`
    : undefined;

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ""}`}>
      {src && !imageError ? (
        <AvatarImage
          src={optimizedSrc}
          alt={`${fallback || petType} photo`}
          loading="lazy" // إضافة التحميل الكسول
          onError={() => {
            setImageError(true); // تحديث الحالة عند فشل تحميل الصورة
          }}
          className="object-cover" // ضمان تغطية الصورة بشكل صحيح
        />
      ) : null}
      <AvatarFallback className="bg-muted flex items-center justify-center">
        {fallback && !imageError ? (
          <span className="text-muted-foreground">
            {fallback.charAt(0).toUpperCase()}
          </span>
        ) : (
          getFallbackIcon()
        )}
      </AvatarFallback>
    </Avatar>
  );
}