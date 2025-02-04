import { registerAs } from '@nestjs/config';

export default registerAs('tg', () => ({
  botName: process.env.TG_BOT_NAME,
  botToken: process.env.TG_BOT_TOKEN,
  community: process.env.TG_COMMUNITY_URL,
  channel: process.env.TG_CHANNEL_URL,
  appUrl: process.env.TG_MINI_APP_URL,
  banner: process.env.TG_BOT_BANNER,
}));
