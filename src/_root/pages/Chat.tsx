import React, { useEffect, useRef, useState } from "react";
import type { IConversation, IMessage, IUser } from "@/types";
import {
  useGetCurrentUser,
  useGetConversations,
  useCreateConversation,
  useGetMessages,
  useSendMessage,
  useGetUserById,
} from "@/lib/react-query/queriesAndMutations";

import { Link, useLocation } from "react-router-dom";

import { EmojiPicker } from "@ferrucc-io/emoji-picker";
import { SmilePlus } from "lucide-react";
import { Laugh } from "lucide-react";


const Chat: React.FC = () => {
  const { data: currentUser } = useGetCurrentUser();
  const { data: conversationsData, isLoading: loadingConversations } = useGetConversations();

  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [otherUserIdForTest, setOtherUserIdForTest] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { mutate: createConv, isPending: creatingConv } = useCreateConversation();
  const { data: messagesData, isLoading: loadingMessages } = useGetMessages(
    selectedConversation?.$id || ""
  );
  const { mutate: sendMsg, isPending: sendingMsg } = useSendMessage();

  const conversations = conversationsData?.documents || [];
  const messages = messagesData?.documents || [];

  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatScreen, setShowChatScreen] = useState(false);

  /** EMOJI PICKER */
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const emojiRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null); // Alterado de volta para HTMLInputElement

  const handleEmojiSelect = (emoji: any) => {
    console.log(emoji); // Depuração: verifique o console para confirmar a estrutura
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const text = input.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      // Ajuste: use 'emoji.emoji' (Unicode) ou fallback para 'emoji' se for string direta
      const emojiChar = typeof emoji === 'string' ? emoji : (emoji.emoji || emoji.native || '');
      if (!emojiChar) {
        console.warn('Emoji não encontrado no objeto:', emoji);
        return;
      }
      const newText = before + emojiChar + after;
      setNewMessage(newText);
      // Focar e posicionar cursor após o emoji inserido
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emojiChar.length, start + emojiChar.length);
      }, 0);
    }
  };

  useEffect(() => {
    const checkScreen = () => setIsMobileView(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const handleSelectConversation = (conv: IConversation) => {
    setSelectedConversation(conv);
    if (isMobileView) setShowChatScreen(true);
  };

  const otherUserId = selectedConversation?.otherUser?.$id;
  const { data: otherUserData, isLoading: loadingOtherUser } = useGetUserById(otherUserId || "");

  const location = useLocation();
  const conversationFromState = location.state?.selectedConversation;

  useEffect(() => {
    if (conversationFromState) {
      setSelectedConversation(conversationFromState);
      if (isMobileView) setShowChatScreen(true);
    }
  }, [conversationFromState, isMobileView]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** FECHAR EMOJI AO CLICAR FORA */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(e.target as Node)
      ) {
        setIsEmojiOpen(false);
      }
    };
    if (isEmojiOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isEmojiOpen]);

  const handleCreateChat = (otherUserId: string) => {
    if (!currentUser?.$id || !otherUserId) {
      alert("Usuário não logado ou ID inválido");
      return;
    }
    createConv([currentUser.$id, otherUserId], {
      onSuccess: (conv: any) => {
        setSelectedConversation(conv);
        if (isMobileView) setShowChatScreen(true);
      },
    });
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedConversation || !newMessage.trim() || !currentUser?.$id) return;
    if (newMessage.length > 500) {
      alert("Mensagem muito longa (máx. 500 caracteres)");
      return;
    }

    sendMsg(
      {
        conversationId: selectedConversation.$id,
        content: newMessage.trim(),
        senderId: currentUser.$id,
      },
      {
        onSuccess: () => {
          setNewMessage("");
          setIsEmojiOpen(false);
        },
      }
    );
  };

  if (!currentUser) {
    return (
      <div className="flex-center w-full min-h-screen">
        <div className="post-card p-6">
          <p className="text-lg font-semibold">Faça login para acessar o chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-dark-3 overflow-hidden">

      {/* SIDEBAR */}
      <aside
        className={`
          flex flex-col bg-dark-1 p-6 overflow-y-auto
          ${isMobileView ? "w-full" : "w-80"}
          ${isMobileView && showChatScreen ? "hidden" : "block"}
        `}
      >
        <h3 className="text-2xl font-bold mb-4">Conversas</h3>

        {loadingConversations ? (
          <p className="text-lg text-light-3">Carregando conversas...</p>
        ) : conversations.length === 0 ? (
          <p className="text-lg text-light-3">Nenhuma conversa ainda</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {conversations.map((conv) => {
              const otherUser = conv.otherUser as IUser | null;
              const isActive = selectedConversation?.$id === conv.$id;

              return (
                <li
                  key={conv.$id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition
                    ${isActive ? "bg-dark-4 border border-primary-500" : "hover:bg-dark-3"}`}
                >
                  <img
                    src={otherUser?.imageUrl || "/assets/icons/profile-placeholder.svg"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-dark-4"
                  />
                  <div className="flex flex-col">
                    <p className="text-lg font-semibold text-light-1">
                      {otherUser?.name || "Usuário"}
                    </p>
                    <p className="text-sm text-light-3 truncate max-w-[180px]">
                      {conv.lastMessage || "Nenhuma mensagem"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* CHAT AREA */}
      <main
        className={`
          flex flex-col flex-1 overflow-hidden bg-dark-3
          ${isMobileView && !showChatScreen ? "hidden" : "flex"}
        `}
      >
        {selectedConversation ? (
          <>
            {/* HEADER */}
            <header className="flex-shrink-0 flex items-center gap-4 px-8 py-6 bg-dark-1 border-b border-dark-4">
              {isMobileView && (
                <button
                  onClick={() => setShowChatScreen(false)}
                  className="text-light-1 text-4xl mr-4"
                >
                  ‹
                </button>
              )}

              <Link to={`/profile/${otherUserData?.$id}`}>
                <img
                  src={
                    loadingOtherUser
                      ? "/assets/icons/profile-placeholder.svg"
                      : otherUserData?.imageUrl ||
                        "/assets/icons/profile-placeholder.svg"
                  }
                  className="w-16 h-16 rounded-full object-cover border-2 border-dark-4"
                />
              </Link>

              <div className="flex flex-col">
                <p className="text-xl font-semibold text-light-1">
                  {loadingOtherUser
                    ? "Carregando..."
                    : otherUserData?.name || "Usuário"}
                </p>

                <Link to={`/profile/${otherUserData?.$id}`}>
                  <p className="text-sm text-light-3">
                    {loadingOtherUser
                      ? "Carregando..."
                      : `@${otherUserData?.username || "usuario"}`}
                  </p>
                </Link>
              </div>
            </header>

            {/* MENSAGENS */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 flex flex-col gap-4">
              {loadingMessages ? (
                <p className="text-lg text-light-3">Carregando mensagens...</p>
              ) : messages.length === 0 ? (
                <p className="text-center text-lg text-light-3">
                  Nenhuma mensagem. Envie a primeira!
                </p>
              ) : (
                messages.map((msg: IMessage) => {
                  const mine = msg.senderId === currentUser.$id;

                  return (
                    <div key={msg.$id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`
                          relative p-4 max-w-[70%] text-lg break-words rounded-2xl
                          ${mine ? "bg-primary-500 text-light-1 rounded-br-none" : "bg-dark-4 text-light-1 rounded-bl-none"}

                          ${mine
                            ? "after:content-[''] after:absolute after:right-0 after:top-3 after:w-0 after:h-0 after:border-t-[10px] after:border-t-transparent after:border-l-[10px] after:border-l-primary-500 after:border-b-[10px] after:border-b-transparent"
                            : "after:content-[''] after:absolute after:left-0 after:top-3 after:w-0 after:h-0 after:border-t-[10px] after:border-t-transparent after:border-r-[10px] after:border-r-dark-4 after:border-b-[10px] after:border-b-transparent"
                          }
                        `}
                      >
                        <p>{msg.content}</p>

                        <div
                          className={`text-sm mt-1 text-right ${
                            mine ? "text-[#0d1b2a]/60" : "text-light-3"
                          }`}
                        >
                          {msg.timestamp
                            ? new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* FOOTER */}
            <footer className="flex-shrink-0 bg-dark-2 px-6 py-4 border-t border-dark-4 relative">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4">

                {/* BOTÃO EMOJI */}
                <button
                  type="button"
                  onClick={() => setIsEmojiOpen((v) => !v)}
                  className="text-3xl hidden md:block"
                >
                  <SmilePlus className="w-6 h-6 text-light-1" />
                </button>

                {/* POPUP EMOJI */}
                {isEmojiOpen  && !isMobileView && (
                    <div
                    ref={emojiRef}
                    className="
                      absolute bottom-20 left-10
                      bg-dark-2 border border-dark-4
                      rounded-xl shadow-xl select-none
                      p-2 z-50

                      /* Força todos backgrounds internos serem dark */
                      [&_*]:bg-dark-2
                      [&_.emoji-picker-header]:bg-dark-2
                      [&_.emoji-picker-group]:bg-dark-2
                      [&_.emoji-picker-list]:bg-dark-2
                      [&_.emoji-picker-sticky-header]:bg-dark-2

                      /* Força textos */
                      [&_*]:text-light-1

                      /* Scrollbar totalmente dark */
                      [&_*::-webkit-scrollbar]:w-2
                      [&_*::-webkit-scrollbar-track]:bg-dark-2
                      [&_*::-webkit-scrollbar-thumb]:bg-dark-4
                      [&_*::-webkit-scrollbar-thumb:hover]:bg-dark-5
                    "
                  >
                      <EmojiPicker
                          onEmojiSelect={handleEmojiSelect}
                          emojiSize={28}
                          emojisPerRow={9}
                          className="w-full"
                        >
                          <EmojiPicker.Header className="px-2 pb-1">
                            <EmojiPicker.Input
                              placeholder="Pesquisar emoji..."
                              className="
                                w-full h-9 px-3
                                bg-dark-3 border border-dark-4
                                rounded-lg text-sm
                                text-light-1
                                placeholder:text-dark-6
                                focus:ring-2 focus:ring-primary-500 focus:outline-none
                              "
                              hideIcon
                            />
                          </EmojiPicker.Header>

                          <EmojiPicker.Group>
                            <div className="rounded-lg overflow-hidden">
                              <EmojiPicker.List containerHeight={350} hideStickyHeader />
                            </div>
                          </EmojiPicker.Group>
                        </EmojiPicker>
                    </div>
                  )}

                <input
                  ref={inputRef}
                  type="text"
                  className="shad-input flex-1 px-6 py-4 text-lg rounded-full"
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sendingMsg}
                  maxLength={500}
                  aria-label="Digite sua mensagem"
                />

                <button
                  type="submit"
                  className={`shad-button_primary px-6 py-4 text-lg rounded-full transition ${
                    sendingMsg || !newMessage.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={sendingMsg || !newMessage.trim()}
                >
                  {sendingMsg ? "Enviando..." : "Enviar"}
                </button>
              </form>
            </footer>
          </>
        ) : (
          <p className="flex-1 flex-center text-xl text-light-3">
            Selecione uma conversa para começar a bater papo.
          </p>
        )}
      </main>
    </div>
  );
};

export default Chat;
