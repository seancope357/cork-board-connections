import { useState, useMemo } from 'react';
import { X } from 'lucide-react';

interface ConnectionLineProps {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  onDelete: () => void;
}

export function ConnectionLine({ id, x1, y1, x2, y2, onDelete }: ConnectionLineProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate midpoint for delete button
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Memoize path calculation with stable random control points based on connection ID
  // This prevents the path from changing on every render while keeping it unique per connection
  const pathD = useMemo(() => {
    // Use connection ID to generate stable but seemingly random control points
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomX = ((seed % 80) - 40) * Math.sin(seed);
    const randomY = ((seed % 80) - 40) * Math.cos(seed);

    const controlX = (x1 + x2) / 2 + randomX;
    const controlY = (y1 + y2) / 2 + randomY;

    return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
  }, [id, x1, y1, x2, y2]);

  return (
    <g>
      {/* Invisible thick path for easier hovering */}
      <path
        d={pathD}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        className="pointer-events-auto cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Shadow/depth for the string */}
      {isHovered && (
        <path
          d={pathD}
          stroke="#991b1b"
          strokeWidth="5"
          fill="none"
          opacity="0.3"
          className="pointer-events-none"
        />
      )}

      {/* Visible red string with organic look */}
      <path
        d={pathD}
        stroke={isHovered ? '#dc2626' : '#ef4444'}
        strokeWidth={isHovered ? '3.5' : '2.5'}
        fill="none"
        opacity={isHovered ? '1' : '0.85'}
        strokeLinecap="round"
        className="pointer-events-none transition-all"
        style={{
          filter: isHovered ? 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))' : 'none',
        }}
      />

      {/* Small pins/tacks at connection points when hovered */}
      {isHovered && (
        <>
          <circle cx={x1} cy={y1} r="4" fill="#dc2626" opacity="0.8" className="pointer-events-none" />
          <circle cx={x2} cy={y2} r="4" fill="#dc2626" opacity="0.8" className="pointer-events-none" />
        </>
      )}

      {/* Delete button on hover */}
      {isHovered && (
        <g className="pointer-events-auto cursor-pointer" onClick={onDelete}>
          <circle
            cx={midX}
            cy={midY}
            r="14"
            fill="white"
            stroke="#dc2626"
            strokeWidth="2"
            className="transition-all hover:scale-110"
          />
          <circle cx={midX} cy={midY} r="14" fill="white" opacity="0.9" />
          <foreignObject x={midX - 10} y={midY - 10} width="20" height="20">
            <div className="flex items-center justify-center w-full h-full">
              <X className="w-4 h-4 text-red-600" />
            </div>
          </foreignObject>
        </g>
      )}
    </g>
  );
}
