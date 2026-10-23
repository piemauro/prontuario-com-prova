"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Fingerprint,
  History,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import { exampleEvents, exampleSources } from "@/lib/example";
import type { Source } from "@/lib/schema";
import {
  correctClaim,
  displayDate,
  groupEvents,
  verifyEvents,
  type Claim,
  type TimelineEvent,
} from "@/lib/timeline";
const sourceIcons = ["01", "02", "03"];
type Filter = "all" | "conflict" | "undated" | "corrected";
export default function Home() {
  const [sources, setSources] = useState<Source[]>(
    exampleSources.map((s) => ({ ...s })),
  );
  const [snapshot, setSnapshot] = useState<Source[]>(exampleSources);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [mode, setMode] = useState<"empty" | "demo" | "ai">("empty");
  const [model, setModel] = useState("");
  const [editingSources, setEditingSources] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<Claim | null>(null);
  const [selected, setSelected] = useState("");
  const [edit, setEdit] = useState<Claim | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [reason, setReason] = useState("");
  const [editError, setEditError] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [history, setHistory] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (edit) dialogRef.current?.showModal();
  }, [edit]);
  const sourceRefs = useRef<Record<string, HTMLElement | null>>({});
  const groups = useMemo(() => groupEvents(claims), [claims]);
  const conflicts = groups.filter((g) => g.conflict).length;
  const undated = groups.filter(
    (g) => !g.date || g.claims.some((c) => !c.date),
  ).length;
  const corrections = claims.reduce((sum, c) => sum + c.changes.length, 0);
  const datedGroups = groups.filter((g) => g.date);
  const undatedGroups = groups.filter((g) => !g.date);
  function loadDemo() {
    const src = exampleSources.map((s) => ({ ...s }));
    setSources(src);
    setSnapshot(src);
    setClaims(verifyEvents(exampleEvents, src));
    setMode("demo");
    setModel("");
    setEditingSources(false);
    setError("");
    setFilter("all");
    setActive(null);
    setSelected("");
  }
  async function extract() {
    if (sources.some((s) => !s.text.trim())) {
      setError("Preencha as três fontes antes de organizar.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources, accessCode }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Falha na extração.");
      setClaims(result.claims);
      setSnapshot(sources.map((s) => ({ ...s })));
      setMode("ai");
      setModel(result.model);
      setEditingSources(false);
      setFilter("all");
      setActive(null);
      setSelected("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha de conexão.");
    } finally {
      setBusy(false);
    }
  }
  function focusClaim(claim: Claim, key: string) {
    setSelected(key);
    setActive(claim);
    requestAnimationFrame(() => {
      const el =
        document.getElementById(`evidence-${claim.id}`) ||
        sourceRefs.current[claim.sourceId];
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
  function startEdit(claim: Claim) {
    setEdit(claim);
    setEditDate(claim.date || "");
    setEditDescription(claim.description);
    setReason("");
    setEditError("");
  }
  function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    try {
      const updated = correctClaim(
        edit,
        editDate || null,
        editDescription,
        reason,
      );
      setClaims((prev) => prev.map((c) => (c.id === edit.id ? updated : c)));
      if (active?.id === edit.id) setActive(updated);
      setEdit(null);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Falha ao corrigir.");
    }
  }
  function exportHistory() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: 1,
            exportedAt: new Date().toISOString(),
            mode,
            model,
            sources: snapshot,
            claims,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prontuario-com-prova.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function accepts(g: TimelineEvent) {
    return (
      filter === "all" ||
      (filter === "conflict" && g.conflict) ||
      (filter === "undated" && g.claims.some((c) => !c.date)) ||
      (filter === "corrected" && g.corrected)
    );
  }
  function renderCard(group: TimelineEvent) {
    if (!accepts(group)) return null;
    const first = group.claims[0];
    const mixed = group.date && group.claims.some((c) => !c.date);
    return (
      <article
        key={group.key}
        className={`event-card ${group.conflict ? "conflict-card" : ""} ${selected === group.key ? "selected" : ""}`}
      >
        <span className={`timeline-dot ${group.conflict ? "danger" : ""}`} />
        <div className="event-top">
          <span className="event-date">
            {displayDate(group.date)}
            {group.conflict ? " · datas divergentes" : ""}
          </span>
          <span
            className={`badge ${group.conflict ? "red" : group.corrected ? "blue" : group.date ? "green" : "amber"}`}
          >
            {group.conflict ? (
              <>
                <TriangleAlert size={11} />
                Conflitante
              </>
            ) : group.corrected ? (
              <>
                <Pencil size={11} />
                Corrigido por humano
              </>
            ) : group.date ? (
              <>
                <Check size={11} />
                Datado
              </>
            ) : (
              <>
                <Clock3 size={11} />
                Sem data
              </>
            )}
          </span>
        </div>
        <button
          className="event-title"
          onClick={() => focusClaim(first, group.key)}
        >
          {group.description}
          <ArrowRight size={17} />
        </button>
        {group.corrected && group.conflict && (
          <span className="human-note">
            Corrigido por humano · divergência ainda presente
          </span>
        )}
        {group.corrected && !group.conflict && (
          <p className="human-note">
            A versão documental original permanece nas fontes.
          </p>
        )}
        {mixed && (
          <p className="human-note">
            Uma fonte não informa a data. Confira as versões abaixo.
          </p>
        )}
        {group.conflict && (
          <p className="conflict-copy">
            As fontes discordam. Nenhuma versão foi escolhida como verdadeira.
          </p>
        )}
        <div className="claim-list">
          {group.claims.map((claim) => (
            <div key={claim.id} className="claim-row">
              <button
                className="source-link"
                onClick={() => focusClaim(claim, group.key)}
              >
                <FileText size={13} />
                {snapshot.find((s) => s.id === claim.sourceId)?.title}
                {claim.description !== group.description && (
                  <small className="claim-description">
                    {claim.description}
                  </small>
                )}
                <span>
                  {group.conflict || mixed ? displayDate(claim.date) : ""}
                </span>
                <ChevronRight size={13} />
              </button>
              <button
                className="icon-button"
                title={`Corrigir evento de ${snapshot.find((s) => s.id === claim.sourceId)?.title}`}
                aria-label={`Corrigir ${claim.description} em ${snapshot.find((s) => s.id === claim.sourceId)?.title}`}
                onClick={() => startEdit(claim)}
              >
                <Pencil size={13} />
              </button>
            </div>
          ))}
        </div>
        <div className="event-bottom">
          <span
            className={
              group.claims.every((c) => c.verified)
                ? "evidence-ok"
                : "evidence-bad"
            }
          >
            {group.claims.every((c) => c.verified) ? (
              <CheckCheck size={13} />
            ) : (
              <TriangleAlert size={13} />
            )}{" "}
            {group.claims.every((c) => c.verified)
              ? "Trecho localizado em todas as fontes"
              : "Origem não confirmada em uma ou mais fontes"}
          </span>
          {group.claims.some((c) => c.originalDate && !c.dateVerified) && (
            <span className="evidence-bad">
              Data sugerida sem prova literal
            </span>
          )}
        </div>
      </article>
    );
  }
  return (
    <>
      <header className="topbar">
        <a className="brand" href="/" aria-label="Prontuário com Prova, início">
          <span className="brand-icon">
            <Fingerprint size={25} />
          </span>
          <span>
            prontuário<span className="brand-light">comprova</span>
            <small>ORGANIZAÇÃO COM ORIGEM</small>
          </span>
        </a>
        <div className="top-right">
          <span className="edition">OPENAI HACKATHON · SÃO PAULO</span>
          <span className="prototype">Protótipo</span>
        </div>
      </header>
      <main>
        <section className="hero">
          <div>
            <div className="eyebrow">
              <span /> DESAFIO 03 · HISTÓRICO DE SAÚDE
            </div>
            <h1>
              Uma história.
              <br />
              <em>Cada fato, uma origem.</em>
            </h1>
            <p>
              De textos dispersos a uma linha do tempo que você pode
              <br className="desktop-break" /> conferir, questionar e corrigir.
            </p>
          </div>
          <div className="hero-aside">
            <div className="proof-mark">
              <Fingerprint size={52} strokeWidth={1} />
              <span>
                RASTREÁVEL
                <br />
                POR CONSTRUÇÃO
              </span>
            </div>
            <p>
              A IA organiza.
              <br />A fonte comprova.
              <br />
              <strong>Você mantém o controle.</strong>
            </p>
          </div>
        </section>
        <div className="scope-notice">
          <ShieldCheck size={19} />
          <p>
            <strong>Organização documental, sem interpretação clínica.</strong>{" "}
            Não realiza diagnóstico, interpretação de exames ou recomendações de
            saúde. Use apenas textos fictícios neste protótipo.
          </p>
        </div>
        <section className="workspace-toolbar">
          <div className="case">
            <span className="avatar">HC</span>
            <div>
              <strong>Helena Costa</strong>
              <span>Pessoa fictícia · caso demonstrativo</span>
            </div>
          </div>
          <div className="toolbar-actions">
            {claims.length > 0 && (
              <>
                <button
                  className="button subtle"
                  onClick={() => setHistory(!history)}
                >
                  <History size={15} />
                  Alterações {corrections > 0 && <b>{corrections}</b>}
                </button>
                <button className="button subtle" onClick={exportHistory}>
                  <Download size={15} />
                  Exportar
                </button>
              </>
            )}
            <button
              className="button secondary"
              onClick={loadDemo}
              disabled={busy}
            >
              <RotateCcw size={14} />
              {claims.length ? "Restaurar exemplo" : "Explorar demonstração"}
            </button>
          </div>
        </section>
        {history && (
          <section className="history-panel">
            <div className="panel-heading">
              <h2>Histórico de alterações</h2>
              <button
                className="icon-button"
                aria-label="Fechar histórico"
                onClick={() => setHistory(false)}
              >
                <X size={16} />
              </button>
            </div>
            {corrections === 0 ? (
              <p>Nenhuma correção humana registrada nesta sessão.</p>
            ) : (
              claims.flatMap((c) =>
                c.changes.map((ch, i) => (
                  <div className="history-item" key={`${c.id}-${i}`}>
                    <strong>
                      Corrigido por humano ·{" "}
                      {snapshot.find((s) => s.id === c.sourceId)?.title}
                    </strong>
                    <span>{new Date(ch.at).toLocaleString("pt-BR")}</span>
                    <p>
                      <del>
                        {displayDate(ch.before.date)} · {ch.before.description}
                      </del>
                      <br />
                      {displayDate(ch.after.date)} · {ch.after.description}
                    </p>
                    <p>Motivo: {ch.reason}</p>
                  </div>
                )),
              )
            )}
          </section>
        )}
        <section className="stats">
          <div>
            <span className="stat-label">FONTES ORIGINAIS</span>
            <strong>
              03<span>textos</span>
            </strong>
          </div>
          <div>
            <span className="stat-label">ACONTECIMENTOS</span>
            <strong>
              {String(groups.length).padStart(2, "0")}
              <span>organizados</span>
            </strong>
          </div>
          <div className={conflicts ? "stat-danger" : ""}>
            <span className="stat-label">DIVERGÊNCIAS</span>
            <strong>
              {String(conflicts).padStart(2, "0")}
              <span>para conferir</span>
            </strong>
          </div>
          <div className={undated ? "stat-amber" : ""}>
            <span className="stat-label">DATA EM ABERTO</span>
            <strong>
              {String(undated).padStart(2, "0")}
              <span>sem data em alguma fonte</span>
            </strong>
          </div>
        </section>
        {mode !== "empty" && (
          <div className="mode-line">
            <span className={`mode-dot ${mode === "ai" ? "live" : ""}`} />
            {mode === "demo"
              ? "Demonstração com extração pré-definida · nenhuma chamada à IA"
              : `Extração via OpenAI · ${model} · Structured Outputs`}
            <span>Conferência literal feita em código</span>
          </div>
        )}
        <div className="workspace">
          <section className="timeline-panel">
            <div className="section-heading">
              <div>
                <span className="step">01 / HISTÓRICO</span>
                <h2>
                  Linha do tempo
                  <span className="tiny-count">{groups.length}</span>
                </h2>
              </div>
              <Clock3 size={20} strokeWidth={1.5} />
            </div>
            <div
              className="filter-bar"
              role="group"
              aria-label="Filtrar eventos"
            >
              {(
                [
                  ["all", "Todos"],
                  ["conflict", "Conflitantes"],
                  ["undated", "Sem data"],
                  ["corrected", "Corrigidos"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  className={filter === value ? "active" : ""}
                  onClick={() => setFilter(value)}
                >
                  {label}
                  {value === "conflict" && conflicts > 0 && (
                    <span>{conflicts}</span>
                  )}
                </button>
              ))}
            </div>
            {claims.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FileText size={30} strokeWidth={1.3} />
                  <Plus size={16} />
                </div>
                <h3>
                  O começo de uma história
                  <br />
                  mais organizada.
                </h3>
                <p>
                  Seus três textos já estão ao lado.
                  <br />
                  Organize com IA ou explore o exemplo pronto.
                </p>
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={extract}
                >
                  {busy ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  Organizar com IA
                  <ArrowRight size={15} />
                </button>
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={loadDemo}
                >
                  Explorar demonstração sem API <ArrowRight size={14} />
                </button>
                <div className="mini-process">
                  <span>3 textos</span>
                  <ChevronRight size={12} />
                  <span>Extração</span>
                  <ChevronRight size={12} />
                  <span>Prova literal</span>
                </div>
              </div>
            ) : (
              <>
                <div className="timeline-intro">
                  <span className="mini-line" />
                  Clique no evento ou na fonte para ver o trecho de origem.
                </div>
                <div className="timeline-list">
                  {datedGroups.map(renderCard)}
                </div>
                {undatedGroups.some(accepts) && (
                  <>
                    <div className="undated-heading">
                      <Clock3 size={15} />
                      <strong>Sem data</strong>
                      <span>O que o texto não diz, fica em aberto.</span>
                    </div>
                    <div className="timeline-list undated-list">
                      {undatedGroups.map(renderCard)}
                    </div>
                  </>
                )}
                {!groups.some(accepts) && (
                  <div className="filter-empty">
                    <CheckCheck size={24} />
                    <p>Nenhum evento neste filtro.</p>
                  </div>
                )}
              </>
            )}
          </section>
          <aside className="sources-panel">
            <div className="section-heading">
              <div>
                <span className="step">02 / EVIDÊNCIAS</span>
                <h2>O texto tem a palavra.</h2>
              </div>
              {claims.length > 0 && (
                <button
                  className="button subtle"
                  onClick={() => setEditingSources(!editingSources)}
                >
                  <Pencil size={14} />
                  {editingSources ? "Fechar edição" : "Editar textos"}
                </button>
              )}
            </div>
            <p className="sources-intro">
              {editingSources
                ? "Cole três textos curtos. O caso fictício já está preenchido."
                : "Fontes preservadas. Trechos destacados são cópias literais."}
            </p>
            {active && !editingSources && (
              <div
                className={`selected-evidence ${active.verified ? "" : "unverified"}`}
                role="status"
              >
                <Fingerprint size={17} />
                <div>
                  <strong>
                    {active.verified
                      ? "Trecho localizado na fonte"
                      : "Origem não confirmada"}
                  </strong>
                  <p>
                    {active.verified
                      ? `Correspondência literal · caracteres ${active.start + 1} a ${active.end}. Isso confirma a presença do trecho, não a veracidade do relato.`
                      : "O trecho retornado não existe literalmente neste texto. Não foi possível destacá-lo."}
                  </p>
                </div>
                <button
                  className="icon-button"
                  aria-label="Limpar destaque"
                  onClick={() => setActive(null)}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {editingSources && claims.length > 0 && (
              <div className="editing-notice">
                A linha do tempo usa a última extração. Novos textos só entram
                ao organizar novamente; isso inicia um histórico de correções
                vazio.
              </div>
            )}
            <div className="source-stack">
              {(editingSources ? sources : snapshot).map((source, i) => (
                <section
                  className={`source-card ${active?.sourceId === source.id && !editingSources ? "source-selected" : ""}`}
                  key={source.id}
                  ref={(el) => {
                    sourceRefs.current[source.id] = el;
                  }}
                >
                  <div className="source-card-heading">
                    <div>
                      <span className="source-number">{sourceIcons[i]}</span>
                      <h3>{source.title}</h3>
                    </div>
                    <span className="source-kind">TEXTO ORIGINAL</span>
                  </div>
                  {editingSources ? (
                    <>
                      <label className="sr-only" htmlFor={source.id}>
                        {source.title}
                      </label>
                      <textarea
                        id={source.id}
                        value={source.text}
                        maxLength={6000}
                        onChange={(e) =>
                          setSources((prev) =>
                            prev.map((s) =>
                              s.id === source.id
                                ? { ...s, text: e.target.value }
                                : s,
                            ),
                          )
                        }
                      />
                      <div className="source-length">
                        {source.text.length.toLocaleString("pt-BR")} / 6.000
                        caracteres
                      </div>
                    </>
                  ) : (
                    <div className="source-text">
                      {active?.sourceId === source.id && active.verified ? (
                        <>
                          {source.text.slice(0, active.start)}
                          <mark id={`evidence-${active.id}`}>
                            {source.text.slice(active.start, active.end)}
                          </mark>
                          {source.text.slice(active.end)}
                        </>
                      ) : (
                        source.text
                      )}
                    </div>
                  )}
                </section>
              ))}
            </div>
            {editingSources && (
              <div className="extract-controls">
                <label className="access-label">
                  Código de acesso <span>(se exigido pelo organizador)</span>
                  <input
                    type="password"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    autoComplete="off"
                    placeholder="Opcional"
                  />
                </label>
                <button
                  className="button primary full"
                  onClick={extract}
                  disabled={busy}
                >
                  {busy ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}{" "}
                  {busy
                    ? "Localizando acontecimentos e origens…"
                    : "Organizar com IA"}
                  {!busy && <ArrowRight size={16} />}
                </button>
                <p className="privacy-note">
                  Ao organizar com IA, os textos são enviados à OpenAI. O app
                  não grava documentos em banco de dados. A sessão fica na
                  memória desta aba e é apagada ao recarregar.
                </p>
              </div>
            )}
          </aside>
        </div>
        {error && (
          <div className="error-toast" role="alert">
            <TriangleAlert size={19} />
            <p>{error}</p>
            <button
              className="icon-button"
              aria-label="Fechar mensagem de erro"
              onClick={() => setError("")}
            >
              <X size={17} />
            </button>
          </div>
        )}
        <footer>
          <span>
            <Fingerprint size={16} /> Prontuário com Prova
          </span>
          <p>Mais clareza no histórico. Mais transparência em cada registro.</p>
          <span>
            FEITO PARA CONFERIR <ArrowDown size={12} />
          </span>
        </footer>
      </main>
      {edit && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEdit(null);
          }}
        >
          <dialog
            ref={dialogRef}
            onCancel={() => setEdit(null)}
            aria-labelledby="edit-heading"
            onKeyDown={(e) => {
              if (e.key === "Escape") setEdit(null);
            }}
          >
            <form onSubmit={saveEdit}>
              <div className="modal-heading">
                <span className="eyebrow">REVISÃO HUMANA</span>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Fechar correção"
                  onClick={() => setEdit(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <h2 id="edit-heading">Corrigir com transparência.</h2>
              <p className="modal-subtitle">
                Esta alteração afeta a afirmação de{" "}
                <strong>
                  {snapshot.find((s) => s.id === edit.sourceId)?.title}
                </strong>
                . O documento original será preservado.
              </p>
              <blockquote>{edit.quote}</blockquote>
              <label>
                Data do acontecimento
                <input
                  autoFocus
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  min="0001-01-01"
                  max="9999-12-31"
                />
              </label>
              <small className="field-help">
                Deixe em branco se a data continuar desconhecida.
              </small>
              <label>
                Descrição neutra
                <input
                  required
                  maxLength={300}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </label>
              <label>
                Motivo da correção
                <textarea
                  required
                  maxLength={500}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex.: conferi a data com a família para este caso fictício."
                />
              </label>
              {editError && (
                <p role="alert" className="form-error">
                  {editError}
                </p>
              )}
              <p className="edit-notice">
                <History size={14} />
                Antes, depois, motivo e horário entram no histórico.
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setEdit(null)}
                >
                  Cancelar
                </button>
                <button className="button primary" type="submit">
                  <Check size={15} />
                  Salvar correção
                </button>
              </div>
            </form>
          </dialog>
        </div>
      )}
    </>
  );
}
