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
        strokeWidth="24"
        fill="none"
        className="pointer-events-auto cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Outer glow effect */}
      {isHovered && (
        <path
          d={pathD}
          stroke="#f43f5e"
          strokeWidth="8"
          fill="none"
          opacity="0.2"
          className="pointer-events-none"
          style={{ filter: 'blur(4px)' }}
        />
      )}

      {/* Shadow layer */}
      <path
        d={pathD}
        stroke="#94a3b8"
        strokeWidth={isHovered ? '4' : '3'}
        fill="none"
        opacity="0.15"
        strokeLinecap="round"
        className="pointer-events-none transition-all"
        transform="translate(1, 2)"
      />

      {/* Modern gradient connection line */}
      <defs>
        <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isHovered ? '#f43f5e' : '#ec4899'} />
          <stop offset="100%" stopColor={isHovered ? '#ec4899' : '#f43f5e'} />
        </linearGradient>
      </defs>

      <path
        d={pathD}
        stroke={`url(#gradient-${id})`}
        strokeWidth={isHovered ? '4' : '3'}
        fill="none"
        opacity={isHovered ? '1' : '0.9'}
        strokeLinecap="round"
        className="pointer-events-none transition-all duration-200"
        style={{
          filter: isHovered ? 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.5))' : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
        }}
      />

      {/* Connection point indicators */}
      {isHovered && (
        <>
          <circle cx={x1} cy={y1} r="6" fill="#f43f5e" opacity="0.3" className="pointer-events-none animate-pulse" />
          <circle cx={x1} cy={y1} r="4" fill="#f43f5e" className="pointer-events-none" />
          <circle cx={x2} cy={y2} r="6" fill="#f43f5e" opacity="0.3" className="pointer-events-none animate-pulse" />
          <circle cx={x2} cy={y2} r="4" fill="#f43f5e" className="pointer-events-none" />
        </>
      )}

      {/* Modern delete button */}
      {isHovered && (
        <g className="pointer-events-auto cursor-pointer" onClick={onDelete}>
          {/* Button shadow */}
          <circle
            cx={midX}
            cy={midY + 1}
            r="16"
            fill="#64748b"
            opacity="0.2"
            className="pointer-events-none"
          />
          {/* Button background */}
          <circle
            cx={midX}
            cy={midY}
            r="16"
            fill="white"
            className="transition-all hover:scale-110"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))' }}
          />
          {/* Icon container */}
          <foreignObject x={midX - 12} y={midY - 12} width="24" height="24">
            <div className="flex items-center justify-center w-full h-full">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center transition-transform hover:scale-110">
                <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </div>
            </div>
          </foreignObject>
        </g>
      )}
    </g>
  );
}
