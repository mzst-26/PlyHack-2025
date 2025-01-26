interface MapLoadingIndicatorProps {
  isLoading: boolean;
  progress: number;
  countryCount: number;
}

export function MapLoadingIndicator({ isLoading, progress, countryCount }: MapLoadingIndicatorProps) {
  if (!isLoading && countryCount === 0) return null;

  return (
    <div 
      className={`
        absolute top-4 left-1/2 -translate-x-1/2 
        bg-white p-3 rounded-lg shadow-md
        transition-opacity duration-500
        ${!isLoading && countryCount > 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
    >
      {isLoading ? (
        <div>
          <div className="text-center font-medium mb-1">
            Coloring Countries...
          </div>
          <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-500 text-center mt-1">
            {progress}% ({countryCount} countries)
          </div>
        </div>
      ) : (
        <div className="text-center animate-fade-out">
          {countryCount} Countries Colored
        </div>
      )}
    </div>
  );
} 