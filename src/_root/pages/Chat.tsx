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

import { useLocation } from "react-router-dom";

const Chat: React.FC = () => {
  const { data: currentUser } = useGetCurrentUser();
  const { data: conversationsData, isLoading: loadingConversations } = useGetConversations();

  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [otherUserIdForTest, setOtherUserIdForTest] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { mutate: createConv, isLoading: creatingConv } = useCreateConversation();
  const { data: messagesData, isLoading: loadingMessages } = useGetMessages(
    selectedConversation?.$id || ""
  );
  const { mutate: sendMsg, isLoading: sendingMsg } = useSendMessage();

  const conversations = conversationsData?.documents || [];
  const messages = messagesData?.documents || [];

  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatScreen, setShowChatScreen] = useState(false);

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
        onSuccess: () => setNewMessage(""),
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
          <ul className="flex flex-col gap-4" role="list" aria-label="Lista de conversas">
            {conversations.map((conv) => {
              const otherUser = conv.otherUser as IUser | null;
              const isActive = selectedConversation?.$id === conv.$id;

              return (
                <li
                  key={conv.$id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition
                    ${isActive ? "bg-dark-4 border border-primary-500" : "hover:bg-dark-3"}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleSelectConversation(conv)}
                  aria-label={`Conversar com ${otherUser?.username || "Usuário"}`}
                >
                  <img
                    src={otherUser?.imageUrl || "/assets/icons/profile-placeholder.svg"}
                    alt={`Avatar de ${otherUser?.username || "Usuário"}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-dark-4"
                  />
                  <div className="flex flex-col">
                    <p className="text-lg font-semibold text-light-1">
                      {otherUser?.username || otherUser?.name || "Usuário"}
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

       {/* <div className="mt-6 bg-dark-3 p-4 rounded-xl">
          <label className="text-lg text-light-2 mb-2 block" htmlFor="test-chat-input">
            Iniciar chat (teste)
          </label>
          <input
            id="test-chat-input"
            type="text"
            className="shad-input w-full mb-3 px-4 py-2 rounded-full text-lg"
            placeholder="ID do outro usuário"
            value={otherUserIdForTest}
            onChange={(e) => setOtherUserIdForTest(e.target.value)}
            aria-describedby="test-chat-help"
          />
          <p id="test-chat-help" className="sr-only">Digite o ID do usuário para iniciar uma conversa de teste</p>
          <button
            className="shad-button_primary w-full py-3 text-lg rounded-full"
            onClick={() => handleCreateChat(otherUserIdForTest)}
            disabled={creatingConv || !otherUserIdForTest}
            aria-label="Iniciar chat de teste"
          >
            {creatingConv ? "Criando..." : "Iniciar Chat"}
          </button>
        </div> */}
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
            {/* HEADER: Fixo no topo */}
            <header className="flex-shrink-0 flex items-center gap-4 px-8 py-6 bg-dark-1 border-b border-dark-4">
              {isMobileView && (
                <button
                  onClick={() => setShowChatScreen(false)}
                  className="text-light-1 text-4xl mr-4"
                  aria-label="Voltar para conversas"
                >
                  ‹
                </button>
              )}
              <img
                src={
                  loadingOtherUser
                    ? "/assets/icons/profile-placeholder.svg"
                    : otherUserData?.imageUrl || "/assets/icons/profile-placeholder.svg"
                }
                alt={`Avatar de ${otherUserData?.username || "Usuário"}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-dark-4"
              />
              <p className="text-2xl font-bold text-light-1">
                {loadingOtherUser
                  ? "Carregando..."
                  : otherUserData?.username || otherUserData?.name || "Usuário"}
              </p>
            </header>

            {/* CONTEÚDO DAS MENSAGENS: Scroll independente */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 flex flex-col gap-4">
              {loadingMessages ? (
                <p className="text-lg text-light-3">Carregando mensagens...</p>
              ) : messages.length === 0 ? (
                <p className="text-center text-lg text-light-3">Nenhuma mensagem. Envie a primeira!</p>
              ) : (
                messages.map((msg: IMessage) => {
                  const mine = msg.senderId === currentUser.$id;
                  return (
                    <div key={msg.$id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`
                          ${mine ? "bg-primary-500 text-light-1" : "bg-dark-4 text-light-1"}
                          rounded-2xl p-4 max-w-[70%] text-lg break-words
                        `}
                      >
                        <p>{msg.content}</p>
                        <div className="text-sm text-light-3 mt-1 text-right">
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ""}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* FOOTER: Fixo no bottom */}
            <footer className="flex-shrink-0 bg-dark-2 px-6 py-4 border-t border-dark-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(e);
                }}
                className="flex items-center gap-4"
              >
                <input
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
                    sendingMsg || !newMessage.trim() ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={sendingMsg || !newMessage.trim()}
                  aria-label="Enviar mensagem"
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
