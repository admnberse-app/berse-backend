import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import styled from 'styled-components';
import { Point, Area } from 'react-easy-crop/types';

const CropperOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  flex-direction: column;
  z-index: 10000;
`;

const CropperContainer = styled.div`
  position: relative;
  flex: 1;
  background: #000;
`;

const ControlsContainer = styled.div`
  background: #1a1a1a;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 1px solid #333;
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SliderLabel = styled.label`
  color: white;
  font-size: 14px;
  font-weight: 500;
  min-width: 60px;
`;

const Slider = styled.input`
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #333;
  outline: none;
  border-radius: 2px;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #2fce98;
    cursor: pointer;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #2fce98;
    cursor: pointer;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
`;

const SliderValue = styled.span`
  color: #2fce98;
  font-size: 12px;
  font-weight: 600;
  min-width: 40px;
  text-align: right;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
`;

const CancelButton = styled(Button)`
  background: #333;
  color: white;
  border: 1px solid #555;
  
  &:hover {
    background: #444;
    border-color: #666;
  }
`;

const SaveButton = styled(Button)`
  background: #2fce98;
  color: white;
  border: none;
  
  &:hover {
    background: #26b580;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(47, 206, 152, 0.3);
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
    transform: none;
  }
`;

const PresetButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const PresetButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active }) => $active ? '#2fce98' : '#333'};
  color: white;
  border: 1px solid ${({ $active }) => $active ? '#2fce98' : '#555'};
  
  &:hover {
    background: ${({ $active }) => $active ? '#26b580' : '#444'};
    border-color: ${({ $active }) => $active ? '#26b580' : '#666'};
  }
`;

const InfoText = styled.div`
  color: #999;
  font-size: 12px;
  text-align: center;
  font-style: italic;
`;

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  aspectRatio?: number;
  shape?: 'rect' | 'round';
  title?: string;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  shape = 'rect',
  title = 'Crop Image'
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [currentAspectRatio, setCurrentAspectRatio] = useState(aspectRatio);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onRotationChange = useCallback((rotation: number) => {
    setRotation(rotation);
  }, []);

  const onCropAreaChange = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
      0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleSave = async () => {
    if (croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
        onCropComplete(croppedImage);
        handleClose();
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCurrentAspectRatio(aspectRatio);
    onClose();
  };

  const setAspectRatioPreset = (ratio: number) => {
    setCurrentAspectRatio(ratio);
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <CropperOverlay $isOpen={isOpen}>
      <CropperContainer>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={currentAspectRatio}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onRotationChange={onRotationChange}
          onCropComplete={onCropAreaChange}
          cropShape={shape}
          showGrid={true}
          style={{
            containerStyle: {
              background: '#000'
            }
          }}
        />
      </CropperContainer>

      <ControlsContainer>
        <InfoText>{title}</InfoText>

        <PresetButtons>
          <PresetButton 
            $active={currentAspectRatio === 1}
            onClick={() => setAspectRatioPreset(1)}
          >
            Square (1:1)
          </PresetButton>
          <PresetButton 
            $active={currentAspectRatio === 16/9}
            onClick={() => setAspectRatioPreset(16/9)}
          >
            Wide (16:9)
          </PresetButton>
          <PresetButton 
            $active={currentAspectRatio === 4/3}
            onClick={() => setAspectRatioPreset(4/3)}
          >
            Standard (4:3)
          </PresetButton>
          <PresetButton 
            $active={currentAspectRatio === 3/2}
            onClick={() => setAspectRatioPreset(3/2)}
          >
            Photo (3:2)
          </PresetButton>
        </PresetButtons>

        <SliderContainer>
          <SliderLabel>Zoom</SliderLabel>
          <Slider
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          <SliderValue>{zoom.toFixed(1)}x</SliderValue>
        </SliderContainer>

        <SliderContainer>
          <SliderLabel>Rotate</SliderLabel>
          <Slider
            type="range"
            min={-180}
            max={180}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
          />
          <SliderValue>{rotation}°</SliderValue>
        </SliderContainer>

        <ButtonContainer>
          <CancelButton onClick={handleClose}>
            Cancel
          </CancelButton>
          <SaveButton onClick={handleSave}>
            Save & Crop
          </SaveButton>
        </ButtonContainer>
      </ControlsContainer>
    </CropperOverlay>
  );
};