"use client";

import Link from "next/link";
import { Settings, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfiguracoesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema
        </p>
      </div>

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
  );
}
