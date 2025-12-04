import { Button } from '@/components/ui/button';
import { account } from '@/lib/appwrite/config';
import React, { useState } from 'react';
 // ou de onde importa seu client Appwrite

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectUrl = `${window.location.origin}/reset-password`; // Ajuste essa rota para sua página real de reset

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await account.createRecovery(email, redirectUrl);
      setMessage('Email de redefinição enviado! Verifique sua caixa de entrada.');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-dark-2 rounded-xl">
      <h1 className="text-2xl font-bold mb-4">Redefinir senha</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder=" Digite seu email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="shad-input rounded-md"
        />
        <Button
          type="submit"
          disabled={loading}
          className="shad-button_primary rounded-full"
        >
          {loading ? 'Enviando...' : 'Enviar email'}
        </Button>
      </form>
      {message && <p className="mt-4 text-green-400">{message}</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}
