"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erro ao fazer logout:", error);
      } else {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      variant="outline"
      className="bg-[#FFCC00] hover:bg-[#FFCC00]/90 text-black border-black"
    >
      {loading ? "Saindo..." : "Sair"}
    </Button>
  );
}
