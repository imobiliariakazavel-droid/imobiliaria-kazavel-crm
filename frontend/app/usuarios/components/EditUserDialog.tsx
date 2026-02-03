"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser, type User, type UserRole } from "@/lib/api/users";
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
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
}: EditUserDialogProps) {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("standard");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Preencher formulário quando o usuário for selecionado ou dialog abrir
  useEffect(() => {
    if (user && open) {
      setFullName(user.full_name);
      setRole(user.role);
      setIsActive(user.is_active);
      setError(null);
    }
  }, [user, open]);

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      if (data.status) {
        // Invalidar cache para recarregar a lista
        queryClient.invalidateQueries({ queryKey: ["users"] });
        // Resetar formulário
        setFullName("");
        setRole("standard");
        setIsActive(true);
        setError(null);
        onOpenChange(false);
      } else {
        setError(data.message);
      }
    },
    onError: (error: Error) => {
      setError(error.message || "Erro ao atualizar usuário");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("Usuário não selecionado");
      return;
    }

    if (!fullName.trim()) {
      setError("O nome completo é obrigatório");
      return;
    }

    mutation.mutate({
      id: user.id,
      full_name: fullName.trim(),
      role,
      is_active: isActive,
    });
  };

  const handleClose = () => {
    if (!mutation.isPending) {
      setFullName("");
      setRole("standard");
      setIsActive(true);
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogClose onClose={handleClose} />
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-user-full-name">Nome Completo</Label>
            <Input
              id="edit-user-full-name"
              placeholder="Digite o nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={mutation.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-user-role">Papel do Usuário</Label>
            <Select
              id="edit-user-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={mutation.isPending}
              required
            >
              <option value="standard">Padrão</option>
              <option value="admin">Administrador</option>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-user-is-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={mutation.isPending}
            />
            <Label
              htmlFor="edit-user-is-active"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Usuário ativo
            </Label>
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
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
