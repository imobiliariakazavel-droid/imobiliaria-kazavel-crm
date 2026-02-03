import { Suspense } from "react";
import { LoginForm } from "./components/LoginForm";

export const metadata = {
  title: "Login - Imobiliária Kazavel CRM",
  description: "Faça login no sistema de CRM",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Imobiliária Kazavel</h1>
          <p className="text-muted-foreground">
            Faça login para acessar o sistema
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <Suspense fallback={<div className="text-center py-4">Carregando...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
