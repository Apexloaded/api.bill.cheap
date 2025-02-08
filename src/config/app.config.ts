import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME,
  id: process.env.APP_ID,
  hostname: process.env.HOSTNAME,
  rpc: process.env.RPC_NODE,
  db: process.env.DB_URI,
  encryptionKey: process.env.ENCRYPTION_KEY,
  secretKey: process.env.SECRET_KEY,
  exhangeRate: process.env.EXCHANGE_RATE_API,
  pythUrl: process.env.PYTH_SERVER,
}));
