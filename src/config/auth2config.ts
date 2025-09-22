export interface ProviderConfig {
  strategy: any;
  options: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  };
  scope?: string[];
}

export type Auth2Config = {
  [provider: string]: ProviderConfig;
};
