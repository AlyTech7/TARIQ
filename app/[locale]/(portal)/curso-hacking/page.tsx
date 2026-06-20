import Link from "next/link";
import { MODULOS, PLATAFORMAS_PRACTICA, ROADMAP_CERTIFICACIONES } from "@/lib/curso-hacking";
import { Shield, ChevronRight, BookOpen, Trophy, Target, Zap } from "lucide-react";

export const metadata = {
  title: "Curso de Hacking Ético | Ciberseguridad Profesional",
  description:
    "Curso completo para convertirte en un experto en ciberseguridad y hacking ético. 12 módulos desde fundamentos hasta nivel experto.",
};

const NIVEL_COLORS: Record<string, string> = {
  Principiante: "bg-green-100 text-green-800 border-green-200",
  Intermedio: "bg-blue-100 text-blue-800 border-blue-200",
  Avanzado: "bg-orange-100 text-orange-800 border-orange-200",
  Experto: "bg-red-100 text-red-800 border-red-200",
};

const NIVEL_DOT: Record<string, string> = {
  Principiante: "bg-green-500",
  Intermedio: "bg-blue-500",
  Avanzado: "bg-orange-500",
  Experto: "bg-red-500",
};

export default async function CursoHackingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] p-8 text-white shadow-2xl sm:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(0,255,65,0.3) 39px,rgba(0,255,65,0.3) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(0,255,65,0.3) 39px,rgba(0,255,65,0.3) 40px)",
          }}
        />
        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 ring-1 ring-green-500/40">
              <Shield className="h-6 w-6 text-green-400" />
            </div>
            <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-green-400 ring-1 ring-green-500/30">
              Curso Completo · 12 Módulos
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Hacking Ético{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              Profesional
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
            De cero a experto en ciberseguridad ofensiva. Aprende las técnicas reales que
            usan los mejores pentesters del mundo, con laboratorios prácticos y herramientas
            profesionales.
          </p>
          <div className="mt-8 flex flex-wrap gap-6">
            {[
              { icon: BookOpen, label: "12 Módulos", sub: "estructurados por nivel" },
              { icon: Target, label: "60+ Labs", sub: "hands-on y prácticos" },
              { icon: Zap, label: "100+ Herramientas", sub: "del arsenal real" },
              { icon: Trophy, label: "Certificaciones", sub: "roadmap completo" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-5 w-5 text-green-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{label}</p>
                  <p className="text-xs text-white/50">{sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
            <p className="font-semibold text-red-300">⚠️ Aviso Legal Importante</p>
            <p className="mt-1 text-white/60">
              Este curso es exclusivamente para <strong className="text-white">uso ético y legal</strong>.
              Nunca apliques estas técnicas en sistemas sin permiso escrito. El hacking sin
              autorización es un delito penal en todos los países.
            </p>
          </div>
        </div>
      </section>

      {/* Módulos grid */}
      <section className="mt-10">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-black text-text-main">
          <span className="text-3xl">📚</span> Módulos del Curso
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULOS.map((modulo) => (
            <Link
              key={modulo.id}
              href={`/${locale}/curso-hacking/${modulo.id}`}
              className="group relative overflow-hidden rounded-2xl border border-sand/30 bg-white/80 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-polisario/40 hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" role="img" aria-label={modulo.titulo}>
                    {modulo.icono}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-text-main/40">Módulo {modulo.numero}</p>
                    <p className="text-sm font-black text-text-main">{modulo.titulo}</p>
                  </div>
                </div>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-text-main/60 line-clamp-3">
                {modulo.descripcion}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${NIVEL_COLORS[modulo.nivel]}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${NIVEL_DOT[modulo.nivel]}`} />
                  {modulo.nivel}
                </span>
                <span className="flex items-center gap-1 text-xs text-text-main/40">
                  {modulo.duracion}
                  <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
              <div className="mt-3 border-t border-sand/20 pt-3">
                <p className="text-xs text-text-main/40">
                  {modulo.temas.length} temas · {modulo.herramientas.length} herramientas ·{" "}
                  {modulo.labs.length} lab{modulo.labs.length !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Roadmap de certificaciones */}
      <section className="mt-12">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-black text-text-main">
          <span className="text-3xl">🎓</span> Roadmap de Certificaciones
        </h2>
        <div className="relative">
          <div className="absolute left-5 top-0 h-full w-0.5 bg-gradient-to-b from-green-500 via-blue-500 via-orange-500 to-red-500 opacity-30" />
          <div className="space-y-4 pl-14">
            {ROADMAP_CERTIFICACIONES.map((cert, i) => (
              <div
                key={cert.nombre}
                className="relative rounded-xl border border-sand/30 bg-white/80 p-5 shadow-sm"
              >
                <div className="absolute -left-[46px] flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-polisario to-polisario-light text-xs font-black text-white shadow-md">
                  {i + 1}
                </div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-text-main">{cert.nombre}</h3>
                    <p className="mt-1 text-sm text-text-main/60">{cert.descripcion}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${NIVEL_COLORS[cert.dificultad]}`}>
                      {cert.dificultad}
                    </span>
                    <span className="text-xs text-text-main/50">{cert.costo}</span>
                    <span className="text-xs text-polisario">{cert.preparacion} prep.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plataformas de práctica */}
      <section className="mt-12">
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-black text-text-main">
          <span className="text-3xl">💻</span> Plataformas de Práctica
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATAFORMAS_PRACTICA.map((p) => (
            <a
              key={p.nombre}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-sand/30 bg-white/80 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-polisario/40 hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="text-2xl">{p.emoji}</span>
                <h3 className="font-black text-text-main group-hover:text-polisario">{p.nombre}</h3>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-text-main/60">{p.descripcion}</p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-sand/30 px-2.5 py-1 text-xs font-medium text-text-main/70">
                  {p.nivel}
                </span>
                <span className="rounded-full bg-polisario/10 px-2.5 py-1 text-xs font-medium text-polisario">
                  {p.precio}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Aviso final */}
      <section className="mt-12 rounded-2xl bg-gradient-to-br from-[#0d1117] to-[#161b22] p-8 text-white">
        <h2 className="text-xl font-black">🚀 Consejo del Experto</h2>
        <p className="mt-3 leading-relaxed text-white/70">
          La ciberseguridad es un campo que requiere <strong className="text-white">práctica constante</strong>.
          Estudia la teoría, pero dedica el <strong className="text-green-400">80% de tu tiempo a labs prácticos</strong>.
          Comienza con TryHackMe, avanza a HackTheBox, obtén el OSCP y construye tu portfolio con writeups.
          El camino es largo pero cada máquina comprometida te acerca al nivel de élite.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { paso: "1", texto: "Empieza con TryHackMe Pre-Security Path", color: "border-green-500/40 bg-green-500/10 text-green-300" },
            { paso: "2", texto: "Completa los 12 módulos y practica cada herramienta", color: "border-blue-500/40 bg-blue-500/10 text-blue-300" },
            { paso: "3", texto: "Obtén OSCP y entra al mundo profesional", color: "border-orange-500/40 bg-orange-500/10 text-orange-300" },
          ].map(({ paso, texto, color }) => (
            <div key={paso} className={`rounded-xl border p-4 ${color}`}>
              <p className="text-2xl font-black">Paso {paso}</p>
              <p className="mt-1 text-sm opacity-90">{texto}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
