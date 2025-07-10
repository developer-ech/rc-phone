import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as JsSIP from 'jssip';
import { SipConfig } from '../models/sip-config.model';

export enum CallStatus {
  IDLE = 'Idle',
  CONNECTING = 'Connecting',
  IN_CALL = 'In Call',
  ENDED = 'Ended',
  ERROR = 'Error'
}

@Injectable({
  providedIn: 'root'
})
export class SipService {
  private ua: JsSIP.UA | null = null;
  private session: any = null; // Using any type for RTCSession
  
  private callStatusSubject = new BehaviorSubject<CallStatus>(CallStatus.IDLE);
  public callStatus$ = this.callStatusSubject.asObservable();
  
  constructor() {}
  
  public initialize(config: SipConfig): void {
    if (this.ua) {
      this.ua.stop();
    }
    
    const socket = new JsSIP.WebSocketInterface(config.wsServer);
    
    this.ua = new JsSIP.UA({
      uri: `sip:${config.username}@${config.sipServer}`,
      password: config.password,
      display_name: config.displayName || config.username,
      sockets: [socket],
      register: true
    });
    
    this.setupUaListeners();
    this.ua.start();
  }
  
  private setupUaListeners(): void {
    if (!this.ua) return;
    
    this.ua.on('connected', () => {
      console.log('Connected to SIP server');
    });
    
    this.ua.on('disconnected', () => {
      console.log('Disconnected from SIP server');
      this.callStatusSubject.next(CallStatus.IDLE);
    });
    
    this.ua.on('registered', () => {
      console.log('Registered with SIP server');
    });
    
    this.ua.on('registrationFailed', (e: any) => {
      console.error('Registration failed', e);
      this.callStatusSubject.next(CallStatus.ERROR);
    });
  }
  
  public makeCall(number: string): void {
    if (!this.ua) {
      console.error('UA not initialized');
      this.callStatusSubject.next(CallStatus.ERROR);
      return;
    }
    
    const options = {
      mediaConstraints: { audio: true, video: false },
      pcConfig: {
        iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
      }
    };
    
    this.callStatusSubject.next(CallStatus.CONNECTING);
    this.session = this.ua.call(number, options);
    this.setupSessionListeners();
  }
  
  private setupSessionListeners(): void {
    if (!this.session) return;
    
    this.session.on('connecting', () => {
      console.log('Call connecting');
      this.callStatusSubject.next(CallStatus.CONNECTING);
    });
    
    this.session.on('progress', () => {
      console.log('Call in progress');
    });
    
    this.session.on('accepted', () => {
      console.log('Call accepted');
      this.callStatusSubject.next(CallStatus.IN_CALL);
    });
    
    this.session.on('ended', () => {
      console.log('Call ended');
      this.callStatusSubject.next(CallStatus.ENDED);
      setTimeout(() => {
        this.callStatusSubject.next(CallStatus.IDLE);
      }, 2000);
      this.session = null;
    });
    
    this.session.on('failed', (e: any) => {
      console.error('Call failed', e);
      this.callStatusSubject.next(CallStatus.ERROR);
      setTimeout(() => {
        this.callStatusSubject.next(CallStatus.IDLE);
      }, 2000);
      this.session = null;
    });
  }
  
  public hangUp(): void {
    if (this.session) {
      this.session.terminate();
    }
  }
  
  public isCallActive(): boolean {
    return this.session !== null && 
           this.callStatusSubject.value !== CallStatus.IDLE && 
           this.callStatusSubject.value !== CallStatus.ENDED;
  }
  
  public getCurrentStatus(): CallStatus {
    return this.callStatusSubject.value;
  }
}
