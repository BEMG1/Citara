interface StyleTransitionLoaderProps {
  isVisible: boolean;
}

export function StyleTransitionLoader({ isVisible }: StyleTransitionLoaderProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-md transition-opacity duration-300">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-t-transparent border-[color:var(--accent)] rounded-full animate-spin"></div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Aplicando formato...</span>
      </div>
    </div>
  );
}
