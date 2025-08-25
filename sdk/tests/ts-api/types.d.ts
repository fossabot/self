declare module '@selfxyz/common' {
  export interface SelfAppDisclosureConfig {
    minimumAge?: number;
    ofac?: boolean;
    excludedCountries?: string[];
    issuing_state?: boolean;
    name?: boolean;
    nationality?: boolean;
    date_of_birth?: boolean;
    passport_number?: boolean;
    gender?: boolean;
    expiry_date?: boolean;
  }
}

declare module '@selfxyz/core' {
  export interface IConfigStorage {
    getActionId(userIdentifier: string, data: string): Promise<string>;
    setConfig(id: string, config: VerificationConfig): Promise<boolean>;
    getConfig(id: string): Promise<VerificationConfig>;
  }

  export interface VerificationConfig {
    minimumAge?: number;
    excludedCountries?: string[];
    ofac?: boolean;
  }

  export interface VcAndDiscloseProof {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  }

  export class SelfBackendVerifier {
    constructor(
      scope: string,
      endpoint: string,
      mockPassport: boolean,
      allowedIds: any,
      configStorage: IConfigStorage,
      userIdentifierType: string
    );
    verify(attestationId: any, proof: any, publicSignals: any, userContextData: string): Promise<any>;
  }

  export const AllIds: any;
  export const countryCodes: Record<string, string>;
}
