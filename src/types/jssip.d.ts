declare module 'jssip' {
  export class WebSocketInterface {
    constructor(server: string);
  }

  export class UA {
    constructor(configuration: UAConfiguration);
    start(): void;
    stop(): void;
    call(target: string, options?: CallOptions): void;
    on(event: string, callback: Function): void;
    isRegistered(): boolean;
    isConnected(): boolean;
    get(parameter: string): any;
    set(parameter: string, value: any): void;
  }

  export class RTCSession {
    connection: RTCPeerConnection;
    direction: string;
    local_identity: any;
    remote_identity: any;
    start_time: Date;
    end_time: Date;
    status: number;
    
    on(event: string, callback: Function): void;
    terminate(options?: any): void;
    mute(options?: any): void;
    unmute(options?: any): void;
    isMuted(): any;
    isEstablished(): boolean;
    isEnded(): boolean;
    isInProgress(): boolean;
    isReadyToReOffer(): boolean;
    sendDTMF(tones: string, options?: any): void;
  }

  export interface UAConfiguration {
    uri: string;
    password?: string;
    display_name?: string;
    sockets: WebSocketInterface[];
    register?: boolean;
    register_expires?: number;
    session_timers?: boolean;
    connection_recovery_min_interval?: number;
    connection_recovery_max_interval?: number;
    user_agent?: string;
    authorization_jwt?: string;
    [key: string]: any;
  }

  export interface CallOptions {
    mediaConstraints?: {
      audio?: boolean;
      video?: boolean;
    };
    pcConfig?: {
      iceServers?: Array<{
        urls: string | string[];
        username?: string;
        credential?: string;
      }>;
    };
    [key: string]: any;
  }

  export const debug: {
    enable: (value: string) => void;
    disable: () => void;
  };

  export const C: {
    causes: {
      [key: string]: string;
    };
    UA: {
      [key: string]: any;
    };
    [key: string]: any;
  };
}