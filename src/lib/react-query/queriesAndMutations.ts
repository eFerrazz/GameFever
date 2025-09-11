import{
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery
} from  '@tanstack/react-query'
import { createPost, createUserAccount, deleteSavedPost, getCurrentUser, GetPostById, GetRecentPosts, likePost, savePost, SignInAccount, signOutAccount } from '../appwrite/api'
import type { INewPost, INewUser } from '@/types'
import { QUERY_KEYS } from './queryKeys';
import { string } from 'zod';

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