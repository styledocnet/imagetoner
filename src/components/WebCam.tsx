import React, { useEffect, useRef, useState } from "react";

interface WebcamProps {
  audio?: boolean;
  videoConstraints?: MediaStreamConstraints["video"];
  onCapture: (image: string) => void;
}

const Webcam: React.FC<WebcamProps> = ({
  audio = false,
  videoConstraints,
  onCapture,
}: WebcamProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints || true,
          audio,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Webcam error:", error);
      }
    };

    startWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoConstraints, audio]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL("image/png");
        console.log("Captured Image Data URL:", imageSrc);
        onCapture(imageSrc);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full rounded-md shadow-md"
      />
      <canvas ref={canvasRef} className="hidden"></canvas>
      <button
        onClick={handleCapture}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
      >
        Capture Image
      </button>
    </div>
  );
};

export default Webcam;
