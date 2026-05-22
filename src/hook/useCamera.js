import { useRef, useState, useCallback } from "react";

export function useCamera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const startCamera = async (facingMode = "user") => {
    // Stop any existing tracks first to release the hardware camera resource
    if (videoRef.current && videoRef.current.srcObject) {
      const currentStream = videoRef.current.srcObject;
      currentStream.getTracks().forEach((track) => track.stop());
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
    });

    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
    setStream(mediaStream);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const currentStream = videoRef.current.srcObject;
      currentStream.getTracks().forEach((track) => track.stop());
    }
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  const capture = useCallback((isMirrored = true) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    
    if (isMirrored) {
      // Mirror the horizontal axis to match the mirrored display video
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    return canvas.toDataURL("image/png");
  }, []);

  return {
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capture,
  };
}