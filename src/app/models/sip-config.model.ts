export interface SipConfig {
  uri: string;
  password: string;
  wsServers: string[];
  displayName?: string;
  jwtToken?: string;
  useJwt?: boolean;
}