export interface RingCentralConfig {
  clientId: string;
  clientSecret: string;
  serverUrl: string;
  username?: string;
  password?: string;
  extension?: string;
}

export interface CallParams {
  customerName?: string;
  customerNumber: string;
}