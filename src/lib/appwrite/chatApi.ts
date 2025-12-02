import { ID, Query } from "appwrite";
import type { IConversation, IMessage, ISendMessage, IUser } from "@/types";
import { databases, appwriteConfig } from "./config";
import { getCurrentUser, getUserById } from "./api";

// Helper: formata array de participants em string ordenada
const formatParticipants = (participants: string[]): string => participants.sort().join(",");

// Helper: converte string em array
const parseParticipants = (participantsStr: string): string[] => participantsStr.split(",").sort();

// Cria nova conversa (1:1)
export async function createConversation(participants: string[]): Promise<IConversation> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Usuário não logado");

  if (participants.length !== 2) throw new Error("Chat 1:1 suporta apenas 2 participantes");

  const fullParticipants = [...new Set([...participants, currentUser.$id])];
  const participantsStr = formatParticipants(fullParticipants);

  // Verifica se já existe
  const existing = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.conversationsCollectionId,
    [Query.equal("participants", participantsStr)]
  );

  if (existing.documents.length > 0) return existing.documents[0] as IConversation;

  // Cria nova
  const newConversation = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.conversationsCollectionId,
    ID.unique(),
    {
      participants: participantsStr,
      lastMessage: "",
      lastMessageTimestamp: new Date().toISOString(),
    }
  );

  return {
    ...newConversation,
    participants: parseParticipants(newConversation.participants),
  } as IConversation;
}

// Lista conversas do usuário logado (enriquecida com otherUser)
export async function queryConversationsByUser(): Promise<{ documents: IConversation[]; total: number }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Usuário não logado");

  const conversations = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.conversationsCollectionId,
    [
      Query.contains("participants", currentUser.$id),
      Query.orderDesc("lastMessageTimestamp"),
      Query.limit(50),
    ]
  );

  // Enriquecer com otherUser (1:1)
  const formatted = await Promise.all(
    conversations.documents.map(async (doc: any) => {
      const participantsArray = parseParticipants(doc.participants);
      const otherIds = participantsArray.filter((id) => id !== currentUser.$id);

      let otherUser: IUser | undefined = undefined;

      if (otherIds.length > 0) {
        try {
          const otherUserData = await getUserById(otherIds[0]);
          otherUser = {
            $id: otherUserData.$id,
            name: otherUserData.name,
            username: otherUserData.username,
            imageUrl: otherUserData.imageUrl || "/assets/icons/profile-placeholder.svg",
          };
          console.log("OtherUser carregado para conv", doc.$id, otherUser); // DEBUG temporário
        } catch (err) {
          console.warn(`Falha ao carregar otherUser ${otherIds[0]}:`, err);
        }
      }

      return {
        ...doc,
        participants: participantsArray,
        otherUser,
      } as IConversation;
    })
  );

  return { documents: formatted, total: conversations.total };
}

// Lista mensagens de uma conversa
export async function queryMessagesByConversation(conversationId: string): Promise<{ documents: IMessage[]; total: number }> {
  const messages = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.messagesCollectionId,
    [
      Query.equal("conversationId", conversationId),
      Query.orderAsc("timestamp"),
      Query.limit(100),
    ]
  );

  return { documents: messages.documents as IMessage[], total: messages.total };
}

// Envia mensagem e atualiza conversa
export async function sendMessage(message: ISendMessage): Promise<IMessage> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Usuário não logado");

  const newMessage = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.messagesCollectionId,
    ID.unique(),
    {
      conversationId: message.conversationId,
      senderId: currentUser.$id,
      content: message.content,
      timestamp: new Date().toISOString(),
      isRead: false,
    }
  );

  // Atualiza lastMessage da conversa
  const preview = message.content.length > 50 ? message.content.substring(0, 50) + "..." : message.content;
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.conversationsCollectionId,
    message.conversationId,
    {
      lastMessage: preview,
      lastMessageTimestamp: new Date().toISOString(),
    }
  );

  return newMessage as IMessage;
}
