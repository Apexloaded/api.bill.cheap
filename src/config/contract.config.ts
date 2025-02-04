import { registerAs } from '@nestjs/config';

export default registerAs('bc', () => ({
  gateway: process.env.GATEWAY,
}));
