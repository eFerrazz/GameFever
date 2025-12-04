import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { account } from "@/lib/appwrite/config";

const ResetPasswordSchema = z.object({
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof ResetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordForm) {
    if (!userId || !secret) {
      toast({ title: "Parâmetros inválidos." });
      return;
    }

    try {
      await account.updateRecovery(userId, secret, data.password);
      toast({ title: "Senha alterada com sucesso!" });
      navigate("/sign-in");
    } catch (error: any) {
      toast({ title: error.message || "Erro ao alterar senha." });
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-dark-2 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Redefinir Senha</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          type="password"
          placeholder="Nova senha"
          {...form.register("password")}
          className="shad-input"
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
        )}

        <Input
          type="password"
          placeholder="Confirme a nova senha"
          {...form.register("confirmPassword")}
          className="shad-input"
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-red-500 text-sm">{form.formState.errors.confirmPassword.message}</p>
        )}

        <Button type="submit" className="shad-button_primary">
          Alterar senha
        </Button>
      </form>
    </div>
  );
}
