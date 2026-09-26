import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-ads';
// @ts-ignore
import 'videojs-ima';
import 'videojs-ima/dist/videojs.ima.css';
import { api } from '../../api';
import { Play, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Video, ShieldCheck } from 'lucide-react';

interface AdcashRewardedVideoPlayerProps {
  opportunityId?: string;
  onClose?: () => void;
  onRewardClaimed?: () => void;
}

/**
 * AdcashRewardedVideoPlayer Component
 *
 * Implements the responsive Video.js player with Adcash In-Stream VAST ad tag
 * (https://youradexchange.com/video/select.php?r=12224982) and Google IMA SDK integration.
 *
 * INVARIANTS:
 * - Mounted only when user intentionally starts a rewarded video session.
 * - 16:9 aspect ratio, mobile-first, no horizontal overflow.
 * - Client completion reports to server, but wallet crediting is strictly authoritative & server-side.
 */
export const AdcashRewardedVideoPlayer: React.FC<AdcashRewardedVideoPlayerProps> = ({
  opportunityId,
  onClose,
  onRewardClaimed,
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  const [step, setStep] = useState<'loading_session' | 'ready_to_play' | 'playing' | 'verifying' | 'completed' | 'pending_verification' | 'error'>('loading_session');
  const [sessionData, setSessionData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [imaLoaded, setImaLoaded] = useState(false);

  // 1. Initialize session on mount
  useEffect(() => {
    let isMounted = true;
    if (!opportunityId) {
      setErrorMessage('No reward opportunity specified.');
      setStep('error');
      return;
    }

    api
      .startRewardedVideoSession(opportunityId)
      .then((res) => {
        if (isMounted) {
          setSessionData(res);
          setStep('ready_to_play');
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to start rewarded video session.');
          setStep('error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [opportunityId]);

  // 2. Load Google IMA SDK script for VAST ad tag playback
  useEffect(() => {
    if (document.getElementById('google-ima-sdk')) {
      setImaLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-ima-sdk';
    script.src = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';
    script.async = true;
    script.onload = () => setImaLoaded(true);
    script.onerror = () => {
      // Even if IMA SDK fails to load, allow player fallback or display graceful state
      setImaLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // 3. Initialize Video.js when ready to play and IMA is loaded
  useEffect(() => {
    if (step !== 'playing' || !videoRef.current) return;

    // Ensure video element exists
    const videoElement = document.createElement('video');
    videoElement.id = 'my-video';
    videoElement.className = 'video-js vjs-default-skin vjs-big-play-centered w-full h-full object-cover';
    videoElement.playsInline = true;
    videoElement.muted = false;

    // Clear container and append video element
    if (videoRef.current) {
      videoRef.current.innerHTML = '';
      videoRef.current.appendChild(videoElement);
    }

    const adTagUrl = sessionData?.metadata?.adTagUrl || 'https://youradexchange.com/video/select.php?r=12225346';

    const player = videojs(videoElement, {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      aspectRatio: '16:9',
      sources: [
        {
          src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          type: 'video/mp4',
        },
      ],
    }, () => {
      playerRef.current = player;

      // Initialize IMA plugin if available
      try {
        if (typeof (player as any).ima === 'function') {
          (player as any).ima({
            adTagUrl,
            id: 'my-video',
            showCountdown: true,
          });

          // Initialize IMA ad display container on user interaction
          const startAdDisplayContainer = () => {
            if ((player as any).ima && typeof (player as any).ima.initializeAdDisplayContainer === 'function') {
              (player as any).ima.initializeAdDisplayContainer();
            }
            window.removeEventListener('click', startAdDisplayContainer);
          };
          window.addEventListener('click', startAdDisplayContainer);
        }
      } catch (e) {
        console.warn('IMA initialization notice:', e);
      }
    });

    player.on('ended', () => {
      handleVideoCompletion();
    });

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch (e) {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [step, sessionData, imaLoaded]);

  const handleStartPlayback = () => {
    setStep('playing');
  };

  const handleVideoCompletion = async () => {
    if (!sessionData) return;
    setStep('completed');
  };

  return (
    <div className="bg-zinc-900 text-white rounded-3xl overflow-hidden shadow-xl border border-zinc-800 max-w-xl mx-auto w-full">
      {/* Header bar */}
      <div className="px-5 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Sponsored Ad</h4>
            <p className="text-[11px] text-zinc-400">Adcash In-Stream ADVERTISEMENT</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 space-y-4">
        {step === 'loading_session' && (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
            <p className="text-sm font-medium text-zinc-300">Loading advertisement…</p>
          </div>
        )}

        {step === 'ready_to_play' && (
          <div className="space-y-5 text-center py-6">
            <div className="w-16 h-16 rounded-3xl bg-purple-600/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto shadow-inner">
              <Play className="w-8 h-8 fill-current ml-1 text-purple-400" />
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="text-lg font-extrabold text-white">ADVERTISEMENT</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Please watch this sponsored advertisement to support Swift Earn.
              </p>
            </div>

            <button
              onClick={handleStartPlayback}
              className="w-full max-w-sm mx-auto py-3.5 px-6 rounded-2xl bg-[#6C2BD9] hover:bg-[#5821B0] active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Advertisement</span>
            </button>
          </div>
        )}

        {step === 'playing' && (
          <div className="space-y-3">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-zinc-800 shadow-2xl flex items-center justify-center">
              <div ref={videoRef} className="w-full h-full" />
            </div>
            <div className="flex items-center justify-center text-xs text-zinc-500 px-1 font-bold">
              ADVERTISEMENT
            </div>
          </div>
        )}

        {step === 'completed' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">Ad Finished</h3>
              <p className="text-xs text-zinc-300">Thank you for watching the advertisement.</p>
            </div>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all"
              >
                Return to Earn
              </button>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">Ad Unavailable</h3>
              <p className="text-xs text-rose-300">No advertisement available right now. Please try again later.</p>
            </div>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all"
              >
                Return to Earn
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
