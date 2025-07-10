import { Injectable } from '@angular/core';
import { SDK } from '@ringcentral/sdk';
import { BehaviorSubject } from 'rxjs';
import { RingCentralConfig } from '../models/ringcentral-config.model';
import { SipConfig } from '../models/sip-config.model';

@Injectable({
  providedIn: 'root'
})
export class RingCentralService {
  private sdk: SDK | null = null;
  private platform: any = null;
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  private _sipConfig = new BehaviorSubject<SipConfig | null>(null);
  
  isAuthenticated$ = this._isAuthenticated.asObservable();
  sipConfig$ = this._sipConfig.asObservable();

  constructor() {
    // Try to load config from localStorage
    this.loadConfigFromStorage();
  }

  private loadConfigFromStorage() {
    const storedConfig = localStorage.getItem('ringcentralConfig');
    if (storedConfig) {
      try {
        const config = JSON.parse(storedConfig);
        this.initialize(config);
      } catch (e) {
        console.error('Failed to parse stored RingCentral config', e);
      }
    }
  }

  initialize(config: RingCentralConfig): void {
    try {
      this.sdk = new SDK({
        server: config.serverUrl,
        clientId: config.clientId,
        clientSecret: config.clientSecret
      });
      
      this.platform = this.sdk.platform();
      
      // Save config to localStorage
      localStorage.setItem('ringcentralConfig', JSON.stringify(config));
      
      // If we have username and password, try to authenticate
      if (config.username && config.password) {
        this.login(config.username, config.password, config.extension);
      }
    } catch (e) {
      console.error('Failed to initialize RingCentral SDK', e);
    }
  }

  async login(username: string, password: string, extension?: string): Promise<boolean> {
    if (!this.platform) {
      console.error('RingCentral SDK not initialized');
      return false;
    }

    try {
      await this.platform.login({
        username,
        password,
        extension: extension || ''
      });
      
      this._isAuthenticated.next(true);
      
      // Get SIP provisioning info
      await this.getSipProvisioningInfo();
      
      return true;
    } catch (e) {
      console.error('RingCentral login failed', e);
      this._isAuthenticated.next(false);
      return false;
    }
  }

  async logout(): Promise<void> {
    if (this.platform && this._isAuthenticated.value) {
      try {
        await this.platform.logout();
      } catch (e) {
        console.error('Logout error', e);
      } finally {
        this._isAuthenticated.next(false);
        this._sipConfig.next(null);
      }
    }
  }

  private async getSipProvisioningInfo(): Promise<void> {
    if (!this.platform || !this._isAuthenticated.value) {
      return;
    }

    try {
      const response = await this.platform.get('/restapi/v1.0/client-info/sip-provision', {
        sipInfo: [{
          transport: 'WSS'
        }]
      });
      
      const data = await response.json();
      
      if (data && data.sipInfo && data.sipInfo.length > 0) {
        const sipInfo = data.sipInfo[0];
        
        const sipConfig: SipConfig = {
          uri: data.sipInfo[0].username,
          password: data.sipInfo[0].password,
          wsServers: [data.sipInfo[0].outboundProxy],
          displayName: data.sipInfo[0].displayName || ''
        };
        
        this._sipConfig.next(sipConfig);
      }
    } catch (e) {
      console.error('Failed to get SIP provisioning info', e);
    }
  }

  // Method to make a call using the RingCentral API
  async makeCall(phoneNumber: string, customerName?: string): Promise<any> {
    if (!this.platform || !this._isAuthenticated.value) {
      throw new Error('Not authenticated with RingCentral');
    }

    try {
      const response = await this.platform.post('/restapi/v1.0/account/~/extension/~/call', {
        to: { phoneNumber },
        from: { phoneNumber: 'username' }, // This will be replaced with the user's phone number
        callerId: { name: customerName || phoneNumber }
      });
      
      return await response.json();
    } catch (e) {
      console.error('Failed to make call via RingCentral API', e);
      throw e;
    }
  }
}