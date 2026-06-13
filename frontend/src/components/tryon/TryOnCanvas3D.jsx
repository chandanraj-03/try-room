import React, { useRef, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Loads a GLTF/GLB model and maps its position to a specific MediaPipe landmark dynamically.
 */
const ClothingModel3D = ({ modelUrl, landmarks, canvasWidth, canvasHeight, scaleAdjustment }) => {
  const { scene } = useGLTF(modelUrl);
  const modelRef = useRef();

  useFrame(() => {
    if (!landmarks || landmarks.length < 25 || !modelRef.current) return;

    // We use the same anchor points as 2D: shoulders and hips
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    if (leftShoulder.visibility < 0.5 || rightShoulder.visibility < 0.5) return;

    // 1. Calculate midpoint of shoulders
    const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    const shoulderMidZ = (leftShoulder.z + rightShoulder.z) / 2;

    // 2. Convert normalized MediaPipe coordinates (0 to 1) to Three.js world coordinates
    // Assuming default Orthographic or Perspective setup where we need to map canvas dimensions
    // For simplicity in a basic setup, we map 0-1 to a fixed viewport range (e.g., -5 to 5)
    // A more robust implementation involves calculating exactly where the 3D plane intersects the camera frustum.
    const viewportWidth = 10; 
    const viewportHeight = 10 * (canvasHeight / canvasWidth);

    // Map X and Y (Note: Y in WebGL is inverted compared to canvas 2D)
    const targetX = (shoulderMidX - 0.5) * viewportWidth;
    const targetY = -(shoulderMidY - 0.5) * viewportHeight; 
    
    // Z from MediaPipe is relative to hips, usually negative means closer to camera
    const targetZ = shoulderMidZ * -10; 

    // Smooth movement using lerp
    modelRef.current.position.lerp(new THREE.Vector3(targetX, targetY - 1.5, targetZ), 0.3);

    // 3. Calculate Scale based on shoulder width
    const shoulderDist = Math.sqrt(
      Math.pow(rightShoulder.x - leftShoulder.x, 2) + 
      Math.pow(rightShoulder.y - leftShoulder.y, 2)
    );
    const baseScale = shoulderDist * viewportWidth * 0.8 * scaleAdjustment;
    modelRef.current.scale.lerp(new THREE.Vector3(baseScale, baseScale, baseScale), 0.3);

    // 4. Calculate Rotation based on shoulder tilt and body turn
    // Y-axis rotation (turning body left/right)
    const turnAngleY = Math.atan2(rightShoulder.z - leftShoulder.z, rightShoulder.x - leftShoulder.x);
    // Z-axis rotation (tilting shoulders)
    const tiltAngleZ = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x);

    const targetRotation = new THREE.Euler(0, -turnAngleY, -tiltAngleZ);
    // We can't lerp Euler directly easily without Quaternion
    const currentQuat = new THREE.Quaternion().copy(modelRef.current.quaternion);
    const targetQuat = new THREE.Quaternion().setFromEuler(targetRotation);
    currentQuat.slerp(targetQuat, 0.2);
    modelRef.current.quaternion.copy(currentQuat);
  });

  return <primitive object={scene} ref={modelRef} />;
};

const TryOnCanvas3D = ({ 
  poseLandmarker, 
  videoRef, 
  isActive, 
  clothingItem, 
  scaleAdjustment,
  showLandmarks
}) => {
  const [landmarks, setLandmarks] = useState(null);
  const containerRef = useRef(null);
  const requestRef = useRef();

  // Detection loop
  const renderLoop = () => {
    if (!isActive || !videoRef.current || !poseLandmarker) {
      requestRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const video = videoRef.current;
    if (video.readyState >= 2 && video.videoWidth > 0) {
      try {
         const results = poseLandmarker.detectForVideo(video, performance.now());
         if (results && results.landmarks && results.landmarks.length > 0) {
           setLandmarks(results.landmarks[0]);
         } else {
           setLandmarks(null);
         }
      } catch(e) {
         console.warn("Detection error", e);
      }
    }
    requestRef.current = requestAnimationFrame(renderLoop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive, poseLandmarker]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-10 pointer-events-none">
      {/* 
        This is a 3D overlay. The video element is rendered independently behind this.
        We use OrthographicCamera to easily map 2D coordinates to 3D space.
      */}
      {clothingItem?.model3D && (
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="city" />
          
          <Suspense fallback={null}>
            <ClothingModel3D 
              modelUrl={clothingItem.model3D} 
              landmarks={landmarks}
              canvasWidth={containerRef.current?.clientWidth || 800}
              canvasHeight={containerRef.current?.clientHeight || 600}
              scaleAdjustment={scaleAdjustment}
            />
          </Suspense>
          
          <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
        </Canvas>
      )}

      {/* Render 2D landmarks for debug if requested */}
      {showLandmarks && landmarks && (
        <div className="absolute inset-0 pointer-events-none">
          {landmarks.map((lm, i) => (
             lm.visibility > 0.5 && (
              <div 
                key={i}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                style={{
                  left: `${lm.x * 100}%`,
                  top: `${lm.y * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
             )
          ))}
        </div>
      )}
    </div>
  );
};

export default TryOnCanvas3D;
