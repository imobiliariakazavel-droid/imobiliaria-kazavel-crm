import { Suspense } from "react";
import { ResetPasswordForm } from "./components/ResetPasswordForm";

export const metadata = {
  title: "Confirmar Redefinição de Senha - Imobiliária Kazavel CRM",
  description: "Defina sua nova senha",
};

export default function ResetPasswordConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Imobiliária Kazavel</h1>
          <p className="text-muted-foreground">
            Defina sua nova senha
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <Suspense fallback={
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
