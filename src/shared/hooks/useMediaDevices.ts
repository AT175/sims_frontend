import { useRef, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';

export interface MediaStreamState {
  stream: MediaStream | null;
  cameraOn: boolean;
  micOn: boolean;
  error: string | null;
  toggleCamera: () => Promise<void>;
  toggleMic: () => Promise<void>;
  stopAll: () => void;
}

/**
 * Platform-aware hook for camera and microphone access.
 * On web: uses navigator.mediaDevices.getUserMedia()
 * On native: returns a simulated state (real native support requires react-native-webrtc)
 */
export function useMediaDevices(): MediaStreamState {
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isWeb = Platform.OS === 'web' || typeof navigator !== 'undefined';

  const stopTracks = useCallback((kind?: 'video' | 'audio') => {
    const stream = streamRef.current;
    if (!stream) return;
    stream.getTracks().forEach((track) => {
      if (!kind || track.kind === kind) {
        track.stop();
      }
    });
  }, []);

  const getMediaStream = useCallback(async (video: boolean, audio: boolean): Promise<MediaStream | null> => {
    if (!isWeb || !navigator.mediaDevices?.getUserMedia) {
      setError('Camera/mic not available on this platform. WebRTC support required.');
      return null;
    }
    try {
      const constraints: MediaStreamConstraints = {
        video: video ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } : false,
        audio: audio,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setError(null);
      return stream;
    } catch (e: any) {
      if (e?.name === 'NotAllowedError') {
        setError('Permission denied. Please allow camera and microphone access in your browser settings.');
      } else if (e?.name === 'NotFoundError') {
        setError('No camera or microphone found on this device.');
      } else {
        setError(`Media device error: ${e?.message || 'Unknown error'}`);
      }
      return null;
    }
  }, [isWeb]);

  const toggleCamera = useCallback(async () => {
    if (!cameraOn) {
      // Turn on camera
      const wantAudio = micOn;
      const stream = await getMediaStream(true, wantAudio);
      if (stream) {
        // Stop old stream first
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
        streamRef.current = stream;
        setCameraOn(true);
      }
    } else {
      // Turn off camera only
      stopTracks('video');
      if (streamRef.current) {
        const audioTracks = streamRef.current.getAudioTracks();
        if (audioTracks.length > 0) {
          // Keep audio, just remove video tracks
          const newStream = new MediaStream(audioTracks);
          streamRef.current = newStream;
        } else {
          streamRef.current = null;
        }
      }
      setCameraOn(false);
    }
  }, [cameraOn, micOn, getMediaStream, stopTracks]);

  const toggleMic = useCallback(async () => {
    if (!micOn) {
      // Turn on mic
      const wantVideo = cameraOn;
      const stream = await getMediaStream(wantVideo, true);
      if (stream) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
        streamRef.current = stream;
        setMicOn(true);
      }
    } else {
      // Turn off mic only
      stopTracks('audio');
      if (streamRef.current) {
        const videoTracks = streamRef.current.getVideoTracks();
        if (videoTracks.length > 0) {
          const newStream = new MediaStream(videoTracks);
          streamRef.current = newStream;
        } else {
          streamRef.current = null;
        }
      }
      setMicOn(false);
    }
  }, [micOn, cameraOn, getMediaStream, stopTracks]);

  const stopAll = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
    setMicOn(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    stream: streamRef.current,
    cameraOn,
    micOn,
    error,
    toggleCamera,
    toggleMic,
    stopAll,
  };
}
