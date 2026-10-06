import type { Result } from "@/lib/types";

type ExportKind = "scripts" | "all";

function escapeHtml(value: unknown) {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function section(title: string, content: string) {
	return `<section><h2>${escapeHtml(title)}</h2>${content}</section>`;
}

function list(items: unknown[]) {
	return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function scriptsDocument(result: Result) {
	return section("Series scripts", `<p class="lede">${escapeHtml(result.episode_scripts.series_continuity_summary)}</p>${result.episode_scripts.scripts.map((script) => `<article class="script"><h3>Episode ${script.episode_number}: ${escapeHtml(script.title)}</h3><p class="meta">${script.word_count} words</p><div class="script-text">${escapeHtml(script.script)}</div><h4>Vertical direction</h4>${list(script.scene_directions)}<h4>Continuity note</h4><p>${escapeHtml(script.continuity_notes)}</p></article>`).join("")}`);
}

function allDataDocument(result: Result) {
	const plan = result.episode_planner.episodes.map((episode) => `<article><h3>Episode ${episode.episode_number}: ${escapeHtml(episode.title)}</h3><p>${escapeHtml(episode.outline)}</p><p><b>Emotional arc:</b> ${escapeHtml(episode.emotional_arc_notes)}</p><p><b>Cliffhanger:</b> ${escapeHtml(episode.cliffhanger_idea)}</p><p><b>Retention hooks:</b> ${escapeHtml(episode.retention_hooks.join(" · "))}</p></article>`).join("");
	const retention = result.retention_analysis.episodes.map((episode) => `<article><h3>Episode ${episode.episode_number}: ${episode.overall_retention_score}% retention</h3><p>Hook ${episode.hook_strength}/10 · Pacing ${episode.pacing_score}/10</p>${episode.risk_zones.map((risk) => `<p><b>${escapeHtml(risk.timestamp_range)} — ${escapeHtml(risk.risk_level)}:</b> ${escapeHtml(risk.reason)}<br/><i>Fix: ${escapeHtml(risk.suggested_fix)}</i></p>`).join("")}</article>`).join("");
	const optimization = result.optimization_report.suggestions.map((suggestion) => `<article><h3>Episode ${suggestion.episode_number}: ${escapeHtml(suggestion.category)}</h3><p><b>Issue:</b> ${escapeHtml(suggestion.current_issue)}</p><p><b>Change:</b> ${escapeHtml(suggestion.suggested_improvement)}</p><p><b>Impact:</b> ${escapeHtml(suggestion.expected_impact)}</p></article>`).join("");
	return [
		section("Series blueprint", `<p class="lede">${escapeHtml(result.episode_planner.overall_narrative_arc)}</p><p>Audience: ${escapeHtml(result.episode_planner.target_audience)}</p><p>Quality: ${result.optimization_report.overall_quality_score}/100 · Cliffhanger average: ${result.cliffhanger_analysis.average_score}/10</p>`),
		section("Episode plan", plan),
		scriptsDocument(result),
		section("Emotional throughline", `<p>${escapeHtml(result.emotional_arc.overall_progression)}</p><p>${escapeHtml(result.emotional_arc.tension_curve_description)}</p>`),
		section("Retention diagnosis", retention),
		section("Optimization notes", optimization),
	].join("");
}

export function exportPdf(result: Result, kind: ExportKind) {
	const content = kind === "scripts" ? scriptsDocument(result) : allDataDocument(result);
	const safeTitle = `${kind === "scripts" ? "Scripts" : "Full blueprint"} — StoryFlow`;
	const frame = document.createElement("iframe");
	frame.title = safeTitle;
	frame.setAttribute("aria-hidden", "true");
	frame.style.cssText = "position:fixed;width:1px;height:1px;right:0;bottom:0;border:0;opacity:0;pointer-events:none;";
	frame.onload = () => {
		const printWindow = frame.contentWindow;
		if (!printWindow) return;
		printWindow.addEventListener("afterprint", () => frame.remove(), { once: true });
		printWindow.focus();
		printWindow.print();
	};
	frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title><style>@page{margin:16mm}body{color:#172033;font:11pt/1.55 Arial,sans-serif}h1,h2,h3,h4{color:#10295c}h1{font-size:25pt;margin:0}h2{font-size:17pt;margin:34px 0 12px;border-bottom:1px solid #dbe2ef;padding-bottom:6px}h3{font-size:13pt;margin-bottom:5px}h4{font-size:10pt;text-transform:uppercase;letter-spacing:.08em;margin:18px 0 4px}.meta{color:#5c6576;font-size:9pt}.lede{font-size:12pt}.script{break-before:page}.script:first-of-type{break-before:auto}.script-text{white-space:pre-wrap}article{break-inside:avoid;border-bottom:1px solid #e5e7eb;padding:0 0 16px;margin:0 0 16px}ul{margin-top:4px;padding-left:18px}</style></head><body><h1>${escapeHtml(result.story_idea)}</h1><p class="meta">StoryFlow export · ${escapeHtml(new Date(result.created_at).toLocaleString())}</p>${content}</body></html>`;
	document.body.append(frame);
}
