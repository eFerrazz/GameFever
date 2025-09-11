import { ID, ImageGravity } from "appwrite";
import type { INewPost, INewUser } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from './config';
import { Query } from 'appwrite';


export async function createUserAccount(user: INewUser){
    try {
        
        const newAccount  = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name,

        );

        if(!newAccount) throw Error;

        const avatarUrl = new URL(avatars.getInitials(user.name));

       const newUser = await saveUserToDB({
        accountId: newAccount.$id,
        name: newAccount.name,
        email: newAccount.email,
        username: user.username,
        imageUrl: avatarUrl,
       })

        return newUser;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function saveUserToDB(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;
}) {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userColletionId,
            ID.unique(),
            user,
        )

        return newUser;
    } catch (error) {
        console.log(error);
    }
}


export async function SignInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailPasswordSession(user.email, user.password);

    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userColletionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }
    
}

export async function signOutAccount(){
    try {
        const session = await account.deleteSession("current")
        return session;
        
    } catch (error) {
        console.log(error);
    }
    
}

export async function createPost(post: INewPost) {
  try {
    // 1) Upload do arquivo
    const uploadedFile = await uploadFile(post.file[0]);
    if (!uploadedFile) throw Error;

    // 2) Pegar URL pública do arquivo
    const fileUrl = storage.getFileView(appwriteConfig.storageId, uploadedFile.$id);

    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // 3) Converter tags
    const tags = post.tags?.replace(/\s/g, "").split(",") || [];

    // 4) Criar documento
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl, // agora é uma URL válida
        imageId: uploadedFile.$id,
        location: post.location,
        tags,
      }
    );

    return newPost;
  } catch (error) {
    console.log(error);
  }
}


export async function uploadFile(file: File): Promise<{ $id: string } | undefined> {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );
    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

export function getFilePreview(fileId: string){
    try{
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            ImageGravity.Top,
            100,
        )
        return fileUrl;
    }
    catch (error){
        console.log(error);
    }
}

export async function deleteFile(fileId: string){
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId);

        return{ status: 'ok' }
    } catch (error) {
        console.log(error);
    }
}

export async function GetRecentPosts() {
    const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(20)]
    )

    if(!posts) throw Error;
    return posts;
}

export async function likePost(postId: string, likesArray: string[]) {
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {likes: likesArray}
        )

        if(!updatedPost) throw Error;

        return updatedPost
    } catch (error) {
        console.log(error);
    }
    
}

export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteSavedPost(savedRecordId: string) {
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId,
        )

        if(!statusCode) throw Error;

        return { status: 'ok' }
    } catch (error) {
        console.log(error);
    }
    
}

export async function GetPostById(postId: string) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    ); return post;
  } catch (error) {
    console.log(error)
  }
}