import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';

export const HAPPY_PDF_LIFETIME_PRODUCT_ID = 'com.rohittrimukhe.happypdf.pro.lifetime';
export const HAPPY_PDF_MONTHLY_PRODUCT_ID = 'com.rohittrimukhe.happypdf.pro.monthly';

export type HappyPdfPurchaseKind = 'lifetime' | 'monthly';

export interface HappyPdfPurchaseProduct {
  productId: typeof HAPPY_PDF_LIFETIME_PRODUCT_ID | typeof HAPPY_PDF_MONTHLY_PRODUCT_ID;
  kind: HappyPdfPurchaseKind;
  displayName: string;
  description: string;
  /** StoreKit's localized display string. Never infer a currency or price in JavaScript. */
  displayPrice: string;
}

export interface HappyPdfPurchaseAccess {
  unlocked: boolean;
  lifetimeOwned: boolean;
  monthlyActive: boolean;
  monthlyExpirationDate: string | null;
  freeJobsRemaining: number;
  freeWindowEndsAt: string | null;
}

export interface HappyPdfPurchaseResult {
  status: 'purchased' | 'pending' | 'cancelled';
  access: HappyPdfPurchaseAccess;
}

export interface HappyPdfPurchasesNativePlugin {
  getProducts(): Promise<{ products: HappyPdfPurchaseProduct[] }>;
  getAccessState(): Promise<HappyPdfPurchaseAccess>;
  recordFreeJob(options: { operationId: string }): Promise<{
    status: 'allowed' | 'exhausted';
    access: HappyPdfPurchaseAccess;
  }>;
  purchase(options: { productId: string }): Promise<HappyPdfPurchaseResult>;
  restore(): Promise<{ access: HappyPdfPurchaseAccess }>;
  manageSubscriptions(): Promise<void>;
  addListener(
    eventName: 'accessChanged',
    listener: (access: HappyPdfPurchaseAccess) => void,
  ): Promise<PluginListenerHandle>;
}

/** The registered proxy is safe to import in every runtime; availability is checked separately. */
export const HappyPdfPurchases = registerPlugin<HappyPdfPurchasesNativePlugin>('HappyPdfPurchases');

/** Enforce only with the real iOS native header, never from a proxy's shape. */
export const isHappyPdfPurchasesAvailable = (): boolean =>
  Capacitor.getPlatform() === 'ios' && Capacitor.isPluginAvailable('HappyPdfPurchases');
