export type OrgConfig = {
  secret: string;
  orgDid: string;
  nodes: NillionNodes[];
};

export type NillionNodes = {
  url: string;
  did: string;
};

export type AuthConfig = Record<
  string,
  {
    url: string;
    jwt: string;
  }
>;
