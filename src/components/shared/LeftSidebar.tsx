import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { useSignOutAccount } from '@/lib/react-query/queriesAndMutations';
import { useUserContext } from '@/context/AuthContext';
import { sidebarLinks } from '@/constants';
import type { INavLink } from '@/types';

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { user } = useUserContext();

  
  const [audioEnabled, setAudioEnabled] = useState(false);

 
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess]);

 
  const handlePlayAudio = (src: string) => {
    if (!audioEnabled || !audioRef.current) return;
    audioRef.current.src = src;
    audioRef.current.play();
  };

  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11">
        
        <Link to="/" className="flex gap-3 items-center">
          <img src="/assets/images/logo.svg" alt="logo" width={250} height={36} />
        </Link>

        <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
          <img
            src={user.imageUrl || '/assets/images/profile-placeholder.svg'}
            alt="profile"
            className="h-14 w-14 rounded-full"
          />
          <div className="flex flex-col">
            <p className="body-bold">{user.name}</p>
            <p className="small-regular text-light-3">{user.username}</p>
          </div>
        </Link>

        <ul className="flex flex-col gap-6">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;
            return (
              <li
                key={link.label}
                className={`leftsidebar-link group ${isActive && 'bg-primary-500'}`}
              >
                <NavLink
                  to={link.route}
                  className="flex gap-4 items-center p-4"
                  onMouseEnter={() =>
                    handlePlayAudio(`/audios/${link.label}.mp3`)
                  }
                >
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`group-hover:invert-white ${isActive && 'invert-white'}`}
                  />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>


      <Button
        variant="ghost"
        className="shad-button_ghost"
        onClick={() => signOut()}
      >
        <img src="/assets/icons/logout.svg" alt="logout" />
        <p className="small-medium lg:base-medium">Sair</p>
      </Button>

      <button
        onClick={() => setAudioEnabled((prev) => !prev)}
        className="absolute mt-0 left-0 w-10 h-10 flex items-center justify-center 
                   opacity-50 hover:opacity-90"
        title="Ativar/Desativar acessibilidade"
      >
        {audioEnabled ? '🔊' : '🔇'}
      </button>


      <audio ref={audioRef} />
    </nav>
  );
};

export default LeftSidebar;
