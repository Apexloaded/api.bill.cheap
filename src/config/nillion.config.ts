import { registerAs } from '@nestjs/config';

export default registerAs('nillion', () => ({
  secret: process.env.NILLION_SECRET,
  orgDid: process.env.NILLION_ORG_ID,
  nodes: [
    { url: process.env.NILLION_NODE1_URL, did: process.env.NILLION_NODE1_DID },
    { url: process.env.NILLION_NODE2_URL, did: process.env.NILLION_NODE2_DID },
    { url: process.env.NILLION_NODE3_URL, did: process.env.NILLION_NODE3_DID },
  ],
}));
