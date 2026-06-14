"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Clock, Bell, Users, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Bell,
    title: "Notificación automática",
    desc: "Cuando se libera una plaza, el siguiente en la cola recibe SMS y email.",
  },
  {
    icon: Clock,
    title: "Ventana de 2 horas",
    desc: "El usuario tiene 2 horas para confirmar antes de pasar al siguiente.",
  },
  {
    icon: Users,
    title: "Prioridad por orden",
    desc: "La cola respeta el orden de registro y la wilaya del solicitante.",
  },
  {
    icon: Zap,
    title: "Procesamiento en tiempo real",
    desc: "Las cancelaciones activan la cola automáticamente vía BullMQ.",
  },
];

export default function ListaEsperaPage() {
  return (
    <div className="animate-fade-up">
      <AdminPageHeader
        badge="Automatizado"
        title="Lista de espera"
        subtitle="Sistema automático de gestión cuando las cuotas diarias están agotadas"
      />

      <div className="tariq-admin-glass mb-8 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-polisario/10">
          <Clock className="h-8 w-8 text-polisario" />
        </div>
        <h2 className="text-lg font-bold text-text-main">Cola vacía</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-main/55">
          No hay usuarios en lista de espera en este momento. El sistema se
          activará automáticamente cuando una cuota se llene.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="tariq-stat-card p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-polisario/10 text-polisario">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-text-main">{title}</h3>
                <p className="mt-1 text-sm text-text-main/55">{desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
