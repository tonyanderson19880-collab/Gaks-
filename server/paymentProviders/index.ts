import { PaymentProvider } from './PaymentProvider';
import { demoPaymentProvider } from './DemoPaymentProvider';
import { realPaymentProvider } from './RealPaymentProvider';

export * from './PaymentProvider';
export * from './DemoPaymentProvider';
export * from './RealPaymentProvider';

export function getPaymentProvider(providerName?: string): PaymentProvider {
  const isProductionKeyConfigured = Boolean(
    process.env.PAYSTACK_SECRET_KEY || process.env.FLUTTERWAVE_SECRET_KEY
  );

  if (providerName?.toLowerCase().includes('real') || providerName?.toLowerCase().includes('paystack')) {
    return realPaymentProvider;
  }

  if (!isProductionKeyConfigured) {
    return demoPaymentProvider;
  }

  return demoPaymentProvider;
}
