import React, { useRef, useEffect, useState } from 'react';
import { calculateClothingTransform } from '../../utils/poseCalculations';

const TryOnCanvas = ({ 
  poseLandmarker, 
  videoRef, 
  isActive, 
  clothingItem, 
  scaleAdjustment,
  showLandmarks
}) => {
  const canvasRef = useRef(null);
  const [clothingImage, setClothingImage] = useState(null);
  const requestRef = useRef();

  // Load clothing image
  useEffect(() => {
    if (clothingItem?.src) {
      const img = new Image();
      img.src = clothingItem.src;
      img.onload = () => setClothingImage(img);
    } else {
      setClothingImage(null);
    }
  }, [clothingItem]);

  const renderLoop = () => {
    if (!isActive || !videoRef.current || !canvasRef.current || !poseLandmarker) {
      requestRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Ensure video is playing and has dimensions
    if (video.readyState >= 2 && video.videoWidth > 0) {
      // Match canvas size to video aspect ratio
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Draw video frame
      ctx.save();
      // If using front camera, mirror the image horizontally
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Detect poses
      let results = null;
      try {
         // startTimeMs must be increasing. performance.now() works well.
         results = poseLandmarker.detectForVideo(video, performance.now());
      } catch(e) {
         console.warn("Detection error", e);
      }

      if (results && results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0]; // Get first person

        // Draw clothing overlay
        if (clothingImage) {
          const transform = calculateClothingTransform(
            landmarks, 
            clothingItem.type || 'top', 
            canvas.width, 
            canvas.height,
            scaleAdjustment
          );

          if (transform) {
            ctx.save();
            ctx.translate(transform.x, transform.y);
            // Counter-rotate the image if the person leans, but since we mirrored the canvas,
            // the angle needs to be adjusted.
            ctx.rotate(-transform.rotation); 
            ctx.drawImage(
              clothingImage, 
              -transform.width / 2, 
              -transform.height / 2, 
              transform.width, 
              transform.height
            );
            ctx.restore();
          }
        }

        // Draw debug landmarks
        if (showLandmarks) {
          ctx.fillStyle = '#00D9FF';
          for (let i = 0; i < landmarks.length; i++) {
            const lm = landmarks[i];
            if (lm.visibility > 0.5) {
              ctx.beginPath();
              ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }
      }
      ctx.restore();
    }

    requestRef.current = requestAnimationFrame(renderLoop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive, poseLandmarker, clothingImage, scaleAdjustment, showLandmarks]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full object-cover rounded-xl"
    />
  );
};

export default TryOnCanvas;
