import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME,
  id: process.env.APP_ID,
  hostname: process.env.HOSTNAME,
}));
