import { useEffect, useState, useRef } from "react";
import { useUserContext } from "@/context/AuthContext";

import useDebounce from "@/hooks/useDebounce";
import { useGetPosts, useSearchPosts, useSearchUsers } from "@/lib/react-query/queriesAndMutations";

import { Input } from "@/components/ui/input";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
import UserCard from "@/components/shared/UserCard";

import { useInView } from "react-intersection-observer";

const Explore = () => {
  const { user } = useUserContext();
  const loggedUserId = user?.id || "";

  const { ref, inView } = useInView();

  const [searchType, setSearchType] = useState<"posts" | "users">("posts");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts();

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);

  const { data: searchedPosts, isFetching: isSearchFetchingPosts } = useSearchPosts(
    searchType === "posts" ? debouncedSearch : ""
  );

  const { data: searchedUsers, isFetching: isSearchFetchingUsers } = useSearchUsers(
    searchType === "users" ? debouncedSearch : ""
  );

  useEffect(() => {
    if (inView && !searchValue && searchType === "posts") {
      fetchNextPage();
    }
  }, [inView, searchValue, searchType, fetchNextPage]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!posts)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const shouldShowSearchResults = searchValue !== "";
  const shouldShowPosts = !shouldShowSearchResults && posts.pages.every((item) => item.documents.length === 0);

  return (
    <div className="explore-container">
      <div
        ref={dropdownRef}
        className="relative inline-block mb-6"
        style={{ textAlign: "left", paddingLeft: 0, width: "100%", maxWidth: "600px" }}
      >
        <span
          style={{
            fontSize: "2.4rem",
            fontWeight: 700,
            color: "white",
            userSelect: "none",
            marginRight: "0.5rem",
            lineHeight: 1,
          }}
        >
          Buscar
        </span>

        <div
          className="relative inline-flex items-center select-none cursor-pointer"
          onClick={() => setDropdownOpen((prev) => !prev)}
          onMouseEnter={(e) => {
            const target = e.currentTarget;
            const span = target.querySelector("span");
            const svg = target.querySelector("svg");
            if (span) span.style.color = "#3b82f6"; // azul tailwind-500
            if (svg) svg.style.color = "#3b82f6";
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget;
            const span = target.querySelector("span");
            const svg = target.querySelector("svg");
            if (span) span.style.color = "white";
            if (svg) svg.style.color = "white";
          }}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          <span
            style={{
              fontSize: "2.4rem",
              fontWeight: 700,
              color: "white",
              transition: "color 0.3s",
              lineHeight: 1,
            }}
          >
            {searchType === "posts" ? "Postagens" : "Usuários"}
          </span>
          <svg
            className={`inline-block w-8 h-8 ml-1 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : "rotate-0"
            }`}
            style={{ color: "white", transition: "color 0.3s", verticalAlign: "middle" }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {dropdownOpen && (
          <div
            className="absolute mt-1 bg-dark-3 rounded shadow-lg z-10 min-w-[140px]"
            style={{ top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "0.25rem" }}
          >
            <button
              onClick={() => {
                setSearchType("posts");
                setDropdownOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-white hover:bg-dark-4 ${
                searchType === "posts" ? "bg-dark-4 font-semibold" : ""
              }`}
              type="button"
            >
              Postagens
            </button>
            <button
              onClick={() => {
                setSearchType("users");
                setDropdownOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-white hover:bg-dark-4 ${
                searchType === "users" ? "bg-dark-4 font-semibold" : ""
              }`}
              type="button"
            >
              Usuários
            </button>
          </div>
        )}
      </div>

      <div className="explore-inner_container">
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img src="/assets/icons/search.svg" width={24} height={24} alt="search" />
          <Input
            type="text"
            placeholder={`Pesquisar ${searchType === "posts" ? "postagens" : "usuários"}`}
            className="explore-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

            <div className="flex flex-wrap gap-9 w-full max-w-5xl mt-16 mb-7">
        {shouldShowSearchResults ? (
          searchType === "posts" ? (
            isSearchFetchingPosts ? (
              <Loader />
            ) : searchedPosts && searchedPosts.documents.length > 0 ? (
              <GridPostList posts={searchedPosts.documents} />
            ) : (
              <p className="text-light-4 mt-10 text-center w-full">Nenhuma Postagem encontrada</p>
            )
          ) : isSearchFetchingUsers ? (
            <Loader />
          ) : searchedUsers && searchedUsers.documents.length > 0 ? (
            <div className="common-container w-full ">
              <div className="user-container">
                <ul className="user-grid">
                  {searchedUsers.documents.map((user: any) => (
                    <li key={user.$id} className="flex-1 min-w-[200px] w-full">
                      <UserCard user={user} loggedUserId={loggedUserId} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-light-4 mt-10 text-center w-full">Nenhum Usuário encontrado</p>
          )
        ) : searchType === "posts" ? (
          shouldShowPosts ? (
            <p className="text-light-4 mt-10 text-center w-full"></p>
          ) : (
            posts.pages.map((item, index) => <GridPostList key={`page-${index}`} posts={item.documents} />)
          )
        ) : (
          <p className="text-light-4 mt-10 text-center w-full">Digite algo para buscar usuários</p>
        )}
      </div>
      {hasNextPage && !searchValue && searchType === "posts" && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Explore;
