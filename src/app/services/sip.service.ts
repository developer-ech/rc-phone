import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as JsSIP from 'jssip';
import { SipConfig } from '../models/sip-config.model';

export enum CallStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  IN_CALL = 'IN_CALL',
  ENDED = 'ENDED',
  FAILED = 'FAILED'
}

@Injectable({
  providedIn: 'root'
})
export class SipService {
  private ua: JsSIP.UA | null = null;
  private currentSession: any = null;
  private _callStatus = new BehaviorSubject<CallStatus>(CallStatus.IDLE);
  private _callDuration = new BehaviorSubject<number>(0);
  private durationTimer: any = null;
  private _remoteAudio: HTMLAudioElement | null = null;

  callStatus$ = this._callStatus.asObservable();
  callDuration$ = this._callDuration.asObservable();

  constructor() {
    // Create audio element for remote audio
    this._remoteAudio = document.createElement('audio');
    this._remoteAudio.autoplay = true;
    document.body.appendChild(this._remoteAudio);
  }

  initialize(config: SipConfig): void {
    // If there's an existing UA, unregister it
    if (this.ua) {
      this.ua.stop();
    }

    // Configure JsSIP
    if (JsSIP.debug && typeof JsSIP.debug.enable === 'function') {
      JsSIP.debug.enable('JsSIP:*');
    }
    
    const socket = new JsSIP.WebSocketInterface(config.wsServers[0]);
    
    const configuration: JsSIP.UAConfiguration = {
      sockets: [socket],
      uri: config.uri,
      display_name: config.displayName || '',
      register: true,
      register_expires: 300,
      session_timers: false
    };
    
    // Add authentication based on whether JWT is used or not
    if (config.useJwt && config.jwtToken) {
      configuration.authorization_jwt = config.jwtToken;
    } else {
      configuration.password = config.password;
    }

    try {
      this.ua = new JsSIP.UA(configuration);
      
      // Set up event listeners
      this.ua.on('registered', () => {
        console.log('SIP UA registered successfully');
      });
      
      this.ua.on('registrationFailed', (e: any) => {
        console.error('SIP registration failed', e);
      });
      
      this.ua.on('newRTCSession', (e: any) => {
        const session = e.session;
        
        if (session.direction === 'outgoing') {
          this.handleOutgoingCall(session);
        }
      });
      
      // Start the UA
      this.ua.start();
      
    } catch (e) {
      console.error('Failed to initialize SIP UA', e);
    }
  }

  private handleOutgoingCall(session: any): void {
    this.currentSession = session;
    this._callStatus.next(CallStatus.CONNECTING);
    
    // Set up session event listeners
    session.on('connecting', () => {
      this._callStatus.next(CallStatus.CONNECTING);
    });
    
    session.on('progress', () => {
      // Call is ringing
    });
    
    session.on('accepted', () => {
      this._callStatus.next(CallStatus.IN_CALL);
      this.startDurationTimer();
    });
    
    session.on('ended', () => {
      this._callStatus.next(CallStatus.ENDED);
      this.stopDurationTimer();
      this.currentSession = null;
    });
    
    session.on('failed', () => {
      this._callStatus.next(CallStatus.FAILED);
      this.stopDurationTimer();
      this.currentSession = null;
    });
    
    // Handle remote media
    session.on('peerconnection', (e: any) => {
      const peerconnection = e.peerconnection;
      
      peerconnection.addEventListener('track', (event: any) => {
        if (event.track.kind === 'audio' && this._remoteAudio) {
          const stream = new MediaStream();
          stream.addTrack(event.track);
          this._remoteAudio.srcObject = stream;
        }
      });
    });
  }

  private startDurationTimer(): void {
    this._callDuration.next(0);
    this.durationTimer = setInterval(() => {
      this._callDuration.next(this._callDuration.value + 1);
    }, 1000);
  }

  private stopDurationTimer(): void {
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }
  }

  makeCall(number: string): void {
    if (!this.ua) {
      console.error('SIP UA not initialized');
      return;
    }
    
    if (this.currentSession) {
      console.warn('Call already in progress');
      return;
    }
    
    const options: JsSIP.CallOptions = {
      mediaConstraints: { audio: true, video: false },
      pcConfig: {
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] }
        ]
      }
    };
    
    try {
      this.ua.call(number, options);
    } catch (e) {
      console.error('Failed to make call', e);
      this._callStatus.next(CallStatus.FAILED);
    }
  }

  hangUp(): void {
    if (this.currentSession) {
      this.currentSession.terminate();
    }
  }

  terminate(): void {
    this.hangUp();
    
    if (this.ua) {
      this.ua.stop();
      this.ua = null;
    }
    
    if (this._remoteAudio) {
      document.body.removeChild(this._remoteAudio);
      this._remoteAudio = null;
    }
  }
}