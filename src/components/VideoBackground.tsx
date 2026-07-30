import { useEffect, useRef } from 'react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4';

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prevX = useRef<number | null>(null);
  const targetTime = useRef(0);
  const isSeeking = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const sensitivity = 0.8;

    const seekToTarget = () => {
      if (!video.duration || Number.isNaN(video.duration)) {
        return;
      }

      if (Math.abs(video.currentTime - targetTime.current) < 0.03) {
        return;
      }

      isSeeking.current = true;
      video.currentTime = targetTime.current;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!video.duration || Number.isNaN(video.duration)) {
        prevX.current = event.clientX;
        return;
      }

      if (prevX.current === null) {
        prevX.current = event.clientX;
        return;
      }

      const delta = event.clientX - prevX.current;
      const timeOffset = (delta / window.innerWidth) * sensitivity * video.duration;
      targetTime.current = Math.min(
        video.duration,
        Math.max(0, targetTime.current + timeOffset),
      );
      prevX.current = event.clientX;

      if (!isSeeking.current) {
        seekToTarget();
      }
    };

    const handleSeeked = () => {
      isSeeking.current = false;
      seekToTarget();
    };

    const handleLoadedMetadata = () => {
      targetTime.current = video.currentTime;
    };

    window.addEventListener('mousemove', handleMouseMove);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 h-full w-full bg-[#FDFEFF]">
      <video
        ref={videoRef}
        className="h-full w-full object-cover object-[70%_center] opacity-80"
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
      />
    </div>
  );
}
