import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RingCentralConfig } from '../models/ringcentral-config.model';
import { SipConfig } from '../models/sip-config.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RingCentralService {
  private config: RingCentralConfig | null = null;
  private accessToken: string | null = null;
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  private _sipConfig = new BehaviorSubject<SipConfig | null>(null);
  
  isAuthenticated$ = this._isAuthenticated.asObservable();
  sipConfig$ = this._sipConfig.asObservable();

  constructor(private http: HttpClient) {
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
    
    // Check if we have a stored token
    const storedToken = localStorage.getItem('ringcentralToken');
    if (storedToken) {
      try {
        const tokenData = JSON.parse(storedToken);
        if (tokenData.access_token && new Date(tokenData.expires_at) > new Date()) {
          this.accessToken = tokenData.access_token;
          this._isAuthenticated.next(true);
          this.getSipProvisioningInfo();
        }
      } catch (e) {
        console.error('Failed to parse stored token', e);
      }
    }
  }

  initialize(config: RingCentralConfig): void {
    this.config = config;
    
    // Save config to localStorage
    localStorage.setItem('ringcentralConfig', JSON.stringify(config));
    
    // If we have JWT token and useJwt is true, use JWT authentication
    if (config.useJwt && config.jwtToken) {
      this.loginWithJwt(config.jwtToken);
    }
    // Otherwise, if we have username and password, try to authenticate with password
    else if (config.username && config.password) {
      this.login(config.username, config.password, config.extension);
    }
  }
  
  async loginWithJwt(jwtToken: string): Promise<boolean> {
    if (!this.config) {
      console.error('RingCentral config not initialized');
      return false;
    }

    try {
      // Store the JWT token directly
      this.accessToken = jwtToken;
      
      // Store token with a long expiration (JWT tokens typically have their own expiration)
      const tokenData = {
        access_token: jwtToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      };
      localStorage.setItem('ringcentralToken', JSON.stringify(tokenData));
      
      this._isAuthenticated.next(true);
      
      // Get SIP provisioning info
      await this.getSipProvisioningInfo();
      
      return true;
    } catch (e) {
      console.error('RingCentral JWT login failed', e);
      this._isAuthenticated.next(false);
      return false;
    }
  }

  async login(username: string, password: string, extension?: string): Promise<boolean> {
    if (!this.config) {
      console.error('RingCentral config not initialized');
      return false;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', username);
      formData.append('password', password);
      if (extension) {
        formData.append('extension', extension);
      }
      
      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${this.config.clientId}:${this.config.clientSecret}`)
      });
      
      const response = await this.http.post<any>(
        `${this.config.serverUrl}/restapi/oauth/token`,
        formData.toString(),
        { headers }
      ).toPromise();
      
      if (response && response.access_token) {
        this.accessToken = response.access_token;
        
        // Store token with expiration
        const tokenData = {
          access_token: response.access_token,
          expires_at: new Date(Date.now() + response.expires_in * 1000).toISOString()
        };
        localStorage.setItem('ringcentralToken', JSON.stringify(tokenData));
        
        this._isAuthenticated.next(true);
        
        // Get SIP provisioning info
        await this.getSipProvisioningInfo();
        
        return true;
      }
      
      return false;
    } catch (e) {
      console.error('RingCentral login failed', e);
      this._isAuthenticated.next(false);
      return false;
    }
  }

  async logout(): Promise<void> {
    if (this.accessToken && this._isAuthenticated.value) {
      try {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${this.accessToken}`
        });
        
        await this.http.post(
          `${this.config?.serverUrl}/restapi/oauth/revoke`,
          { token: this.accessToken },
          { headers }
        ).toPromise();
      } catch (e) {
        console.error('Logout error', e);
      } finally {
        this.accessToken = null;
        localStorage.removeItem('ringcentralToken');
        this._isAuthenticated.next(false);
        this._sipConfig.next(null);
      }
    }
  }

  private async getSipProvisioningInfo(): Promise<void> {
    if (!this.accessToken || !this._isAuthenticated.value || !this.config) {
      return;
    }

    try {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.accessToken}`
      });
      
      const data = await this.http.post<any>(
        `${this.config.serverUrl}/restapi/v1.0/client-info/sip-provision`,
        { sipInfo: [{ transport: 'WSS' }] },
        { headers }
      ).toPromise();
      
      if (data && data.sipInfo && data.sipInfo.length > 0) {
        const sipConfig: SipConfig = {
          uri: data.sipInfo[0].username,
          password: data.sipInfo[0].password,
          wsServers: [data.sipInfo[0].outboundProxy],
          displayName: data.sipInfo[0].displayName || ''
        };
        
        // If we're using JWT, add it to the SIP config
        if (this.config?.useJwt && this.config?.jwtToken) {
          sipConfig.jwtToken = this.config.jwtToken;
          sipConfig.useJwt = true;
        }
        
        this._sipConfig.next(sipConfig);
      }
    } catch (e) {
      console.error('Failed to get SIP provisioning info', e);
    }
  }

  // Method to make a call using the RingCentral API
  async makeCall(phoneNumber: string, customerName?: string): Promise<any> {
    if (!this.accessToken || !this._isAuthenticated.value || !this.config) {
      throw new Error('Not authenticated with RingCentral');
    }

    try {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      });
      
      const response = await this.http.post<any>(
        `${this.config.serverUrl}/restapi/v1.0/account/~/extension/~/call`,
        {
          to: { phoneNumber },
          from: { phoneNumber: 'username' }, // This will be replaced with the user's phone number
          callerId: { name: customerName || phoneNumber }
        },
        { headers }
      ).toPromise();
      
      return response;
    } catch (e) {
      console.error('Failed to make call via RingCentral API', e);
      throw e;
    }
  }
}