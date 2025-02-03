import { registerAs } from '@nestjs/config';

export default registerAs('cdp', () => ({
  apiName: process.env.CDP_API_KEY_NAME,
  apiKey: process.env.CDP_API_KEY_PRIVATE_KEY,
  networkId: process.env.NETWORK_ID,
}));
