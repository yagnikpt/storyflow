import {
	ArrowLeft,
	ArrowUpRight,
	Check,
	Clapperboard,
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
	const [genre, setGenre] = useState("Thriller");
	const [tone, setTone] = useState("Tense");
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
						genre,
						tone,
						episode_count_preference: episodes,
						max_revisions: 2,
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
			<header className="border-b border-border bg-card">
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
			<div className="mx-auto grid container lg:grid-cols-[390px_1fr]">
				<aside className="border-b border-border bg-card p-5 lg:min-h-[calc(100vh-65px)] lg:border-r lg:border-b-0 lg:p-7 sticky top-0">
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
						<div className="grid grid-cols-2 gap-3">
							<label className="text-sm font-semibold">
								Genre
								<input
									name="genre"
									autoComplete="off"
									value={genre}
									onChange={(event) => setGenre(event.target.value)}
									className="mt-2 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal outline-none focus:border-ring"
								/>
							</label>
							<label className="text-sm font-semibold">
								Tone
								<input
									name="tone"
									autoComplete="off"
									value={tone}
									onChange={(event) => setTone(event.target.value)}
									className="mt-2 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal outline-none focus:border-ring"
								/>
							</label>
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
							disabled={running || !idea.trim()}
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
		<span className="tabular font-semibold text-ink">
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
			<AccordionContent className="pb-5">{children}</AccordionContent>
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
	const scripts = new Map(
		result.episode_scripts.scripts.map((item) => [item.episode_number, item]),
	);
	const emotions = new Map(
		result.emotional_arc.episodes.map((item) => [item.episode_number, item]),
	);
	const retention = new Map(
		result.retention_analysis.episodes.map((item) => [
			item.episode_number,
			item,
		]),
	);
	const cliffhangers = new Map(
		result.cliffhanger_analysis.scores.map((item) => [
			item.episode_number,
			item,
		]),
	);
	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="min-w-0">
					<p className="text-[11px] font-bold tracking-[.16em] text-blue uppercase">
						Series blueprint / complete
					</p>
					<h2 className="font-display mt-2 max-w-3xl wrap-break-words text-balance text-4xl leading-tight sm:text-5xl">
						{result.story_idea}
					</h2>
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
				<button
					type="button"
					onClick={onReset}
					className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
				>
					New analysis
				</button>
			</div>
			<div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
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
					<div className="bg-card p-4" key={String(label)}>
						<p className="text-[10px] font-bold tracking-[.12em] text-muted-foreground uppercase">
							{label}
						</p>
						<p className="font-display tabular mt-2 text-3xl">{value}</p>
					</div>
				))}
			</div>
			<section className="grid gap-7 xl:grid-cols-[1.45fr_.85fr]">
				<div className="rounded-xl border border-border bg-card">
					<div className="border-b border-border p-5">
						<p className="text-[11px] font-bold tracking-[.14em] text-coral uppercase">
							The episode ribbon
						</p>
						<h3 className="font-display mt-1 text-balance text-3xl">
							{result.episode_planner.overall_narrative_arc}
						</h3>
					</div>
					{result.episode_planner.episodes.map((episode) => (
						<EpisodeCard
							key={episode.episode_number}
							plan={episode}
							script={scripts.get(episode.episode_number)}
							emotion={emotions.get(episode.episode_number)}
							retention={retention.get(episode.episode_number)}
							cliffhanger={cliffhangers.get(episode.episode_number)}
						/>
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
			<section className="grid gap-7 xl:grid-cols-2">
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
									<div className="mb-4 flex gap-5 text-xs text-muted-foreground">
										<span>
											Hook <Score value={episode.hook_strength} />
										</span>
										<span>
											Pacing <Score value={episode.pacing_score} />
										</span>
									</div>
									<div className="space-y-3">
										{episode.risk_zones.map((risk) => (
											<div
												className="rounded-lg bg-muted/70 p-3"
												key={risk.timestamp_range}
											>
												<div className="flex items-center justify-between gap-3">
													<span className="tabular text-xs font-semibold">
														{risk.timestamp_range}
													</span>
													<RiskBadge level={risk.risk_level} />
												</div>
												<p className="mt-2 text-xs leading-5 text-muted-foreground">
													{risk.reason}
												</p>
												<p className="mt-2 border-l-2 border-blue pl-2 text-xs leading-5">
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
									<div className="grid grid-cols-3 gap-2 text-center text-xs">
										<Metric label="Curiosity" value={score.curiosity_gap} />
										<Metric label="Stakes" value={score.stakes_level} />
										<Metric label="Charge" value={score.emotional_charge} />
									</div>
									<p className="mt-4 text-xs leading-5 text-muted-foreground">
										{score.reasoning}
									</p>
								</Details>
							))}
						</Accordion>
					</div>
				</InsightPanel>
			</section>
			<section className="grid gap-7 xl:grid-cols-[.8fr_1.2fr]">
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
									<div className="mb-3 text-xs text-muted-foreground">
										Range <Score value={episode.emotional_range} />
									</div>
									<div className="space-y-2">
										{episode.emotion_beats.map((beat) => (
											<div
												className="grid grid-cols-[55px_1fr_auto] items-center gap-3 text-xs"
												key={beat.timestamp_range}
											>
												<span className="tabular text-muted-foreground">
													{beat.timestamp_range}
												</span>
												<span className="capitalize">{beat.emotion}</span>
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
							className="border-t border-border py-4 first:border-t-0"
							key={`${suggestion.episode_number}-${suggestion.category}`}
						>
							<div className="flex flex-wrap items-center gap-2">
								<span className="tabular text-xs font-bold text-coral">
									0{index + 1}
								</span>
								<span className="text-xs font-semibold">
									Episode {suggestion.episode_number}
								</span>
								<span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold tracking-widest text-blue uppercase">
									{suggestion.category}
								</span>
								<RiskBadge level={suggestion.priority} />
							</div>
							<p className="mt-3 text-xs leading-5 text-muted-foreground">
								<b className="text-ink">Issue:</b> {suggestion.current_issue}
							</p>
							<p className="mt-2 border-l-2 border-coral pl-3 text-xs leading-5">
								<b>Make this change:</b> {suggestion.suggested_improvement}
							</p>
							<p className="mt-2 text-xs leading-5 text-muted-foreground">
								<b className="text-ink">Expected impact:</b>{" "}
								{suggestion.expected_impact}
							</p>
						</article>
					))}
				</InsightPanel>
			</section>
			<section className="rounded-xl border border-border bg-card p-5">
				<p className="text-[11px] font-bold tracking-[.14em] text-blue uppercase">
					Script package
				</p>
				<h3 className="font-display mt-1 text-3xl">
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
								<div className="space-y-5">
									<p className="whitespace-pre-wrap text-sm leading-7 text-ink/85">
										{script.script}
									</p>
									<div className="grid gap-5 md:grid-cols-2">
										<div>
											<p className="text-[10px] font-bold tracking-[.12em] text-coral uppercase">
												Vertical direction
											</p>
											<ul className="mt-2 space-y-2 text-xs leading-5 text-muted-foreground">
												{script.scene_directions.map((direction) => (
													<li className="flex gap-2" key={direction}>
														<span className="text-coral">•</span>
														{direction}
													</li>
												))}
											</ul>
										</div>
										<div>
											<p className="text-[10px] font-bold tracking-[.12em] text-coral uppercase">
												Continuity note
											</p>
											<p className="mt-2 text-xs leading-5 text-muted-foreground">
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

function EpisodeCard({
	plan,
	script,
	emotion,
	retention,
	cliffhanger,
}: {
	plan: EpisodePlan;
	script?: Result["episode_scripts"]["scripts"][number];
	emotion?: Result["emotional_arc"]["episodes"][number];
	retention?: Result["retention_analysis"]["episodes"][number];
	cliffhanger?: Result["cliffhanger_analysis"]["scores"][number];
}) {
	return (
		<article className="grid grid-cols-[42px_1fr] gap-3 border-b border-border p-5 last:border-0">
			<span className="font-display text-2xl italic text-coral">
				{String(plan.episode_number).padStart(2, "0")}
			</span>
			<div className="min-w-0">
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<h4 className="text-sm font-bold">{plan.title}</h4>
					<span className="tabular text-[11px] text-muted-foreground">
						~{plan.estimated_word_count} words
					</span>
				</div>
				<p className="mt-2 text-sm leading-6 text-muted-foreground">
					{plan.outline}
				</p>
				<div className="mt-3 grid gap-3 text-xs md:grid-cols-2">
					<p>
						<b>Emotional move:</b> {plan.emotional_arc_notes}
					</p>
					<p className="border-l-2 border-coral pl-3">
						<b>End on:</b> {plan.cliffhanger_idea}
					</p>
				</div>
				<div className="mt-3 flex flex-wrap gap-2">
					{plan.retention_hooks.map((hook) => (
						<span
							className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-ink/75"
							key={hook}
						>
							{hook}
						</span>
					))}
				</div>
				{(script || emotion || retention || cliffhanger) && (
					<div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground sm:grid-cols-4">
						{script && (
							<span>
								Script{" "}
								<Score
									value={script.word_count}
									outOf={plan.estimated_word_count}
								/>
							</span>
						)}
						{emotion && (
							<span className="capitalize">{emotion.dominant_emotion}</span>
						)}
						{retention && (
							<span>
								Retention{" "}
								<Score value={retention.overall_retention_score} outOf={100} />
							</span>
						)}
						{cliffhanger && (
							<span>
								Hook <Score value={cliffhanger.score} />
							</span>
						)}
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
		<section className="rounded-xl border border-border bg-card p-5">
			<p className="text-[10px] font-bold tracking-[.14em] text-coral uppercase">
				{eyebrow}
			</p>
			<h3 className="font-display mt-1 text-3xl">{title}</h3>
			<div className="mt-4">{children}</div>
		</section>
	);
}

function Metric({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-lg bg-muted p-2">
			<p className="text-[10px] text-muted-foreground">{label}</p>
			<Score value={value} />
		</div>
	);
}
