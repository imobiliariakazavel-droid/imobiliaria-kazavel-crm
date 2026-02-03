"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Settings, MapPin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "./components/ChangePasswordDialog";
import { getCurrentUser } from "@/lib/api/users";

export default function ConfiguracoesPage() {
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);

  const { data: currentUserData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const currentUserRole = currentUserData?.data?.role;
  const isAdmin = currentUserRole === "admin";

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema
        </p>
      </div>

      {/* Alterar Senha */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Alterar Senha</h2>
              <p className="text-sm text-muted-foreground">
                Altere sua senha de acesso ao sistema
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsChangePasswordDialogOpen(true)}
            className="bg-[#FFCC00] hover:bg-[#FFCC00]/90 text-black border-black"
          >
            Alterar Senha
          </Button>
        </div>
      </div>

      {/* Outras Configurações - Apenas para Admin */}
      {isAdmin && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Outras Configurações</h2>
          <div className="grid gap-4">
            <Link href="/configuracoes/bairros">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-6 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-lg">Bairros</h3>
                    <p className="text-sm text-muted-foreground">
                      Gerencie os bairros cadastrados no sistema
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      )}

      <ChangePasswordDialog
        open={isChangePasswordDialogOpen}
        onOpenChange={setIsChangePasswordDialogOpen}
      />
    </div>
  );
}
