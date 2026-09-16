import {
  PaymentProvider,
  PaymentRequestParams,
  PaymentResponse,
  PaymentStatusResponse,
  PaymentVerificationResponse,
  PaymentCallbackResult,
} from './PaymentProvider';

/**
 * Real Payment Provider Implementation (Paystack / Flutterwave Payouts Template).
 * Requires PAYSTACK_SECRET_KEY or FLUTTERWAVE_SECRET_KEY in environment variables.
 * If secret key is absent, gracefully returns an unconfigured status warning.
 */
export class RealPaymentProvider implements PaymentProvider {
  name = 'Paystack / Nigerian Banking Payout Gateway';
  isDemo = false;

  private getSecretKey(): string | null {
    return process.env.PAYSTACK_SECRET_KEY || process.env.FLUTTERWAVE_SECRET_KEY || null;
  }

  async createPayment(params: PaymentRequestParams): Promise<PaymentResponse> {
    const apiKey = this.getSecretKey();

    if (!apiKey) {
      return {
        success: false,
        provider: this.name,
        isDemo: false,
        providerReference: `UNCONFIGURED-${params.reference}`,
        status: 'failed',
        message:
          'Real payment gateway is disabled because secret keys (PAYSTACK_SECRET_KEY) are not configured in environment settings. Please switch to Demo Mode or configure credentials.',
      };
    }

    try {
      // Production API call to Paystack Transfer API endpoint: POST https://api.paystack.co/transfer
      // Or Flutterwave Transfer API endpoint: POST https://api.flutterwave.com/v3/transfers
      const response = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'balance',
          amount: Math.round(params.amount * 100), // Amount in kobo
          recipient: params.accountDetails.recipient_code || params.accountDetails.account_number,
          reason: `Swift Earn Withdrawal Payout (${params.reference})`,
          reference: params.reference,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        return {
          success: false,
          provider: this.name,
          isDemo: false,
          providerReference: data?.data?.transfer_code || `ERR-${params.reference}`,
          status: 'failed',
          message: data?.message || 'Payout request was rejected by clearing gateway.',
          rawResponse: data,
        };
      }

      return {
        success: true,
        provider: this.name,
        isDemo: false,
        providerReference: data.data.transfer_code || data.data.reference,
        status: 'processing',
        message: 'Payout initiated successfully with live banking gateway. Pending webhook settlement.',
        rawResponse: data,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: this.name,
        isDemo: false,
        providerReference: `ERR-${params.reference}`,
        status: 'failed',
        message: err.message || 'Network error connecting to payment gateway.',
      };
    }
  }

  async getPaymentStatus(reference: string, providerReference?: string): Promise<PaymentStatusResponse> {
    const apiKey = this.getSecretKey();
    if (!apiKey) {
      return {
        provider: this.name,
        isDemo: false,
        providerReference: providerReference || reference,
        status: 'failed',
        message: 'Gateway unconfigured.',
      };
    }

    try {
      const targetRef = providerReference || reference;
      const response = await fetch(`https://api.paystack.co/transfer/verify/${targetRef}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const data = await response.json();
      const statusMap: Record<string, 'pending' | 'processing' | 'completed' | 'failed'> = {
        success: 'completed',
        failed: 'failed',
        pending: 'processing',
        processing: 'processing',
      };

      const mappedStatus = statusMap[data?.data?.status] || 'processing';

      return {
        provider: this.name,
        isDemo: false,
        providerReference: data?.data?.transfer_code || targetRef,
        status: mappedStatus,
        processedAt: data?.data?.transferred_at || new Date().toISOString(),
        failureReason: mappedStatus === 'failed' ? data?.data?.reason || 'Gateway transfer failed' : undefined,
        message: data?.message,
        rawResponse: data,
      };
    } catch (err: any) {
      return {
        provider: this.name,
        isDemo: false,
        providerReference: providerReference || reference,
        status: 'processing',
        message: err.message || 'Status query error',
      };
    }
  }

  async verifyPayment(reference: string, providerReference?: string): Promise<PaymentVerificationResponse> {
    const statusRes = await this.getPaymentStatus(reference, providerReference);
    return {
      verified: statusRes.status === 'completed',
      status: statusRes.status,
      amount: 0,
      currency: 'NGN',
      providerReference: statusRes.providerReference,
      message: statusRes.message,
    };
  }

  async processCallback(payload: any): Promise<PaymentCallbackResult> {
    const event = payload?.event;
    const data = payload?.data || payload;

    const reference = data?.reference || data?.tx_ref || 'UNKNOWN';
    const providerReference = data?.transfer_code || data?.id?.toString() || reference;

    let newStatus: 'processing' | 'completed' | 'failed' = 'processing';
    if (event === 'transfer.success' || data?.status === 'success') {
      newStatus = 'completed';
    } else if (
      event === 'transfer.failed' ||
      event === 'transfer.reversed' ||
      data?.status === 'failed' ||
      data?.status === 'reversed'
    ) {
      newStatus = 'failed';
    }

    return {
      handled: true,
      reference,
      providerReference,
      newStatus,
      failureReason: newStatus === 'failed' ? data?.reason || data?.gateway_response || 'Payout failed at bank' : undefined,
      rawEvent: payload,
    };
  }
}

export const realPaymentProvider = new RealPaymentProvider();
