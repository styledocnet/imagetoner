import React, { forwardRef, useImperativeHandle, useRef, useEffect } from "react";

interface WebcamProps {
  isOpen: boolean;
  audio: boolean;
  screenshotFormat: string;
  width: number;
  height: number;
}

const Webcam = forwardRef(({ isOpen, audio, screenshotFormat, width, height }: WebcamProps, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useImperativeHandle(ref, () => ({
    getScreenshot: () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx && videoRef.current) {
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        return canvas.toDataURL(screenshotFormat);
      }
      return null;
    },
    stopWebcam: () => {
      console.log("stopWebcam()");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    },
  }));

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: audio,
        });
        videoRef.current!.srcObject = stream;
        streamRef.current = stream;
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    };

    if (isOpen) {
      startWebcam();
    }

    return () => {
      console.log("Cleaning up webcam resources...");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isOpen, audio]);

  return isOpen ? <video ref={videoRef} autoPlay width={width} height={height} /> : null;
});

export default Webcam;
