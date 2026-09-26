import {
  RewardedVideoProvider,
  RewardedVideoSessionParams,
  RewardedVideoSessionResult,
  RewardedVideoStatusResult,
  RewardedVideoCompletionParams,
  RewardedVideoCallbackParams,
  RewardedVideoVerificationResult,
} from './RewardedVideoProvider.js';
import { DemoRewardedVideoProvider } from './providers/DemoRewardedVideoProvider.js';

/**
 * RewardedVideoService
 *
 * Central coordinator for Rewarded Video providers in Swift Earn.
 * Handles provider resolution, environment security guards, session management,
 * and server-side verification.
 */
export class RewardedVideoService {
  private static instance: RewardedVideoService;
  private providers: Map<string, RewardedVideoProvider> = new Map();
  private defaultProviderName: string = 'demo_rewarded_video';

  private constructor() {
    this.registerProvider(new DemoRewardedVideoProvider());
  }

  public static getInstance(): RewardedVideoService {
    if (!RewardedVideoService.instance) {
      RewardedVideoService.instance = new RewardedVideoService();
    }
    return RewardedVideoService.instance;
  }

  public registerProvider(provider: RewardedVideoProvider): void {
    this.providers.set(provider.providerName, provider);
  }

  /**
   * Resolves the configured provider based on the REWARDED_VIDEO_PROVIDER environment variable.
   * If in production and no certified provider is configured, safely returns null / throws.
   */
  public getProvider(providerName?: string): RewardedVideoProvider | null {
    const isProduction = process.env.NODE_ENV === 'production';
    const allowDemo = process.env.ALLOW_DEMO_REWARDS === 'true';

    // In production, require explicit provider configuration or allowDemo flag
    const configuredName =
      providerName ||
      process.env.REWARDED_VIDEO_PROVIDER ||
      (!isProduction || allowDemo ? this.defaultProviderName : '');

    if (!configuredName) {
      return null;
    }

    const provider = this.providers.get(configuredName);
    if (!provider) {
      return null;
    }

    // Production safety check: Do not allow Demo provider in production unless ALLOW_DEMO_REWARDS is true
    if (provider.isDemo && isProduction && !allowDemo) {
      return null;
    }

    return provider;
  }

  /**
   * Check if a live, active rewarded video provider is currently available to users.
   */
  public isAvailable(): boolean {
    const provider = this.getProvider();
    return provider !== null;
  }

  public async startSession(
    params: RewardedVideoSessionParams,
    providerName?: string
  ): Promise<RewardedVideoSessionResult> {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(
        'Rewarded video service is currently unavailable. No verified provider is active.'
      );
    }
    return provider.createSession(params);
  }

  public async getStatus(
    sessionId: string,
    providerName?: string
  ): Promise<RewardedVideoStatusResult> {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error('Rewarded video service is currently unavailable.');
    }
    return provider.getStatus(sessionId);
  }

  public async verifyCompletion(
    params: RewardedVideoCompletionParams,
    providerName?: string
  ): Promise<RewardedVideoVerificationResult> {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error('Rewarded video service is currently unavailable.');
    }
    return provider.verifyCompletion(params);
  }

  public async processCallback(
    params: RewardedVideoCallbackParams
  ): Promise<RewardedVideoVerificationResult> {
    const provider = this.getProvider(params.providerName);
    if (!provider) {
      throw new Error(
        `Unable to process callback: Provider ${params.providerName} not found or inactive.`
      );
    }
    return provider.processCallback(params);
  }
}

export const rewardedVideoService = RewardedVideoService.getInstance();
