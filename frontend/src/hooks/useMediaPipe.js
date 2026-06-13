import { useState, useEffect, useRef } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

export const useMediaPipe = () => {
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initializeMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });

        if (isMounted) {
          setPoseLandmarker(landmarker);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to initialize MediaPipe:", err);
        if (isMounted) {
          setError(err.message || "Failed to load AI model");
          setIsLoading(false);
        }
      }
    };

    initializeMediaPipe();

    return () => {
      isMounted = false;
      if (poseLandmarker) {
        poseLandmarker.close();
      }
    };
  }, []);

  return { poseLandmarker, isLoading, error };
};
