
import { useToast as useToastHook, toast as toastFunction } from "@/hooks/use-toast";

// Re-export the hooks with aliases to prevent naming conflicts
export const useToast = useToastHook;
export const toast = toastFunction;
