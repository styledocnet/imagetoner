import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";

interface WebcamProps {
  audio: boolean;
  screenshotFormat: string;
  width: number;
  height: number;
}

const Webcam = forwardRef(
  ({ audio, screenshotFormat, width, height }: WebcamProps, ref) => {
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
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      },
    }));

    useEffect(() => {
      const startWebcam = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          videoRef.current!.srcObject = stream;
          streamRef.current = stream;
        } catch (err) {
          console.error("Error accessing webcam: ", err);
        }
      };

      startWebcam();

      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };
    }, []);

    return <video ref={videoRef} autoPlay width={width} height={height} />;
  },
);

export default Webcam;
