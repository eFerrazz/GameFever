import { useState, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useSignOutAccount } from '@/lib/react-query/queriesAndMutations';
import { useUserContext } from '@/context/AuthContext';
import { sidebarLinks } from '@/constants';
import type { INavLink } from '@/types';
import { Volume2, VolumeX } from "lucide-react";

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const { user } = useUserContext();

  const [audioEnabled, setAudioEnabled] = useState(false); // Começa OFF
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (isSuccess) navigate(0);

  const handlePlayAudio = (src: string) => {
    if (!audioEnabled || !audioRef.current) return;
    audioRef.current.src = src;
    audioRef.current.play().catch(() => {});
  };

  const toggleNarrator = () => {
    setAudioEnabled(prev => !prev);
  };

  const hideNarrator = pathname === "/chat" || pathname === "/create-post" || pathname === "/update-profile";

  return (
    <nav className="leftsidebar relative">
      <div className="flex flex-col gap-11">
        {/* Logo */}
        <Link to="/" className="flex gap-3 items-center">
          <img src="/assets/images/logo.svg" alt="logo" width={250} height={36} />
        </Link>

        {/* Perfil */}
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

        {/* Links */}
        <ul className="flex flex-col gap-6">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;
            return (
              <li key={link.label} className={`leftsidebar-link group ${isActive ? 'bg-primary-500' : ''}`}>
                <NavLink
                  to={link.route}
                  className="flex gap-4 items-center p-4"
                  onMouseEnter={() => handlePlayAudio(`/audios/${link.label}.mp3`)}
                >
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`group-hover:invert-white ${isActive ? 'invert-white' : ''}`}
                  />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Botão Sair */}
      <Button
        variant="ghost"
        className="shad-button_ghost"
        onClick={() => signOut()}
        onMouseEnter={() => handlePlayAudio('/audios/Sair.mp3')}
      >
        <img src="/assets/icons/logout.svg" alt="logout" />
        <p className="small-medium lg:base-medium">Sair</p>
      </Button>

       {/* Botão narrador - só aparece se não estiver em Chat ou CriarPost */}
    {!hideNarrator && (
      <div className="fixed bottom-5 right-5">
        <button
          onClick={toggleNarrator}
          className="w-14 h-14 rounded-full bg-dark-3 text-white flex items-center justify-center
                     shadow-lg hover:bg-dark-4 hover:scale-105 transition-all duration-300 cursor-pointer"
          title={audioEnabled ? "Narrador: ON" : "Narrador: OFF"}
        >
          {audioEnabled ? <Volume2 className="w-7 h-7" /> : <VolumeX className="w-7 h-7" />}
        </button>
      </div>
    )}

    <audio ref={audioRef} />
  </nav>
);

}

export default LeftSidebar;
