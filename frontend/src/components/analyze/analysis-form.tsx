import { ArrowUpRight, LoaderCircle } from "lucide-react";
import type { FormEvent } from "react";

type AnalysisFormProps = {
	idea: string;
	genre: string;
	tone: string;
	episodes: number;
	running: boolean;
	error: string;
	onSubmit: (event: FormEvent) => void;
	onIdeaChange: (value: string) => void;
	onGenreChange: (value: string) => void;
	onToneChange: (value: string) => void;
	onEpisodesChange: (value: number) => void;
};

export function AnalysisForm(props: AnalysisFormProps) {
	return <aside className="sticky top-0 border-b border-border bg-card p-5 lg:min-h-[calc(100vh-65px)] lg:border-r lg:border-b-0 lg:p-7"><div className="mb-7"><p className="text-[11px] font-bold tracking-[.16em] text-blue uppercase">New analysis</p><h1 className="font-display mt-2 text-balance text-4xl leading-none">Give it a beginning.</h1></div><form onSubmit={props.onSubmit} className="space-y-5"><label className="block text-sm font-semibold">Story seed<textarea required name="story-idea" autoComplete="off" value={props.idea} onChange={(event) => props.onIdeaChange(event.target.value)} placeholder="A lonely astronaut hears a melody beneath the red Martian dust…" className="mt-2 min-h-36 w-full resize-y rounded-lg border border-input bg-background p-3.5 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"/></label><div className="grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Genre<input name="genre" autoComplete="off" value={props.genre} onChange={(event) => props.onGenreChange(event.target.value)} className="mt-2 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal outline-none focus:border-ring"/></label><label className="text-sm font-semibold">Tone<input name="tone" autoComplete="off" value={props.tone} onChange={(event) => props.onToneChange(event.target.value)} className="mt-2 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal outline-none focus:border-ring"/></label></div><label className="block text-sm font-semibold">Episode count <span className="tabular float-right text-muted-foreground">{props.episodes} parts</span><input aria-label="Episode count" name="episode-count" type="range" min="5" max="8" value={props.episodes} onChange={(event) => props.onEpisodesChange(Number(event.target.value))} className="mt-3 w-full accent-blue"/><div className="flex justify-between text-[11px] text-muted-foreground"><span>5</span><span>8</span></div></label><button type="submit" disabled={props.running || !props.idea.trim()} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-blue disabled:cursor-not-allowed disabled:opacity-50">{props.running ? <><LoaderCircle aria-hidden="true" size={16} className="animate-spin"/>Building the series…</> : <>Build the blueprint <ArrowUpRight aria-hidden="true" size={16}/></>}</button>{props.error && <p aria-live="polite" className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">{props.error} Check that the API is running, then try again.</p>}</form></aside>;
}
