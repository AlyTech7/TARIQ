"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { WILAYA_QUOTAS, WILAYA_LABELS, WILAYA_INFO, WILAYA_ORDER } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLocale } from "next-intl";
import { Save, MapPin, Users, Ticket, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { superPanel } from "@/components/admin/super-theme";
import type { Wilaya } from "@prisma/client";

export default function WilayasConfigPage() {
  const locale = useLocale();
  const lang = locale as "ar" | "es" | "fr";
  const { data: configs, refetch } = trpc.quotas.getConfigs.useQuery();
  const updateConfig = trpc.quotas.updateConfig.useMutation({
    onSuccess: () => refetch(),
  });
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState<string | null>(null);

  const list =
    configs ??
    WILAYA_ORDER.map((wilaya) => ({
      wilaya,
      daily: WILAYA_QUOTAS[wilaya],
      id: wilaya,
    }));

  async function handleSave(wilaya: string, defaultDaily: number) {
    const daily = editing[wilaya] ?? defaultDaily;
    await updateConfig.mutateAsync({
      wilaya: wilaya as Wilaya,
      daily,
    });
    setSaved(wilaya);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div className="animate-fade-up">
      <AdminPageHeader
        dark
        badge="Configuración"
        title="Cuotas por wilaya"
        subtitle="Ajusta la capacidad diaria de tickets para cada campamento"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((config) => {
          const info = WILAYA_INFO[config.wilaya as Wilaya];
          const label = WILAYA_LABELS[config.wilaya as Wilaya][lang];
          const current = editing[config.wilaya] ?? config.daily;
          const isSaved = saved === config.wilaya;

          return (
            <div
              key={config.wilaya}
              className={cn(superPanel, "group p-5 transition-all hover:shadow-polisario/20 hover:shadow-xl")}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    {config.wilaya}
                    {info.adminCenter && (
                      <span className="ms-2 text-sun">★ RASD</span>
                    )}
                  </p>
                  <h3 className="mt-0.5 text-lg font-bold text-white">{label}</h3>
                </div>
                <MapPin className="h-4 w-4 text-green-400" />
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {info.approxPop}
                </span>
                <span className="flex items-center gap-1">
                  <Ticket className="h-3 w-3" /> {info.dairas} dairas
                </span>
              </div>

              <p className="mt-2 line-clamp-2 text-xs text-neutral-400">
                {info.desc[lang]}
              </p>

              <div className="mt-5 flex items-center gap-2 border-t border-polisario/15 pt-4">
                <Input
                  type="number"
                  min={1}
                  max={200}
                  value={current}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      [config.wilaya]: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-20 border-polisario/30 bg-[#0d0a08] text-white"
                />
                <span className="text-xs text-neutral-400">tickets/día</span>
                <Button
                  size="sm"
                  className={cn(
                    "ms-auto gap-1",
                    isSaved
                      ? "bg-green-600 hover:bg-green-600"
                      : "bg-polisario hover:bg-polisario-light",
                  )}
                  disabled={updateConfig.isPending}
                  onClick={() => handleSave(config.wilaya, config.daily)}
                >
                  {isSaved ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                  {isSaved ? "Guardado" : "Guardar"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
