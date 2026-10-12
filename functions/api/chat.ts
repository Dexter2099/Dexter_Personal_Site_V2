import { handleChat } from '../../server/chat/handler';
import type { ChatEnv } from '../../server/chat/types';

export const onRequest = ({request,env}: {request:Request;env:ChatEnv}) => handleChat(request,env);
