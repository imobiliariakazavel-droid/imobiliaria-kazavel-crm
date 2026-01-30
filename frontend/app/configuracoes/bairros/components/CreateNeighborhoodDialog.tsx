"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNeighborhood } from "@/lib/api/neighborhoods";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CitySelect } from "@/components/ui/city-select";
import { Loader2 } from "lucide-react";

interface CreateNeighborhoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateNeighborhoodDialog({
  open,
  onOpenChange,
}: CreateNeighborhoodDialogProps) {
  const [name, setName] = useState("");
  const [cityId, setCityId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createNeighborhood,
    onSuccess: (data) => {
      if (data.status) {
        // Invalidar cache para recarregar a lista
        queryClient.invalidateQueries({ queryKey: ["neighborhoods"] });
        // Resetar formulário
        setName("");
        setCityId("");
        setError(null);
        onOpenChange(false);
      } else {
        setError(data.message);
      }
    },
    onError: (error: Error) => {
      setError(error.message || "Erro ao criar bairro");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("O nome do bairro é obrigatório");
      return;
    }

    if (!cityId) {
      setError("A cidade é obrigatória");
      return;
    }

    mutation.mutate({
      name: name.trim(),
      cityId,
    });
  };

  const handleClose = () => {
    if (!mutation.isPending) {
      setName("");
      setCityId("");
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogClose onClose={handleClose} />
        <DialogHeader>
          <DialogTitle>Criar Novo Bairro</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="neighborhood-name">Nome do Bairro</Label>
            <Input
              id="neighborhood-name"
              placeholder="Digite o nome do bairro"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={mutation.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood-city">Cidade</Label>
            <CitySelect
              id="neighborhood-city"
              value={cityId}
              onChange={setCityId}
              disabled={mutation.isPending}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Bairro"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
