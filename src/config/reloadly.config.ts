import { registerAs } from '@nestjs/config';

export default registerAs('reloadly', () => ({
  clientId: process.env.RELOADLY_CLIENT_ID,
  secret: process.env.RELOADLY_CLIENT_SECRET,
  host: process.env.RELOADLY_HOSTNAME,
  altHost: process.env.RELOADLY_ALT_HOST,
}));
