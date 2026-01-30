"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNeighborhood, type Neighborhood } from "@/lib/api/neighborhoods";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteNeighborhoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  neighborhood: Neighborhood | null;
}

export function DeleteNeighborhoodDialog({
  open,
  onOpenChange,
  neighborhood,
}: DeleteNeighborhoodDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteNeighborhood,
    onSuccess: (data) => {
      if (data.status) {
        // Invalidar cache para recarregar a lista
        queryClient.invalidateQueries({ queryKey: ["neighborhoods"] });
        setError(null);
        onOpenChange(false);
      } else {
        setError(data.message);
      }
    },
    onError: (error: Error) => {
      setError(error.message || "Erro ao excluir bairro");
    },
  });

  const handleDelete = () => {
    if (!neighborhood) {
      setError("Bairro não selecionado");
      return;
    }

    setError(null);
    mutation.mutate(neighborhood.id);
  };

  const handleClose = () => {
    if (!mutation.isPending) {
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogClose onClose={handleClose} />
        <DialogHeader>
          <DialogTitle>Excluir Bairro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm">
                Tem certeza que deseja excluir o bairro{" "}
                <span className="font-semibold">
                  {neighborhood?.name}
                </span>
                ?
              </p>
              <p className="text-sm text-muted-foreground">
                Esta ação não pode ser desfeita. O bairro será marcado como
                excluído e não aparecerá mais na lista.
              </p>
            </div>
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
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir Bairro"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
