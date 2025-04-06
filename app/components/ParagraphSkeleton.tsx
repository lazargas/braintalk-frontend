import Skeleton from './Skeleton';

interface ParagraphSkeletonProps {
  lines?: number;
  className?: string;
}

export default function ParagraphSkeleton({ 
  lines = 5, 
  className = '' 
}: ParagraphSkeletonProps) {
  // Create an array of line types with varying widths
  const lineTypes = ['medium', 'long', 'long', 'short', 'medium', 'long', 'medium', 'short'];
  
  return (
    <div className={`skeleton-paragraph ${className}`}>
      {Array.from({ length: lines }).map((_, index) => {
        // Cycle through line types
        const lineType = lineTypes[index % lineTypes.length];
        
        return (
          <Skeleton 
            key={index}
            height="16px"
            className={`skeleton-line ${lineType}`}
            borderRadius="4px"
          />
        );
      })}
    </div>
  );
}