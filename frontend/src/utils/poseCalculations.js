/**
 * Utilities for calculating clothing placement based on MediaPipe landmarks.
 * Landmarks used:
 * 11: left_shoulder
 * 12: right_shoulder
 * 23: left_hip
 * 24: right_hip
 */

// Calculate distance between two points
const distance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Calculate midpoint between two points
const midpoint = (p1, p2) => {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
        z: (p1.z + p2.z) / 2
    };
};

export const calculateClothingTransform = (landmarks, clothingType, canvasWidth, canvasHeight, scaleAdjustment = 1.0) => {
    if (!landmarks || landmarks.length < 25) return null;

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Ensure all required points are visible enough
    const minVisibility = 0.5;
    if (leftShoulder.visibility < minVisibility || rightShoulder.visibility < minVisibility || 
        leftHip.visibility < minVisibility || rightHip.visibility < minVisibility) {
        return null;
    }

    const shoulderMidpoint = midpoint(leftShoulder, rightShoulder);
    const hipMidpoint = midpoint(leftHip, rightHip);

    // Calculate physical dimensions in normalized coordinates (0-1)
    const normalizedShoulderWidth = distance(leftShoulder, rightShoulder);
    const normalizedTorsoHeight = distance(shoulderMidpoint, hipMidpoint);

    // Calculate angle of the torso (shoulders relative to hips)
    const dx = rightShoulder.x - leftShoulder.x;
    const dy = rightShoulder.y - leftShoulder.y;
    // Base angle is the tilt of the shoulders. 
    // We add/subtract depending on mirroring if needed, but normally:
    let angleRad = Math.atan2(dy, dx); 
    
    // We expect shoulders to be roughly horizontal. If the person leans left/right,
    // dx and dy change. The image needs to be rotated by this angle.

    // Convert normalized dimensions to pixel dimensions based on canvas size
    const pixelShoulderWidth = normalizedShoulderWidth * canvasWidth;
    const pixelTorsoHeight = normalizedTorsoHeight * canvasHeight;

    // Default top (t-shirt, jacket) parameters
    let targetWidth = pixelShoulderWidth * 1.5 * scaleAdjustment; // 1.5x shoulder width for sleeves/drape
    let targetHeight = pixelTorsoHeight * 1.3 * scaleAdjustment;  // Extend past hips slightly

    // Center point for the image
    let centerX = shoulderMidpoint.x * canvasWidth;
    // Shift Y down slightly so collar aligns with shoulders, not middle of image
    let centerY = shoulderMidpoint.y * canvasHeight + (targetHeight * 0.25);

    if (clothingType === 'dress') {
        targetHeight = pixelTorsoHeight * 2.2 * scaleAdjustment; // Longer for a dress
        centerY = shoulderMidpoint.y * canvasHeight + (targetHeight * 0.35);
    }

    return {
        x: centerX,
        y: centerY,
        width: targetWidth,
        height: targetHeight,
        rotation: angleRad
    };
};
