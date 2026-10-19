import type { ChatEnv } from '../server/chat/types';
import { cleanup } from '../server/chat/store';
import { refreshGithub } from '../server/chat/github';
import { refreshReadmes } from '../server/chat/readmes';

export default {
  async scheduled(_event: unknown, env: ChatEnv) {
    if (!env.CHAT_DB) throw new Error('Missing CHAT_DB');
    await cleanup(env.CHAT_DB);
    const result=await refreshGithub(env.CHAT_DB);
    console.log('Portfolio GitHub refresh:',result.status);
    console.log('Portfolio public README refresh:',JSON.stringify(await refreshReadmes(env.CHAT_DB)));
  }
};
