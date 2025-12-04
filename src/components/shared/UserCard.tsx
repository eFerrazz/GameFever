import type { Models } from 'appwrite';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { Button } from '../ui/button';

import {
  useFollowUser,
  useUnfollowUser,
  useCheckIfFollowing,
} from '@/lib/react-query/queriesAndMutations';

type UserCardProps = {
  user: Models.Document;
  loggedUserId: string; // id do usuário logado para controle do follow
};

const UserCard = ({ user, loggedUserId }: UserCardProps) => {
  const isOwnProfile = loggedUserId === user.$id;

  // Verifica se já segue este usuário
  const {
    data: checkFollowingDoc,
    refetch: refetchCheckFollowing,
    isLoading: isCheckingFollowing,
  } = useCheckIfFollowing(loggedUserId, user.$id);

  // Estado local para seguir/deixar de seguir com resposta rápida
  const [isFollowingLocal, setIsFollowingLocal] = useState<boolean>(!!checkFollowingDoc);

  // Mantém estado local sincronizado com resultado remoto
  useEffect(() => {
    setIsFollowingLocal(!!checkFollowingDoc);
  }, [checkFollowingDoc]);

  // Mutations
  const { mutate: followMutate, isPending: isFollowMutating } = useFollowUser();
  const { mutate: unfollowMutate, isPending: isUnfollowMutating } = useUnfollowUser();

  // Handler para clicar no botão seguir / deixar de seguir
  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // para evitar navegação do Link

    if (isOwnProfile) return; // não segue a si mesmo
    if (isFollowMutating || isUnfollowMutating || isCheckingFollowing) return; // evita spam

    if (isFollowingLocal) {
      // Deixar de seguir
      setIsFollowingLocal(false); // otimista
      unfollowMutate(
        { followerId: loggedUserId, followingId: user.$id },
        {
          onSuccess: () => {
            refetchCheckFollowing();
          },
          onError: () => {
            setIsFollowingLocal(true);
          },
        }
      );
    } else {
      // Seguir
      setIsFollowingLocal(true); // otimista
      followMutate(
        { followerId: loggedUserId, followingId: user.$id },
        {
          onSuccess: () => {
            refetchCheckFollowing();
          },
          onError: () => {
            setIsFollowingLocal(false);
          },
        }
      );
    }
  };

  return (
    <div className="user-card flex items-center justify-between gap-4 p-3 rounded bg-dark-3">
      <Link to={`/profile/${user.$id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <img
          src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
          alt="creator"
          className="rounded-full w-14 h-14 flex-shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <p className="base-medium text-light-1 line-clamp-1 truncate">{user.name}</p>
          <p className="small-regular text-light-3 line-clamp-1 truncate">@{user.username}</p>
        </div>
      </Link>

      {!isOwnProfile && (
        <Button
          type="button"
          size="sm"
          className="shad-button_primary px-5"
          onClick={handleFollowToggle}
          disabled={isFollowMutating || isUnfollowMutating || isCheckingFollowing}
        >
          {isFollowMutating || isUnfollowMutating || isCheckingFollowing
            ? "..."
            : isFollowingLocal
            ? "Deixar de seguir"
            : "Seguir"}
        </Button>
      )}
    </div>
  );
};

export default UserCard;
