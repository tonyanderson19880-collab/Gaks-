export interface GptRewardedPayload {
  amount?: number;
  type?: string;
}

export interface GptRewardedCallbacks {
  onReady?: (makeVisible: () => void) => void;
  onGranted?: (payload?: GptRewardedPayload) => void;
  onVideoCompleted?: () => void;
  onClosed?: () => void;
  onError?: (errorMsg: string) => void;
}

declare global {
  interface Window {
    googletag?: any;
  }
}

class GptService {
  private scriptLoaded = false;
  private scriptLoadingPromise: Promise<void> | null = null;
  private currentRewardedSlot: any = null;
  private activeListeners: { eventName: string; handler: any }[] = [];

  /**
   * Reads the configured Google Ad Manager rewarded ad unit path from environment variables.
   * e.g. VITE_GOOGLE_AD_MANAGER_REWARDED_UNIT=/YOUR_NETWORK_CODE/YOUR_REWARDED_AD_UNIT
   */
  public getRewardedAdUnitPath(): string | null {
    const envUnit = import.meta.env.VITE_GOOGLE_AD_MANAGER_REWARDED_UNIT;
    if (envUnit && typeof envUnit === 'string' && envUnit.trim().length > 0) {
      return envUnit.trim();
    }
    return null;
  }

  /**
   * Safely loads the official Google Publisher Tag (GPT) JS tag once.
   */
  public async loadGptScript(): Promise<void> {
    if (typeof window === 'undefined') return;

    if (this.scriptLoaded && window.googletag && window.googletag.apiReady) {
      return Promise.resolve();
    }

    if (this.scriptLoadingPromise) {
      return this.scriptLoadingPromise;
    }

    this.scriptLoadingPromise = new Promise((resolve, reject) => {
      window.googletag = window.googletag || { cmd: [] };

      const existingScript = document.querySelector('script[src*="securepubads.g.doubleclick.net/tag/js/gpt.js"]');
      if (existingScript) {
        this.scriptLoaded = true;
        window.googletag.cmd.push(() => resolve());
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
      script.async = true;
      script.onload = () => {
        this.scriptLoaded = true;
        window.googletag.cmd.push(() => resolve());
      };
      script.onerror = () => {
        this.scriptLoadingPromise = null;
        reject(new Error('Failed to load Google Publisher Tag (GPT) script.'));
      };
      document.head.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  /**
   * Defines and initializes a GPT web rewarded slot.
   */
  public initRewardedSlot(
    adUnitPath: string,
    callbacks: GptRewardedCallbacks
  ): void {
    if (!window.googletag) {
      callbacks.onError?.('Google Publisher Tag is not loaded.');
      return;
    }

    window.googletag.cmd.push(() => {
      try {
        this.cleanup();

        const googletag = window.googletag;
        if (!googletag.enums || !googletag.enums.OutOfPageFormat || !googletag.enums.OutOfPageFormat.REWARDED) {
          callbacks.onError?.('GPT Rewarded ad format is not supported in this browser environment.');
          return;
        }

        const rewardedSlot = googletag.defineOutOfPageSlot(
          adUnitPath,
          googletag.enums.OutOfPageFormat.REWARDED
        );

        if (!rewardedSlot) {
          callbacks.onError?.('Failed to define GPT rewarded ad slot for ' + adUnitPath);
          return;
        }

        this.currentRewardedSlot = rewardedSlot;
        rewardedSlot.addService(googletag.pubads());

        const readyHandler = (event: any) => {
          if (event.slot === rewardedSlot) {
            const makeVisible = () => {
              if (typeof event.makeRewardedVisible === 'function') {
                event.makeRewardedVisible();
              }
            };
            callbacks.onReady?.(makeVisible);
          }
        };

        const grantedHandler = (event: any) => {
          if (event.slot === rewardedSlot) {
            callbacks.onGranted?.(event.payload);
          }
        };

        const completedHandler = (event: any) => {
          if (event.slot === rewardedSlot) {
            callbacks.onVideoCompleted?.();
          }
        };

        const closedHandler = (event: any) => {
          if (event.slot === rewardedSlot) {
            callbacks.onClosed?.();
            this.cleanup();
          }
        };

        const pubads = googletag.pubads();
        pubads.addEventListener('rewardedSlotReady', readyHandler);
        pubads.addEventListener('rewardedSlotGranted', grantedHandler);
        pubads.addEventListener('rewardedSlotVideoCompleted', completedHandler);
        pubads.addEventListener('rewardedSlotClosed', closedHandler);

        this.activeListeners.push(
          { eventName: 'rewardedSlotReady', handler: readyHandler },
          { eventName: 'rewardedSlotGranted', handler: grantedHandler },
          { eventName: 'rewardedSlotVideoCompleted', handler: completedHandler },
          { eventName: 'rewardedSlotClosed', handler: closedHandler }
        );

        googletag.enableServices();
        googletag.display(rewardedSlot);
      } catch (err: any) {
        callbacks.onError?.(err?.message || 'Error initializing GPT rewarded slot.');
      }
    });
  }

  /**
   * Destroys current GPT slots and removes active listeners.
   */
  public cleanup(): void {
    if (typeof window === 'undefined' || !window.googletag) return;

    try {
      const googletag = window.googletag;
      if (googletag.pubads) {
        const pubads = googletag.pubads();
        if (pubads && this.activeListeners.length > 0) {
          for (const listener of this.activeListeners) {
            pubads.removeEventListener(listener.eventName, listener.handler);
          }
        }
      }
      this.activeListeners = [];

      if (this.currentRewardedSlot && googletag.destroySlots) {
        googletag.destroySlots([this.currentRewardedSlot]);
        this.currentRewardedSlot = null;
      }
    } catch (err) {
      console.warn('Notice during GPT cleanup:', err);
    }
  }
}

export const gptService = new GptService();
