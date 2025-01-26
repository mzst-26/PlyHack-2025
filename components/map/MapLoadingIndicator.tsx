interface MapLoadingIndicatorProps {
  isLoading: boolean;
  progress: number;
  countryCount: number;
}

export function MapLoadingIndicator({ isLoading, progress, countryCount }: MapLoadingIndicatorProps) {
  return (
    <div 
      className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md"
    >
      {isLoading ? (
        <div>
          Loading... {progress}%
          <div className="w-24 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div>Countries colored: {countryCount}</div>
      )}
    </div>
  );
} 