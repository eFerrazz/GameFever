// src/lib/appwrite/followersService.ts
import { ID, Query } from "appwrite";
import { databases, appwriteConfig } from "./config";

export const COLLECTION_FOLLOWERS = "followers"; 

// ➤ Seguir usuário
export const followUser = async (followerId: string, followingId: string) => {
  return await databases.createDocument(
    appwriteConfig.databaseId,
    COLLECTION_FOLLOWERS,
    ID.unique(),
    {
      followerId,
      followingId,
    }
  );
};

// ➤ Deixar de seguir usuário
export const unfollowUser = async (followerId: string, followingId: string) => {
  const existing = await checkIfFollowing(followerId, followingId);
  if (!existing) return null;

  return await databases.deleteDocument(
    appwriteConfig.databaseId,
    COLLECTION_FOLLOWERS,
    existing.$id
  );
};

// ➤ Verificar se segue
export const checkIfFollowing = async (followerId: string, followingId: string) => {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    COLLECTION_FOLLOWERS,
    [
      Query.equal("followerId", followerId),
      Query.equal("followingId", followingId),
    ]
  );
  return res.documents.length > 0 ? res.documents[0] : null;
};

// ➤ Listar seguidores
export const getFollowers = async (userId: string) => {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    COLLECTION_FOLLOWERS,
    [Query.equal("followingId", userId)]
  );

  // Retorna apenas o ID do seguidor
  return res.documents.map((doc) => doc.followerId);
};

// ➤ Listar quem o usuário segue
export const getFollowing = async (userId: string) => {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    COLLECTION_FOLLOWERS,
    [Query.equal("followerId", userId)]
  );

  return res.documents.map((doc) => doc.followingId);
};
