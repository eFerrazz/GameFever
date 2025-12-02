export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: URL;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUser = {
  $id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type IConversation = {
  $id: string;
  participants: string[]; // Array de user IDs (no código, convertemos de string vírgula-separada)
  otherUser ?: IUser; // NOVO: Dados do outro user (para 1:1; query no backend)
  lastMessage: string;
  lastMessageTimestamp: string; // Datetime ISO para ordenar
  $createdAt: string;
  $updatedAt: string;
};
export type IMessage = {
  $id: string;
  conversationId: string;
  senderId: string;
  content: string; // MUDOU: De 'text' para 'content' (banco)
  timestamp: string; // NOVO: Datetime ISO
  isRead: boolean; // NOVO: Para marcar lidas
  $createdAt: string;
  $updatedAt: string;
};
export type ISendMessage = {
  conversationId: string;
  content: string; // MUDOU: De 'text' para 'content'
  senderId: string;
};