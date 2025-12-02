import{
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery
} from  '@tanstack/react-query'
import { createPost, createUserAccount, deletePost, deleteSavedPost, getCurrentUser, getInfinitePosts, GetPostById, GetRecentPosts, getUserById, getUsers, likePost, savePost, searchPosts, SignInAccount, signOutAccount, updatePost, updateUser } from '../appwrite/api'
import type { IConversation, IMessage, INewPost, INewUser, ISendMessage, IUpdatePost, IUpdateUser } from '@/types'
import { QUERY_KEYS } from './queryKeys';

import { createConversation, queryConversationsByUser , queryMessagesByConversation, sendMessage } from '../appwrite/chatApi';
import { appwriteConfig, databases } from '../appwrite/config';




// ----- FOLLOWERS -----
import {
  followUser,
  unfollowUser,
  checkIfFollowing,
  getFollowers,
  getFollowing
} from "@/lib/appwrite/followersService";


// SEGUIR USUÁRIO
export const useFollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ followerId, followingId }: { followerId: string; followingId: string }) =>
      followUser(followerId, followingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
};


// DEIXAR DE SEGUIR USUÁRIO
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ followerId, followingId }: { followerId: string; followingId: string }) =>
      unfollowUser(followerId, followingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
};


// CHECK SE JÁ SEGUE
export const useCheckIfFollowing = (followerId: string, followingId: string) =>
  useQuery({
    queryKey: ["checkFollowing", followerId, followingId],
    queryFn: () => checkIfFollowing(followerId, followingId),
    enabled: !!followerId && !!followingId,
  });


// LISTAR FOLLOWERS
export const useGetFollowers = (userId: string) =>
  useQuery({
    queryKey: ["followers", userId],
    queryFn: () => getFollowers(userId),
    enabled: !!userId,
  });


// LISTAR FOLLOWING
export const useGetFollowing = (userId: string) =>
  useQuery({
    queryKey: ["following", userId],
    queryFn: () => getFollowing(userId),
    enabled: !!userId,
  });


  



export const useCreateUserAccount = () => {
    return  useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user)
    });
}

export const useSignInAccount = () => {
    return  useMutation({
        mutationFn: (user: { 
            email: string;
            password: string;
         }) => SignInAccount(user)
    });
}

export const useSignOutAccount = () => {
    return  useMutation({
        mutationFn: signOutAccount
    });
}

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: GetRecentPosts,
  })
} 

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, likesArray }: { postId: string;likesArray: 
      string[] }) => likePost(postId, likesArray),
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
        })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS, data?.$id]
        })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POSTS, data?.$id]
        })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER, data?.$id]
        })
      }
  })

}

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      savePost(userId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      })
    }
  })
}

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
        })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POSTS]
        })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER]
        })
      }
  })

}

export const useGetUsersByIds = (userIds: string[]) => {
  return useQuery({
    queryKey: userIds.map((id) => ({
      queryKey: ['user', id],
      queryFn: () => getUserById(id),
      enabled: !!id,
    })),
  });
};


export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser
  })
}

export const useGetPostById = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => GetPostById(postId),
    enabled: !!postId
  })
}

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {[QUERY_KEYS.GET_POST_BY_ID, data?.$id]}
    })
}

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId}: { postId: string, imageId:
       string }) => deletePost(postId, imageId),
    onSuccess: (data) => {[QUERY_KEYS.GET_RECENT_POSTS]
      
    }
    })
}

export const useGetUsers = (limit?: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USERS],
        queryFn: () => getUsers(limit),
    })
}

export const useGetUserById = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId,
    })
}

export const useUpdateUser = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (user: IUpdateUser) => updateUser(user),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
            })
        },
    })
}

export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: getInfinitePosts as any,
    getNextPageParam: (lastPage: any) => {
      if (lastPage && lastPage.documents.length === 0) return null;
      const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
    initialPageParam: null, 
  });
};


export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  });
};


// NOVO: Hooks para Chat

export const useGetConversations = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CONVERSATIONS],
    queryFn: queryConversationsByUser ,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (participants: string[]) => createConversation(participants),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CONVERSATIONS],
      });
    },
  });
};

export const useGetMessages = (conversationId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_MESSAGES, conversationId],
    queryFn: () => queryMessagesByConversation(conversationId),
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: ISendMessage) => sendMessage(message),
    onSuccess: (data, variables) => {
      // Invalida mensagens da conversa e conversas (para atualizar lastMessage)
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_MESSAGES, variables.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CONVERSATIONS],
      });
    },
  });
};