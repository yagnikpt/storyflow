import {
	ArrowLeft,
	ArrowUpRight,
	Check,
	Clapperboard,
	Download,
	LoaderCircle,
	Sparkles,
} from "lucide-react";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { Link } from "react-router";
import { AnalysisEmptyState } from "@/components/analyze/analysis-empty-state";
import { AnalysisPipeline } from "@/components/analyze/analysis-pipeline";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import type { EpisodePlan, Progress, Result } from "@/lib/types";
import { exportPdf } from "@/lib/pdf-export";

const tonePresets = [
	{ value: "comedic", label: "Comedic", description: "Warm, sharp reversals" },
	{ value: "dark", label: "Dark", description: "Dread and consequence" },
	{ value: "romantic", label: "Romantic", description: "Chemistry and longing" },
	{ value: "thriller", label: "Thriller", description: "Urgency and reveals" },
	{ value: "custom", label: "Custom", description: "Write your own direction" },
] as const;
type TonePreset = (typeof tonePresets)[number]["value"];

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const nodes = [
	"input_classifier",
	"story_expander",
	"story_validator",
	"episode_planner",
	"episode_scripter",
	"emotional_arc_scorer",
	"retention_risk_analyzer",
	"cliffhanger_strength_scorer",
	"final_validator",
	"optimizer",
];
const labels: Record<string, string> = {
	input_classifier: "Reading the premise",
	story_expander: "Growing the story world",
	story_validator: "Checking narrative logic",
	episode_planner: "Mapping the episodes",
	episode_scripter: "Writing the vertical cut",
	emotional_arc_scorer: "Tracking emotional movement",
	retention_risk_analyzer: "Testing watch-through",
	cliffhanger_strength_scorer: "Measuring the next-watch pull",
	final_validator: "Making the final pass",
	optimizer: "Sharpening the blueprint",
};

export default function AnalyzePage() {
	const [idea, setIdea] = useState("");
	const [tonePreset, setTonePreset] = useState<TonePreset>("thriller");
	const [customTone, setCustomTone] = useState("");
	const [episodes, setEpisodes] = useState(6);
	const [progress, setProgress] = useState<Progress[]>([]);
	const [result, setResult] = useState<Result | null>(null);
	const [error, setError] = useState("");
	const [running, setRunning] = useState(false);

	async function analyze(event: SubmitEvent) {
		event.preventDefault();
		if (!idea.trim()) return;
		setRunning(true);
		setProgress([]);
		setResult(null);
		setError("");
		try {
			const response = await fetch(
				`${apiBaseUrl}/episodic-intelligence/analyze/stream`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						story_idea: idea,
						tone: tonePreset === "custom" ? customTone : "",
						tone_preset: tonePreset,
						episode_count_preference: episodes,
						max_revisions: 1,
					}),
				},
			);
			if (!response.ok || !response.body)
				throw new Error("The story room could not start this analysis.");
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				const events = buffer.split("\n\n");
				buffer = events.pop() ?? "";
				events.forEach((raw) => {
					const eventName = raw.match(/^event: (.+)$/m)?.[1];
					const data = raw.match(/^data: (.+)$/m)?.[1];
					if (!eventName || !data) return;
					const payload = JSON.parse(data);
					if (eventName === "progress")
						setProgress((current) => [
							...current.filter((item) => item.node !== payload.node),
							payload,
						]);
					if (eventName === "complete") setResult(payload);
					if (eventName === "error") setError(payload.detail);
				});
			}
		} catch (caught) {
			setError(
				caught instanceof Error
					? caught.message
					: "The analysis did not complete.",
			);
		} finally {
			setRunning(false);
		}
	}
	const status = (node: string) =>
		progress.find((item) => item.node === node)?.status;
	return (
		<main className="min-h-dvh">
			<a className="skip-link" href="#analysis-content">
				Skip to results
			</a>
			<header className="border-b border-border bg-card lg:sticky lg:top-0 z-10">
				<div className="mx-auto flex container items-center justify-between px-5 py-4">
					<Link to="/" className="flex items-center gap-2 font-semibold">
						<span
							aria-hidden="true"
							className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground"
						>
							<Clapperboard size={16} />
						</span>
						StoryFlow
					</Link>
					<div className="hidden text-xs font-semibold tracking-[.14em] text-muted-foreground uppercase sm:block">
						The story room / active session
					</div>
					<Link to="/" className="flex items-center gap-2 text-sm font-medium">
						<ArrowLeft aria-hidden="true" size={15} /> Home
					</Link>
				</div>
			</header>
			<div className="mx-auto grid container lg:grid-cols-[390px_1fr] relative">
				<aside className="border-b border-border bg-card p-5 lg:min-h-[calc(100dvh-65px)] lg:border-r lg:border-b-0 lg:p-7 lg:sticky lg:top-[65px] lg:self-start">
					<div className="mb-7">
						<p className="text-[11px] font-bold tracking-[.16em] text-blue uppercase">
							New analysis
						</p>
						<h1 className="font-display mt-2 text-balance text-4xl leading-none">
							Give it a beginning.
						</h1>
					</div>
					<form onSubmit={analyze} className="space-y-5">
						<label className="block text-sm font-semibold">
							Story seed
							<textarea
								required
								name="story-idea"
								autoComplete="off"
								value={idea}
								onChange={(event) => setIdea(event.target.value)}
								placeholder="A lonely astronaut hears a melody beneath the red Martian dust…"
								className="mt-2 min-h-36 w-full resize-y rounded-lg border border-input bg-background p-3.5 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
							/>
						</label>
						<div>
							<p className="text-sm font-semibold">Tone</p>
							<div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Tone preset">
								{tonePresets.map((preset) => <button key={preset.value} type="button" onClick={() => setTonePreset(preset.value)} aria-pressed={tonePreset === preset.value} className={`rounded-lg border p-2.5 text-left transition ${tonePreset === preset.value ? "border-blue bg-secondary ring-1 ring-blue" : "border-input bg-background hover:bg-secondary"}`}><span className="block text-xs font-bold">{preset.label}</span><span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">{preset.description}</span></button>)}
							</div>
							{tonePreset === "custom" && <label className="mt-3 block text-xs font-semibold">Your tone direction<input name="tone" autoComplete="off" value={customTone} onChange={(event) => setCustomTone(event.target.value)} placeholder="e.g. playful and bittersweet" className="mt-2 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal outline-none focus:border-ring"/></label>}
						</div>
						<label className="block text-sm font-semibold">
							Episode count{" "}
							<span className="tabular float-right text-muted-foreground">
								{episodes} parts
							</span>
							<input
								aria-label="Episode count"
								name="episode-count"
								type="range"
								min="5"
								max="8"
								value={episodes}
								onChange={(event) => setEpisodes(Number(event.target.value))}
								className="mt-3 w-full accent-blue"
							/>
							<div className="flex justify-between text-[11px] text-muted-foreground">
								<span>5</span>
								<span>8</span>
							</div>
						</label>
						<button
							type="submit"
							disabled={running || !idea.trim() || (tonePreset === "custom" && !customTone.trim())}
							className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-blue disabled:cursor-not-allowed disabled:opacity-50"
						>
							{running ? (
								<>
									<LoaderCircle
										aria-hidden="true"
										size={16}
										className="animate-spin"
									/>
									Building the series…
								</>
							) : (
								<>
									Build the blueprint{" "}
									<ArrowUpRight aria-hidden="true" size={16} />
								</>
							)}
						</button>
						{error && (
							<p
								aria-live="polite"
								className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive"
							>
								{error} Check that the API is running, then try again.
							</p>
						)}
					</form>
				</aside>
				<section id="analysis-content" className="min-w-0 p-5 lg:p-8">
					{!running && !result ? (
						<AnalysisEmptyState />
					) : running && !result ? (
						<AnalysisPipeline status={status} />
					) : result ? (
						<Results
							result={result}
							onReset={() => {
								setResult(null);
								setIdea("");
								setProgress([]);
							}}
						/>
					) : null}
				</section>
			</div>
		</main>
	);
}

export function EmptyState() {
	return (
		<div className="paper-grid grain flex min-h-[620px] flex-col justify-between overflow-hidden rounded-xl border border-border p-7 sm:p-10">
			<div className="flex items-center justify-between">
				<span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold tracking-[.12em] text-blue uppercase">
					Ready when you are
				</span>
				<Sparkles aria-hidden="true" className="text-coral" />
			</div>
			<div className="max-w-xl">
				<p className="font-display text-5xl leading-[.95] sm:text-6xl">
					From a spark
					<br />
					to the whole season.
				</p>
				<p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
					Describe the story you want to tell. You’ll get an episode map, script
					package, emotional rhythm, and practical notes for the cut.
				</p>
			</div>
			<div className="flex gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
				<span>Story</span>
				<span>→</span>
				<span>Episodes</span>
				<span>→</span>
				<span>Retention plan</span>
			</div>
		</div>
	);
}

export function Pipeline({
	status,
}: {
	status: (node: string) => string | undefined;
}) {
	const active = nodes.find((node) => status(node) === "started");
	return (
		<div className="max-w-2xl py-8">
			<p className="text-[11px] font-bold tracking-[.16em] text-blue uppercase">
				Live pipeline
			</p>
			<h2 className="font-display mt-2 text-balance text-5xl">
				Your story is taking shape.
			</h2>
			<p
				aria-live="polite"
				className="mt-4 text-sm leading-6 text-muted-foreground"
			>
				{active
					? `${labels[active]} is in progress…`
					: "Preparing the analysis…"}
			</p>
			<div className="mt-10 space-y-1">
				{nodes.map((node, index) => {
					const state = status(node);
					return (
						<div
							key={node}
							className={`flex items-center gap-4 border-b border-border px-3 py-4 ${state ? "bg-card" : "opacity-35"}`}
						>
							<span className="tabular w-7 text-xs font-bold text-muted-foreground">
								{String(index + 1).padStart(2, "0")}
							</span>
							<span
								aria-hidden="true"
								className={`grid size-5 place-items-center rounded-full border ${state === "completed" ? "border-blue bg-blue text-white" : state === "started" ? "border-coral text-coral" : "border-border"}`}
							>
								{state === "completed" ? (
									<Check size={12} />
								) : state === "started" ? (
									<LoaderCircle size={12} className="animate-spin" />
								) : null}
							</span>
							<span className="min-w-0 text-sm font-medium">
								{labels[node]}
							</span>
							{node === active && (
								<span className="ml-auto shrink-0 text-[10px] font-bold tracking-[.12em] text-coral uppercase">
									In progress
								</span>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function Score({ value, outOf = 10 }: { value: number; outOf?: number }) {
	return (
		<span className="tabular text-sm font-semibold text-ink">
			{value}
			<span className="font-normal text-muted-foreground">/{outOf}</span>
		</span>
	);
}

function Details({
	summary,
	children,
}: {
	summary: string;
	children: React.ReactNode;
}) {
	return (
		<AccordionItem value={summary}>
			<AccordionTrigger className="rounded-none items-center font-semibold hover:no-underline **:data-[slot=accordion-trigger-icon]:text-coral">
				{summary}
			</AccordionTrigger>
			<AccordionContent className="pb-6">{children}</AccordionContent>
		</AccordionItem>
	);
}

function RiskBadge({ level }: { level: string }) {
	return (
		<span
			className={`rounded-full px-2 py-1 text-[10px] font-bold tracking-widest uppercase ${level === "high" || level === "critical" ? "bg-destructive/10 text-destructive" : level === "medium" ? "bg-coral/15 text-coral" : "bg-secondary text-blue"}`}
		>
			{level}
		</span>
	);
}

function Results({ result, onReset }: { result: Result; onReset: () => void }) {
	const handleExport = (kind: "scripts" | "all") => {
		exportPdf(result, kind);
	};
	return (
		<div className="space-y-8 md:space-y-14">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="min-w-0">
					<p className="text-[11px] font-bold tracking-[.16em] text-blue uppercase">
						Series blueprint / complete
					</p>
					<p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-muted-foreground sm:text-base">
						{result.story_idea}
					</p>
					<p className="mt-3 text-xs text-muted-foreground">
						{result.episode_planner.target_audience} ·{" "}
						{result.revisions_completed} revision
						{result.revisions_completed === 1 ? "" : "s"} ·{" "}
						{new Intl.DateTimeFormat(undefined, {
							dateStyle: "medium",
							timeStyle: "short",
						}).format(new Date(result.created_at))}
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<button type="button" onClick={() => handleExport("scripts")} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-semibold transition hover:bg-secondary"><Download size={15} aria-hidden="true"/>Scripts PDF</button>
					<button type="button" onClick={() => handleExport("all")} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-semibold transition hover:bg-secondary"><Download size={15} aria-hidden="true"/>All data PDF</button>
					<button type="button" onClick={onReset} className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary">New analysis</button>
				</div>
			</div>
			<div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border grid-cols-2 sm:grid-cols-4">
				{[
					[
						"Quality",
						`${result.optimization_report.overall_quality_score}/100`,
					],
					["Episodes", result.episode_planner.total_episodes],
					[
						"Retention peak",
						`Ep. ${result.retention_analysis.strongest_episode}`,
					],
					[
						"Cliffhanger avg.",
						`${result.cliffhanger_analysis.average_score}/10`,
					],
				].map(([label, value]) => (
					<div
						className="bg-card p-5 sm:p-6 flex flex-col justify-between"
						key={String(label)}
					>
						<p className="text-xs font-bold tracking-[.12em] text-muted-foreground uppercase">
							{label}
						</p>
						<p className="font-display tabular text-4xl mt-3">{value}</p>
					</div>
				))}
			</div>
			<section className="grid gap-8 xl:grid-cols-[1.45fr_.85fr]">
				<div className="rounded-xl border border-border bg-card">
					<div className="border-b border-border p-6 sm:p-7">
						<p className="text-xs font-bold tracking-[.14em] text-coral uppercase">
							The episode ribbon
						</p>
						<h3 className="font-display mt-2 text-balance text-3xl">
							{result.episode_planner.overall_narrative_arc}
						</h3>
					</div>
					{result.episode_planner.episodes.map((episode) => (
						<EpisodeCard key={episode.episode_number} plan={episode} />
					))}
				</div>
				<aside className="space-y-5">
					<div className="rounded-xl bg-primary p-5 text-primary-foreground">
						<p className="text-[10px] font-bold tracking-[.14em] text-coral uppercase">
							Optimization priority
						</p>
						<ol className="mt-4 space-y-4">
							{result.optimization_report.top_3_priorities.map(
								(item, index) => (
									<li className="flex gap-3 text-sm leading-5" key={item}>
										<span className="tabular text-coral">0{index + 1}</span>
										{item}
									</li>
								),
							)}
						</ol>
						<div className="mt-6 border-t border-white/20 pt-4 text-xs text-white/60">
							Potential quality after changes{" "}
							<b className="tabular ml-1 text-white">
								{
									result.optimization_report
										.predicted_quality_after_optimization
								}
								/100
							</b>
						</div>
					</div>
					<div className="rounded-xl border border-border bg-card p-5">
						<p className="text-[10px] font-bold tracking-[.14em] text-blue uppercase">
							Emotional throughline
						</p>
						<p className="mt-3 text-sm leading-6 text-muted-foreground">
							{result.emotional_arc.overall_progression}
						</p>
						<p className="mt-4 border-l-2 border-coral pl-3 text-xs leading-5 text-ink/75">
							{result.emotional_arc.tension_curve_description}
						</p>
						<div className="mt-5 flex items-end gap-1">
							{result.retention_analysis.episodes.map((episode) => (
								<div
									key={episode.episode_number}
									className="flex flex-1 flex-col items-center gap-2"
								>
									<div
										className="w-full rounded-t-sm bg-mist"
										style={{
											height: `${Math.max(16, episode.overall_retention_score * 0.6)}px`,
										}}
									/>
									<span className="tabular text-[10px] text-muted-foreground">
										{episode.episode_number}
									</span>
								</div>
							))}
						</div>
						<p className="mt-3 text-center text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
							Predicted episode retention
						</p>
					</div>
				</aside>
			</section>
			<section className="grid gap-8 xl:grid-cols-2">
				<InsightPanel
					title="Retention diagnosis"
					eyebrow="Where viewers may leave"
				>
					<div className="mt-4">
						<Accordion multiple>
							{result.retention_analysis.episodes.map((episode) => (
								<Details
									key={episode.episode_number}
									summary={`Episode ${episode.episode_number} · ${episode.overall_retention_score}% predicted retention`}
								>
									<div className="mb-5 flex gap-6 text-xs text-muted-foreground">
										<span>
											Hook <Score value={episode.hook_strength} />
										</span>
										<span>
											Pacing <Score value={episode.pacing_score} />
										</span>
									</div>
									<div className="space-y-4">
										{episode.risk_zones.map((risk) => (
											<div
												className="rounded-lg bg-muted/70 p-4"
												key={risk.timestamp_range}
											>
												<div className="flex items-center justify-between gap-3">
													<span className="tabular text-xs font-semibold">
														{risk.timestamp_range}
													</span>
													<RiskBadge level={risk.risk_level} />
												</div>
												<p className="mt-3 text-xs leading-6 text-muted-foreground">
													{risk.reason}
												</p>
												<p className="mt-3 border-l-2 border-blue pl-3 text-xs leading-6">
													<b>Cut note:</b> {risk.suggested_fix}
												</p>
											</div>
										))}
									</div>
								</Details>
							))}
						</Accordion>
					</div>
					<p className="border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
						{result.retention_analysis.overall_series_retention_prediction}
					</p>
				</InsightPanel>
				<InsightPanel
					title="Cliffhanger strength"
					eyebrow="The reason to watch next"
				>
					<div className="mt-4">
						<Accordion multiple>
							{result.cliffhanger_analysis.scores.map((score) => (
								<Details
									key={score.episode_number}
									summary={`Episode ${score.episode_number} · ${score.cliffhanger_type} · ${score.score}/10`}
								>
									<div className="grid grid-cols-3 gap-3 text-center text-xs">
										<Metric label="Curiosity" value={score.curiosity_gap} />
										<Metric label="Stakes" value={score.stakes_level} />
										<Metric label="Charge" value={score.emotional_charge} />
									</div>
									<p className="mt-5 text-xs leading-6 text-muted-foreground">
										{score.reasoning}
									</p>
								</Details>
							))}
						</Accordion>
					</div>
				</InsightPanel>
			</section>
			<section className="grid gap-8 xl:grid-cols-[.8fr_1.2fr]">
				<InsightPanel
					title="Emotional beat sheet"
					eyebrow={`Coherence ${result.emotional_arc.emotional_coherence_score}/10`}
				>
					<div className="mt-4">
						<Accordion multiple>
							{result.emotional_arc.episodes.map((episode) => (
								<Details
									key={episode.episode_number}
									summary={`Episode ${episode.episode_number} · ${episode.dominant_emotion}`}
								>
									<div className="mb-4 text-xs text-muted-foreground">
										Range <Score value={episode.emotional_range} />
									</div>
									<div className="space-y-3">
										{episode.emotion_beats.map((beat) => (
											<div
												className="grid grid-cols-[60px_1fr_auto] items-baseline gap-4 border-b border-border pb-3 text-xs last:border-0 last:pb-0"
												key={beat.timestamp_range}
											>
												<span className="tabular text-muted-foreground">
													{beat.timestamp_range}
												</span>
												<span className="capitalize text-sm">
													{beat.emotion}
												</span>
												<Score value={beat.intensity} />
											</div>
										))}
									</div>
								</Details>
							))}
						</Accordion>
					</div>
				</InsightPanel>
				<InsightPanel
					title="Every optimization"
					eyebrow="Actionable edit notes"
				>
					{result.optimization_report.suggestions.map((suggestion, index) => (
						<article
							className="border-t border-border py-5 first:border-t-0"
							key={`${suggestion.episode_number}-${suggestion.category}`}
						>
							<div className="flex flex-wrap items-center gap-2">
								<span className="tabular text-xs font-bold text-coral">
									0{index + 1}
								</span>
								<span className="text-xs font-semibold">
									Episode {suggestion.episode_number}
								</span>
								<span className="rounded-full bg-secondary px-2 py-1 text-xs font-bold tracking-widest text-blue uppercase">
									{suggestion.category}
								</span>
								<RiskBadge level={suggestion.priority} />
							</div>
							<p className="mt-4 text-xs leading-6 text-muted-foreground">
								<b className="text-ink">Issue:</b> {suggestion.current_issue}
							</p>
							<p className="mt-3 border-l-2 border-coral pl-3 text-xs leading-6">
								<b>Make this change:</b> {suggestion.suggested_improvement}
							</p>
							<p className="mt-3 text-xs leading-6 text-muted-foreground">
								<b className="text-ink">Expected impact:</b>{" "}
								{suggestion.expected_impact}
							</p>
						</article>
					))}
				</InsightPanel>
			</section>
			<section className="rounded-xl border border-border bg-card p-6 sm:p-7">
				<p className="text-xs font-bold tracking-[.14em] text-blue uppercase">
					Script package
				</p>
				<h3 className="font-display mt-2 text-3xl">
					{result.episode_scripts.total_word_count.toLocaleString()} words,
					built to flow as one.
				</h3>
				<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
					{result.episode_scripts.series_continuity_summary}
				</p>
				<div className="mt-5">
					<Accordion multiple>
						{result.episode_scripts.scripts.map((script) => (
							<Details
								key={script.episode_number}
								summary={`Episode ${script.episode_number} · ${script.title} · ${script.word_count} words`}
							>
								<div className="space-y-7">
									<p className="whitespace-pre-wrap text-sm leading-loose text-ink/85">
										{script.script}
									</p>
									<div className="grid gap-6 border-t border-border pt-6 md:grid-cols-2">
										<div>
											<p className="text-xs font-bold tracking-[.12em] text-coral uppercase">
												Vertical direction
											</p>
											<ul className="mt-3 space-y-3 text-xs leading-6 text-muted-foreground">
												{script.scene_directions.map((direction) => (
													<li className="flex gap-2" key={direction}>
														<span className="text-coral">•</span>
														{direction}
													</li>
												))}
											</ul>
										</div>
										<div>
											<p className="text-xs font-bold tracking-[.12em] text-coral uppercase">
												Continuity note
											</p>
											<p className="mt-3 text-xs leading-6 text-muted-foreground">
												{script.continuity_notes}
											</p>
										</div>
									</div>
								</div>
							</Details>
						))}
					</Accordion>
				</div>
			</section>
			<p className="text-center text-xs text-muted-foreground">
				Run ID: <span className="tabular">{result.run_id}</span>
			</p>
		</div>
	);
}

function EpisodeCard({ plan }: { plan: EpisodePlan }) {
	return (
		<article className="grid md:grid-cols-[48px_1fr] gap-4 border-b border-border p-6 last:border-0">
			<span className="font-display text-2xl italic text-coral">
				{String(plan.episode_number).padStart(2, "0")}
			</span>
			<div className="min-w-0">
				<h4 className="text-sm font-bold leading-snug">{plan.title}</h4>
				<p className="mt-2 text-sm leading-7 text-muted-foreground">
					{plan.outline}
				</p>
				{plan.retention_hooks.length > 0 && (
					<div className="mt-4 flex flex-wrap gap-2">
						{plan.retention_hooks.map((hook) => (
							<span
								className="rounded-md bg-secondary px-2.5 py-1 text-xs text-ink/75"
								key={hook}
							>
								{hook}
							</span>
						))}
					</div>
				)}
			</div>
		</article>
	);
}

function InsightPanel({
	eyebrow,
	title,
	children,
}: {
	eyebrow: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="rounded-xl border border-border bg-card p-6 sm:p-7">
			<p className="text-xs font-bold tracking-[.14em] text-coral uppercase">
				{eyebrow}
			</p>
			<h3 className="font-display mt-2 text-3xl">{title}</h3>
			<div className="mt-5">{children}</div>
		</section>
	);
}

function Metric({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-lg bg-muted p-3">
			<p className="text-xs text-muted-foreground">{label}</p>
			<Score value={value} />
		</div>
	);
}
