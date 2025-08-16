import React from 'react';

interface QRCodeGeneratorProps {
  data: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  data, // This represents the data that would be encoded in a real QR code
  size = 40, 
  style = {}, 
  className = '' 
}) => {
  // Generate a simple hash from the data to create unique patterns
  const generateHash = (str: string): number => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  // Create unique pattern based on data
  const hash = generateHash(data || 'default');
  const patternSeed = hash % 1000000; // Use hash to create unique patterns
  
  console.debug('QR Code data:', data, 'Hash:', hash, 'Pattern seed:', patternSeed);
  
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: '#FFFFFF',
        borderRadius: '2px',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      className={className}
    >
      {/* QR Code Pattern - Top left corner square */}
      <div style={{
        position: 'absolute',
        top: '2px',
        left: '2px',
        width: '12px',
        height: '12px',
        backgroundColor: '#000000',
        border: '1px solid #FFFFFF'
      }}>
        <div style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          width: '6px',
          height: '6px',
          backgroundColor: '#FFFFFF'
        }}>
          <div style={{
            position: 'absolute',
            top: '1px',
            left: '1px',
            width: '4px',
            height: '4px',
            backgroundColor: '#000000'
          }} />
        </div>
      </div>

      {/* QR Code Pattern - Top right corner square */}
      <div style={{
        position: 'absolute',
        top: '2px',
        right: '2px',
        width: '12px',
        height: '12px',
        backgroundColor: '#000000',
        border: '1px solid #FFFFFF'
      }}>
        <div style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          width: '6px',
          height: '6px',
          backgroundColor: '#FFFFFF'
        }}>
          <div style={{
            position: 'absolute',
            top: '1px',
            left: '1px',
            width: '4px',
            height: '4px',
            backgroundColor: '#000000'
          }} />
        </div>
      </div>

      {/* QR Code Pattern - Bottom left corner square */}
      <div style={{
        position: 'absolute',
        bottom: '2px',
        left: '2px',
        width: '12px',
        height: '12px',
        backgroundColor: '#000000',
        border: '1px solid #FFFFFF'
      }}>
        <div style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          width: '6px',
          height: '6px',
          backgroundColor: '#FFFFFF'
        }}>
          <div style={{
            position: 'absolute',
            top: '1px',
            left: '1px',
            width: '4px',
            height: '4px',
            backgroundColor: '#000000'
          }} />
        </div>
      </div>

      {/* Dynamic data pattern dots based on unique pattern seed */}
      {(() => {
        const dots = [];
        const gridSize = Math.floor(size / 4); // Dynamic grid based on QR size
        const startPos = 16; // Start after corner squares
        const endPos = size - 16; // End before corner squares
        
        // Use pattern seed to determine which dots to show
        for (let y = startPos; y < endPos; y += 4) {
          for (let x = 4; x < size - 4; x += 4) {
            // Skip areas where corner squares are
            if ((x < 16 && y < 16) || (x > size - 16 && y < 16) || (x < 16 && y > size - 16)) continue;
            
            // Use hash and position to determine if dot should be visible
            const dotSeed = (patternSeed + x * 7 + y * 11) % 100;
            const shouldShow = dotSeed > 40; // Show ~60% of dots
            
            if (shouldShow) {
              dots.push(
                <div 
                  key={`dot-${x}-${y}`}
                  style={{
                    position: 'absolute',
                    top: `${y}px`,
                    left: `${x}px`,
                    width: '2px',
                    height: '2px',
                    backgroundColor: '#000000'
                  }} 
                />
              );
            }
          }
        }
        return dots;
      })()}
    </div>
  );
};