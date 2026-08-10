import { ArrowRight, Clapperboard, Play, Sparkles } from "lucide-react";
import { Link } from "react-router";

const stages = [
	"Shape the premise",
	"Find every turning point",
	"Script the next-watch moment",
];

export default function HomePage() {
	return (
		<main
			id="main-content"
			className="min-h-screen overflow-hidden bg-paper text-ink"
		>
			<a className="skip-link" href="#storyflow-content">
				Skip to content
			</a>
			<nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
				<Link
					to="/"
					className="flex items-center gap-2 font-semibold tracking-tight"
				>
					<span
						aria-hidden="true"
						className="grid size-8 place-items-center rounded-full bg-ink text-paper"
					>
						<Clapperboard size={16} />
					</span>
					StoryFlow
				</Link>
				<Link
					to="/analyze"
					className="group flex items-center gap-2 text-sm font-semibold"
				>
					Open studio{" "}
					<ArrowRight
						aria-hidden="true"
						size={16}
						className="transition-transform group-hover:translate-x-1"
					/>
				</Link>
			</nav>
			<section
				id="storyflow-content"
				className="paper-grid grain mx-auto grid min-h-[650px] max-w-7xl overflow-hidden border-y border-ink/15 lg:grid-cols-[1.15fr_.85fr]"
			>
				<div className="flex flex-col justify-between px-6 py-14 lg:px-10 lg:py-20">
					<div className="flex items-center gap-2 text-[11px] font-bold tracking-[.18em] text-blue uppercase animate-in fade-in zoom-in-90 slide-in-from-bottom-8 duration-500 delay-100 fill-mode-both origin-left">
						<span className="size-2 rounded-full bg-coral" />
						Episodic intelligence for short-form
					</div>
					<div className="my-12 max-w-3xl">
						<h1 className="font-display text-balance text-6xl leading-[.91] tracking-tight text-ink md:text-8xl animate-in fade-in zoom-in-90 slide-in-from-bottom-8 duration-500 delay-200 fill-mode-both origin-left">
							Make every
							<br />
							<i>90 seconds</i>
							<br />
							matter.
						</h1>
						<p className="mt-8 max-w-md text-base leading-7 text-ink/70 animate-in fade-in zoom-in-90 slide-in-from-bottom-8 duration-500 delay-300 fill-mode-both origin-left">
							Turn a raw story spark into a series people cannot stop watching.
							StoryFlow maps the hooks, emotion, pacing, and cliffhangers before
							the first frame is made.
						</p>
					</div>
					<Link
						to="/analyze"
						className="group inline-flex w-fit items-center gap-3 bg-ink px-5 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-blue animate-in fade-in zoom-in-90 slide-in-from-bottom-8 duration-500 delay-350 fill-mode-both origin-left"
					>
						Start a story analysis{" "}
						<span
							aria-hidden="true"
							className="grid size-6 place-items-center rounded-full bg-coral text-ink"
						>
							<ArrowRight
								size={15}
								className="transition-transform group-hover:translate-x-0.5"
							/>
						</span>
					</Link>
				</div>
				<div className="relative flex min-h-[420px] items-center bg-ink p-7 text-paper lg:p-10">
					<div className="absolute inset-y-0 left-0 w-2 episode-ribbon" />
					<div className="relative w-full border border-paper/20 p-6 lg:p-8">
						<div className="mb-14 flex items-center justify-between text-[10px] font-bold tracking-[.18em] text-paper/50 uppercase">
							<span>Series blueprint</span>
							<span className="tabular">06 eps</span>
						</div>
						<div className="space-y-6">
							{stages.map((stage, i) => (
								<div className="flex items-start gap-4" key={stage}>
									<span className="font-display text-3xl italic text-coral">
										0{i + 1}
									</span>
									<div className="min-w-0">
										<p className="font-medium">{stage}</p>
										<div className="mt-2 h-px w-40 bg-paper/20">
											<div
												className="h-px bg-coral"
												style={{ width: `${[88, 64, 100][i]}%` }}
											/>
										</div>
									</div>
								</div>
							))}
						</div>
						<div className="mt-14 flex items-center gap-3 border-t border-paper/20 pt-5 text-xs text-paper/65">
							<span
								aria-hidden="true"
								className="grid size-7 place-items-center rounded-full border border-paper/30"
							>
								<Play size={12} fill="currentColor" />
							</span>{" "}
							Built for the vertical cut
						</div>
					</div>
				</div>
			</section>
			<section className="mx-auto grid max-w-7xl gap-px bg-ink/15 md:grid-cols-3">
				<div className="bg-paper p-7 flex gap-4">
					<Sparkles className="text-coral mt-2 size-5" />
					<h2 className="font-display text-3xl">
						A story room,
						<br />
						not a prompt box.
					</h2>
				</div>
				<div className="bg-paper p-7 text-sm leading-6 text-ink/70">
					See the work as it happens. Every stage of the AI pipeline is visible,
					from the first classification to the final optimization pass.
				</div>
				<div className="bg-paper p-7 text-sm leading-6 text-ink/70">
					Leave with an episode map, scripts, emotional beats, retention risks,
					and practical fixes for the cut.
				</div>
			</section>
		</main>
	);
}
