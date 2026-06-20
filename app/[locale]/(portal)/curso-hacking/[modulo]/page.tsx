import { notFound } from "next/navigation";
import Link from "next/link";
import { MODULOS } from "@/lib/curso-hacking";
import {
  ArrowLeft,
  ArrowRight,
  Terminal,
  FlaskConical,
  BookOpen,
  Lightbulb,
  Clock,
  ChevronRight,
  ExternalLink,
  Code2,
  Download,
} from "lucide-react";

export async function generateStaticParams() {
  return MODULOS.map((m) => ({ modulo: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ modulo: string }>;
}) {
  const { modulo: moduloId } = await params;
  const modulo = MODULOS.find((m) => m.id === moduloId);
  if (!modulo) return { title: "Módulo no encontrado" };
  return {
    title: `Módulo ${modulo.numero}: ${modulo.titulo} | Hacking Ético`,
    description: modulo.descripcion,
  };
}

const NIVEL_COLORS: Record<string, string> = {
  Principiante: "bg-green-100 text-green-800 border-green-200",
  Intermedio: "bg-blue-100 text-blue-800 border-blue-200",
  Avanzado: "bg-orange-100 text-orange-800 border-orange-200",
  Experto: "bg-red-100 text-red-800 border-red-200",
};

const TIPO_RECURSO_ICONS: Record<string, string> = {
  video: "🎬",
  blog: "📝",
  libro: "📖",
  herramienta: "🔧",
  plataforma: "💻",
  documento: "📄",
};

export default async function ModuloPage({
  params,
}: {
  params: Promise<{ locale: string; modulo: string }>;
}) {
  const { locale, modulo: moduloId } = await params;
  const modulo = MODULOS.find((m) => m.id === moduloId);

  if (!modulo) notFound();

  const prevModulo = MODULOS[modulo.numero - 2];
  const nextModulo = MODULOS[modulo.numero];

  return (
    <div className="space-y-8">
      {/* Breadcrumb + nav */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${locale}/curso-hacking`}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-main/60 hover:bg-sand/20 hover:text-text-main"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al curso
        </Link>
        <div className="flex gap-2">
          {prevModulo && (
            <Link
              href={`/${locale}/curso-hacking/${prevModulo.id}`}
              className="flex items-center gap-1.5 rounded-lg border border-sand/40 px-3 py-2 text-xs font-medium text-text-main/60 hover:border-polisario/30 hover:text-polisario"
            >
              <ArrowLeft className="h-3 w-3" />
              M{prevModulo.numero}
            </Link>
          )}
          {nextModulo && (
            <Link
              href={`/${locale}/curso-hacking/${nextModulo.id}`}
              className="flex items-center gap-1.5 rounded-lg border border-sand/40 px-3 py-2 text-xs font-medium text-text-main/60 hover:border-polisario/30 hover:text-polisario"
            >
              M{nextModulo.numero}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Hero del módulo */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/60">
                Módulo {modulo.numero} de {MODULOS.length}
              </span>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${NIVEL_COLORS[modulo.nivel]}`}
              >
                {modulo.nivel}
              </span>
              <span className="flex items-center gap-1 text-xs text-white/40">
                <Clock className="h-3 w-3" />
                {modulo.duracion}
              </span>
            </div>
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl">
              <span className="text-4xl">{modulo.icono}</span>
              {modulo.titulo}
            </h1>
            <p className="mt-2 text-lg font-medium text-white/60">{modulo.subtitulo}</p>
            <p className="mt-4 max-w-2xl leading-relaxed text-white/70">{modulo.descripcion}</p>
          </div>
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-3 rounded-xl bg-white/5 p-4">
            {[
              { n: modulo.temas.length, label: "Temas" },
              { n: modulo.herramientas.length, label: "Herramientas" },
              { n: modulo.labs.length, label: "Labs" },
            ].map(({ n, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-white">{n}</p>
                <p className="text-xs text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de contenido */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-8 lg:col-span-2">
          {/* Temas */}
          <section className="rounded-2xl border border-sand/30 bg-white/80 p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-black text-text-main">
              <BookOpen className="h-5 w-5 text-polisario" />
              Temas del Módulo
            </h2>
            <ol className="space-y-2">
              {modulo.temas.map((tema, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-polisario/10 text-[10px] font-bold text-polisario">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-text-main/80">{tema}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Herramientas */}
          <section className="rounded-2xl border border-sand/30 bg-white/80 p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-black text-text-main">
              <Terminal className="h-5 w-5 text-polisario" />
              Arsenal de Herramientas
            </h2>
            <div className="space-y-5">
              {modulo.herramientas.map((h) => (
                <div
                  key={h.nombre}
                  className="rounded-xl border border-sand/20 bg-sand/10 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="font-black text-text-main">{h.nombre}</h3>
                    {h.instalacion && (
                      <span className="flex items-center gap-1 rounded-full bg-polisario/10 px-2 py-0.5 text-[10px] font-semibold text-polisario">
                        <Download className="h-2.5 w-2.5" />
                        Instalación disponible
                      </span>
                    )}
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-text-main/70">{h.descripcion}</p>
                  {h.instalacion && (
                    <div className="mb-2 rounded-lg bg-[#0d1117] p-3">
                      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-400/60">
                        <Download className="h-3 w-3" />
                        Instalación
                      </p>
                      <code className="font-mono text-xs text-green-300">{h.instalacion}</code>
                    </div>
                  )}
                  {h.comando && (
                    <div className="rounded-lg bg-[#0d1117] p-3">
                      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400/60">
                        <Code2 className="h-3 w-3" />
                        Uso / Ejemplo
                      </p>
                      <code className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-blue-200">
                        {h.comando}
                      </code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Labs */}
          <section className="rounded-2xl border border-sand/30 bg-white/80 p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-black text-text-main">
              <FlaskConical className="h-5 w-5 text-polisario" />
              Laboratorios Prácticos
            </h2>
            <div className="space-y-6">
              {modulo.labs.map((lab, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border border-polisario/20 bg-polisario/5"
                >
                  <div className="bg-polisario/10 px-5 py-4">
                    <h3 className="font-black text-text-main">
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded bg-polisario text-xs font-black text-white">
                        {i + 1}
                      </span>
                      {lab.titulo}
                    </h3>
                    <p className="mt-1 text-sm text-text-main/60">{lab.descripcion}</p>
                  </div>
                  <div className="p-5">
                    <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-text-main/50">
                      Pasos a seguir
                    </h4>
                    <ol className="space-y-2">
                      {lab.pasos.map((paso, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#0d1117] text-[10px] font-bold text-green-400">
                            {j + 1}
                          </span>
                          <code className="flex-1 font-mono text-xs leading-relaxed text-text-main/80">
                            {paso}
                          </code>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {lab.herramientas.map((h) => (
                        <span
                          key={h}
                          className="rounded-full bg-[#0d1117] px-2.5 py-1 font-mono text-xs text-green-300"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                    {lab.tips && lab.tips.length > 0 && (
                      <div className="mt-4 rounded-lg border border-sun/30 bg-sun/10 p-3">
                        <p className="mb-2 text-xs font-black uppercase tracking-wider text-sun">
                          💡 Tips del experto
                        </p>
                        <ul className="space-y-1">
                          {lab.tips.map((tip, k) => (
                            <li key={k} className="flex items-start gap-2 text-xs text-text-main/70">
                              <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-sun" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Conceptos clave */}
          <section className="rounded-2xl border border-sand/30 bg-white/80 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-black text-text-main">
              <span className="text-lg">🧠</span>
              Conceptos Clave
            </h2>
            <div className="space-y-4">
              {modulo.conceptosClave.map((c) => (
                <div key={c.termino} className="border-l-2 border-polisario/40 pl-3">
                  <p className="font-mono text-sm font-black text-polisario">{c.termino}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-text-main/60">{c.definicion}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Consejos */}
          <section className="rounded-2xl border border-sun/30 bg-sun/5 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-black text-text-main">
              <Lightbulb className="h-5 w-5 text-sun" />
              Consejos del Experto
            </h2>
            <ul className="space-y-3">
              {modulo.consejos.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-text-main/70">
                  <span className="mt-0.5 text-sun">▸</span>
                  {c}
                </li>
              ))}
            </ul>
          </section>

          {/* Recursos */}
          <section className="rounded-2xl border border-sand/30 bg-white/80 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-black text-text-main">
              <span className="text-lg">📚</span>
              Recursos Recomendados
            </h2>
            <div className="space-y-3">
              {modulo.recursos.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-lg p-2 hover:bg-sand/20"
                >
                  <span className="text-xl">{TIPO_RECURSO_ICONS[r.tipo]}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold leading-snug text-text-main group-hover:text-polisario">
                      {r.titulo}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-full bg-sand/40 px-2 py-0.5 text-[10px] capitalize text-text-main/60">
                        {r.tipo}
                      </span>
                      {r.gratuito ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                          Gratis
                        </span>
                      ) : (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                          De pago
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-text-main/30 group-hover:text-polisario" />
                </a>
              ))}
            </div>
          </section>

          {/* Navegación entre módulos */}
          <div className="flex flex-col gap-3">
            {prevModulo && (
              <Link
                href={`/${locale}/curso-hacking/${prevModulo.id}`}
                className="flex items-center gap-3 rounded-xl border border-sand/30 bg-white/80 p-4 shadow-sm hover:border-polisario/40 hover:shadow-md"
              >
                <ArrowLeft className="h-4 w-4 shrink-0 text-text-main/40" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-text-main/40">Anterior</p>
                  <p className="truncate text-sm font-black text-text-main">{prevModulo.titulo}</p>
                </div>
              </Link>
            )}
            {nextModulo && (
              <Link
                href={`/${locale}/curso-hacking/${nextModulo.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-polisario/30 bg-polisario/5 p-4 shadow-sm hover:border-polisario hover:shadow-md"
              >
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-polisario/60">Siguiente</p>
                  <p className="truncate text-sm font-black text-polisario">{nextModulo.titulo}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-polisario" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
