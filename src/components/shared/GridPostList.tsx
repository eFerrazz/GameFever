import { useUserContext } from "@/context/AuthContext";
import type { Models } from "appwrite";
import { Link } from "react-router-dom";
import PostStats from "./PostStats";

type GridPostListProps = {
  posts: Models.Document[] | undefined;
  showUser?: boolean;
  showStats?: boolean;
};

const GridPostList = ({
  posts = [],
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
  const { user } = useUserContext();

  if (!posts || posts.length === 0) {
    return (
      <p className="text-light-4 text-center w-full mt-10">
        Nenhum post para exibir ainda...
      </p>
    );
  }

  return (
    <ul className="grid-container">
      {posts.map((post) => {
        if (!post?.imageUrl) return null; // ← Proteção contra posts quebrados

        return (
          <li key={post.$id} className="relative min-w-80 h-80">
            <Link to={`/posts/${post.$id}`} className="grid-post_link">
              <img
                src={post.imageUrl}
                alt="post"
                className="h-full w-full object-cover"
              />
            </Link>

            <div className="grid-post_user">
              {showUser && post.creator && (
                <div className="flex items-center justify-start gap-2 flex-1">
                  <img
                    src={
                      post.creator.imageUrl ||
                      "/assets/icons/profile-placeholder.svg"
                    }
                    alt="creator"
                    className="w-8 h-8 rounded-full"
                  />
                  <p className="line-clamp-1">{post.creator.name}</p>
                </div>
              )}
              {showStats && user?.id && <PostStats post={post} userId={user.id} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default GridPostList;
