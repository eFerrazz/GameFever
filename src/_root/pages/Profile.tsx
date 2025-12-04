import { useEffect, useState } from "react";
import {
  Link,
  Outlet,
  useParams,
  useLocation,
  useNavigate,
  Routes,
  Route,
} from "react-router-dom";
import {
  useCreateConversation,
  useGetUserById,
  useFollowUser,
  useUnfollowUser,
  useCheckIfFollowing,
  useGetFollowers,
  useGetFollowing,
} from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
import { Button } from "@/components/ui/button";
import { getUserById } from "@/lib/appwrite/api";
import LikedPosts from "./LikedPosts";

type UserListModalProps = {
  userIds: string[];
  title: string;
  onClose: () => void;
};

const UserListModal = ({ userIds, title, onClose }: UserListModalProps) => {
  const navigate = useNavigate();

  const { data: users, isLoading } = useQuery({
    queryKey: ["userList", userIds],
    queryFn: async () => {
      const ids = userIds || [];
      const results = await Promise.all(ids.map((id: string) => getUserById(id)));
      return results;
    },
    enabled: !!userIds && userIds.length > 0,
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex-center z-50">
      <div className="bg-dark-2 rounded-lg p-6 w-80 max-h-[70vh] overflow-y-auto">
        <h2 className="h3-bold mb-4">{title}</h2>

        {isLoading ? (
          <Loader />
        ) : users?.length === 0 ? (
          <p className="text-light-3">Nenhum usuário</p>
        ) : (
          <ul>
            {users?.map((u: any) => (
              <li
                key={u.$id}
                className="flex items-center gap-3 p-2 hover:bg-dark-3 rounded cursor-pointer"
                onClick={() => {
                  navigate(`/profile/${u.$id}`);
                  onClose();
                }}
              >
                <img
                  src={u.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  alt="avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="small-semibold">{u.name}</p>
                  <p className="small-medium text-light-3">@{u.username}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-primary-500 rounded text-dark-1"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

const Profile = () => {
  const { id: profileIdParam } = useParams();
  const profileId = profileIdParam || "";
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const loggedId = user?.id || "";

  // Get profile data
  const { data: currentUser, isLoading: isProfileLoading } = useGetUserById(profileId);

  // Followers / following lists
  const { data: followersIds } = useGetFollowers(profileId);
  const { data: followingIds } = useGetFollowing(profileId);

  // Check follow relationship (returns document or null)
  const {
    data: checkFollowingDoc,
    isLoading: isCheckingFollowing,
    refetch: refetchCheckFollowing,
  } = useCheckIfFollowing(loggedId, profileId);

  // Local derived boolean state for UI toggle (keeps immediate feedback)
  const [isFollowingLocal, setIsFollowingLocal] = useState<boolean>(!!checkFollowingDoc);

  // Keep local state in sync with remote check (when checkFollowingDoc changes)
  useEffect(() => {
    setIsFollowingLocal(!!checkFollowingDoc);
  }, [checkFollowingDoc]);

  // Mutations
  const {
    mutate: followMutate,
    isPending: isFollowMutating,
  } = useFollowUser();
  const {
    mutate: unfollowMutate,
    isPending: isUnfollowMutating,
  } = useUnfollowUser();

  const { mutate: createConv, isPending: creatingConv } = useCreateConversation();

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  if (isProfileLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  // Safety: if no currentUser (e.g. invalid id) show a friendly message
  if (!currentUser) {
    return (
      <div className="flex-center w-full h-full p-6">
        <p className="text-center">Perfil não encontrado.</p>
      </div>
    );
  }

  // Handlers
  const handleFollowToggle = () => {
    // must be logged in to follow
    if (!loggedId) {
      navigate("/login");
      return;
    }

    // can't follow yourself
    if (loggedId === profileId) return;

    // avoid concurrent mutate calls
    if (isFollowMutating || isUnfollowMutating) return;

    // If currently following -> unfollow
    if (isFollowingLocal) {
      // optimistic UI: immediately toggle off
      setIsFollowingLocal(false);

      unfollowMutate(
        { followerId: loggedId, followingId: profileId },
        {
          onSuccess: () => {
            // refetch remote check to ensure consistency
            refetchCheckFollowing();
          },
          onError: () => {
            // revert optimistic toggle on error
            setIsFollowingLocal(true);
          },
        }
      );
      return;
    }

    // If not following -> follow (guard to avoid duplicate follow)
    // Extra protection: if checkFollowingDoc exists, do not call follow
    if (checkFollowingDoc) {
      setIsFollowingLocal(true);
      return;
    }

    // optimistic UI: immediately toggle on
    setIsFollowingLocal(true);

    followMutate(
      { followerId: loggedId, followingId: profileId },
      {
        onSuccess: () => {
          // remote invalidations are handled by the mutation's onSuccess (queriesAndMutations)
          refetchCheckFollowing();
        },
        onError: () => {
          // revert optimistic toggle on error
          setIsFollowingLocal(false);
        },
      }
    );
  };

  const handleStartChat = () => {
    if (!loggedId) {
      navigate("/login");
      return;
    }
    if (loggedId === profileId) return;

    createConv([loggedId, profileId], {
      onSuccess: () => navigate("/chat", { state: { userId: profileId } }),
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
            alt="avatar"
          />
          <div className="flex flex-col flex-1">
            <h1 className="text-center xl:text-left h3-bold">{currentUser.name}</h1>
            <p className="text-light-3 text-center xl:text-left">@{currentUser.username}</p>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start">
              <div className="cursor-default flex-center gap-2">
                <p className="text-primary-500">{currentUser.posts ? currentUser.posts.length : 0}</p>
                <p className="text-light-2">Posts</p>
              </div>

              <div
                className="flex-center gap-2 cursor-pointer"
                onClick={() => setShowFollowersModal(true)}
              >
                <p className="text-primary-500">{followersIds?.length || 0}</p>
                <p className="text-light-2">Seguidores</p>
              </div>

              <div
                className="flex-center gap-2 cursor-pointer"
                onClick={() => setShowFollowingModal(true)}
              >
                <p className="text-primary-500">{followingIds?.length || 0}</p>
                <p className="text-light-2">Seguindo</p>
              </div>
            </div>
          </div>

            {/* Botão EDITAR PERFIL — aparece somente no próprio perfil */}
{loggedId === profileId && (
  <div className="flex justify-center gap-4">
    <Link
      to={`/update-profile/${loggedId}`}
      className="h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg"
    >
      <img
        src="/assets/icons/edit.svg"
        alt="edit"
        width={20}
        height={20}
      />
      <p className="flex whitespace-nowrap small-medium">
        Editar Perfil
      </p>
    </Link>
  </div>
)}


          {/* Buttons: hide when viewing own profile or if no logged user */}
          {loggedId && loggedId !== profileId && (
            <div className="flex gap-4">
              <Button
                className="shad-button_primary px-8"
                onClick={handleFollowToggle}
                disabled={isFollowMutating || isUnfollowMutating || isCheckingFollowing}
              >
                {isFollowMutating || isUnfollowMutating || isCheckingFollowing
                  ? "..."
                  : isFollowingLocal
                  ? "Deixar de Seguir"
                  : "Seguir"}
              </Button>

              <Button
                className="shad-button_primary px-8"
                onClick={handleStartChat}
                disabled={creatingConv}
              >
                {creatingConv ? "..." : "Mensagem"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 max-w-full">
        <p className="text-light-1 text-base md:text-lg font-normal leading-relaxed text-left whitespace-pre-wrap">
          {currentUser.bio}
        </p>
      </div>

      {/* Modals */}
      {showFollowersModal && (
        <UserListModal
          userIds={followersIds || []}
          title="Seguidores"
          onClose={() => setShowFollowersModal(false)}
        />
      )}
      {showFollowingModal && (
        <UserListModal
          userIds={followingIds || []}
          title="Seguindo"
          onClose={() => setShowFollowingModal(false)}
        />
      )}

      {/* Tabs (only for own profile) */}
      {loggedId === profileId && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${profileId}`}
            className={`profile-tab rounded-l-lg ${
              pathname === `/profile/${profileId}` && "!bg-dark-3"
            }`}>
            <img
              src={"/assets/icons/posts.svg"}
              alt="posts"
              width={20}
              height={20}
            />
            Posts
          </Link>
          <Link
            to={`/profile/${profileId}/liked-posts`}
            className={`profile-tab rounded-r-lg ${
              pathname === `/profile/${profileId}/liked-posts` && "!bg-dark-3"
            }`}>
            <img
              src={"/assets/icons/like.svg"}
              alt="like"
              width={20}
              height={20}
            />
            Posts curtidos
          </Link>
        </div>
      )}

      

      {/* Outlet for nested routes like liked-posts */}
      <Routes>
        <Route
          index
          element={<GridPostList posts={currentUser.posts} showStats={false} showUser={false} />}
        />
        {currentUser.$id === user.id && (
          <Route path="/liked-posts" element={<LikedPosts />} />
        )}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;
