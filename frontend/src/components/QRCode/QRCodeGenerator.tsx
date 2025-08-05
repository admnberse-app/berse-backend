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
  // Create a realistic QR code pattern using CSS
  // Note: This is a visual representation. In a real implementation, 
  // the 'data' prop would be used to generate the actual QR pattern
  console.debug('QR Code data:', data);
  
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

      {/* Data pattern dots */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '4px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '8px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '12px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '20px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '24px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />

      <div style={{
        position: 'absolute',
        top: '20px',
        left: '6px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '10px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '18px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '22px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />

      <div style={{
        position: 'absolute',
        top: '24px',
        left: '4px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '12px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '16px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />

      <div style={{
        position: 'absolute',
        top: '28px',
        left: '8px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
      <div style={{
        position: 'absolute',
        top: '28px',
        left: '14px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
      <div style={{
        position: 'absolute',
        top: '28px',
        left: '20px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />

      <div style={{
        position: 'absolute',
        top: '32px',
        left: '6px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
      <div style={{
        position: 'absolute',
        top: '32px',
        left: '10px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
      <div style={{
        position: 'absolute',
        top: '32px',
        left: '18px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
      <div style={{
        position: 'absolute',
        top: '32px',
        left: '26px',
        width: '2px',
        height: '2px',
        backgroundColor: '#000000'
      }} />
    </div>
  );
};