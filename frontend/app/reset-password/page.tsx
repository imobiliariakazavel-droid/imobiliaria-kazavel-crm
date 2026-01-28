import { ResetPasswordRequestForm } from "./components/ResetPasswordRequestForm";

export const metadata = {
  title: "Redefinir Senha - Imobiliária Kazavel CRM",
  description: "Solicite a redefinição de senha",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Imobiliária Kazavel</h1>
          <p className="text-muted-foreground">
            Redefinir senha
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <ResetPasswordRequestForm />
        </div>
      </div>
    </div>
  );
}
