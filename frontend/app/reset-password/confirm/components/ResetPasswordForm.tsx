"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Verificar se há erros na URL
    const urlError = searchParams.get("error");
    const errorCode = searchParams.get("error_code");
    const errorDescription = searchParams.get("error_description");

    if (urlError || errorCode) {
      // Se houver erro na URL, o token é inválido
      setIsValidToken(false);
      if (errorCode === "otp_expired") {
        setError("O link de redefinição de senha expirou. Por favor, solicite um novo link.");
      } else if (errorDescription) {
        setError(decodeURIComponent(errorDescription));
      } else {
        setError("O link de redefinição de senha é inválido ou expirou.");
      }
      return;
    }

    // Verificar se há um token válido na URL e processá-lo
    const checkToken = async () => {
      try {
        // Verificar se há hash na URL (Supabase usa hash para tokens de redefinição)
        const hash = window.location.hash;
        
        // Se houver hash, o Supabase precisa processá-lo
        // O createBrowserClient processa automaticamente, mas pode precisar de um momento
        if (hash && (hash.includes('access_token') || hash.includes('type=recovery'))) {
          // Aguardar um momento para o Supabase processar o hash
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Tentar obter a sessão (isso processa o hash automaticamente)
        const { data, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error("Erro ao verificar sessão:", authError);
          setIsValidToken(false);
          setError("Erro ao verificar o link. Por favor, solicite um novo link.");
          return;
        }

        // Se houver sessão, o token é válido
        if (data.session) {
          setIsValidToken(true);
          return;
        }

        // Se não houver sessão e não houver hash, o link pode estar incompleto
        if (!hash) {
          setIsValidToken(false);
          setError("Link inválido. Por favor, use o link completo enviado por email.");
          return;
        }

        // Se houver hash mas não houver sessão, pode ser que o token expirou
        // Tentar mais uma vez após um delay maior
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: retryData, error: retryError } = await supabase.auth.getSession();
        
        if (retryError || !retryData.session) {
          setIsValidToken(false);
          setError("O link de redefinição de senha é inválido ou expirou.");
          return;
        }
        
        setIsValidToken(true);
      } catch (err) {
        console.error("Erro ao verificar token:", err);
        setIsValidToken(false);
        setError("Erro ao processar o link. Por favor, solicite um novo link.");
      }
    };
    
    checkToken();
  }, [searchParams, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      // Senha atualizada com sucesso, redirecionar para login
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError("Erro ao redefinir senha. Tente novamente.");
      setLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Verificando token...</p>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-destructive bg-destructive/10 dark:bg-destructive/20 p-4 rounded-md border border-destructive/20">
          <p className="font-medium mb-2">Link inválido ou expirado</p>
          <p className="text-muted-foreground">
            {error || "O link de redefinição de senha é inválido ou expirou. Por favor, solicite um novo link."}
          </p>
        </div>
        <div className="space-y-2">
          <Button
            onClick={() => router.push("/reset-password")}
            className="w-full"
          >
            Solicitar novo link
          </Button>
          <Button
            onClick={() => router.push("/login")}
            variant="outline"
            className="w-full"
          >
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Nova Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          A senha deve ter pelo menos 6 caracteres
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={loading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Redefinindo..." : "Redefinir senha"}
      </Button>
    </form>
  );
}
