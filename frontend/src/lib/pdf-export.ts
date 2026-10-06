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

function printDocument(result: Result, kind: ExportKind, content: string, title: string) {
	const exportLabel = kind === "scripts" ? "Script package" : "Full series blueprint";
	return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
		@page{margin:15mm 16mm 18mm}
		:root{color:#172033;background:#fffdf8;font-family:Arial,sans-serif}
		body{margin:0;color:#172033;font:10.5pt/1.6 Arial,sans-serif}
		.cover{border-bottom:2px solid #10295c;padding:0 0 18px;margin:0 0 30px}
		.kicker{color:#2563a7;font-size:8pt;font-weight:700;letter-spacing:.16em;text-transform:uppercase}
		h1{color:#10295c;font-family:Georgia,serif;font-size:29pt;line-height:1.05;margin:8px 0 15px}
		.seed{border-left:3px solid #e27155;margin:0;max-width:42rem;padding:2px 0 2px 12px;color:#43516b;font-size:10pt;line-height:1.5;white-space:pre-wrap}
		.seed-label{display:block;color:#10295c;font-size:7.5pt;font-weight:700;letter-spacing:.12em;margin-bottom:3px;text-transform:uppercase}
		.meta{color:#667085;font-size:8.5pt;margin:13px 0 0}
		section{margin:0 0 30px}
		h2{color:#10295c;font-family:Georgia,serif;font-size:18pt;line-height:1.15;margin:0 0 14px;padding-bottom:7px;border-bottom:1px solid #dbe2ef}
		h3{color:#10295c;font-size:12pt;line-height:1.25;margin:0 0 4px}
		h4{color:#2563a7;font-size:8pt;letter-spacing:.1em;margin:18px 0 5px;text-transform:uppercase}
		p{margin:0 0 10px}.lede{color:#43516b;font-size:11.5pt;line-height:1.55}.script{break-before:page}.script:first-of-type{break-before:auto}.script-text{background:#f5f7fb;border-left:2px solid #cbd5e1;line-height:1.7;padding:13px 15px;white-space:pre-wrap}article{break-inside:avoid;border-bottom:1px solid #e5e7eb;padding:0 0 16px;margin:0 0 16px}ul{margin:5px 0 0;padding-left:18px}li{margin:0 0 5px}
	</style></head><body><header class="cover"><div class="kicker">StoryFlow / ${exportLabel}</div><h1>Series blueprint</h1><p class="seed"><span class="seed-label">Story seed</span>${escapeHtml(result.story_idea)}</p><p class="meta">Created ${escapeHtml(new Date(result.created_at).toLocaleString())} · ${result.episode_planner.total_episodes} episodes · ${result.episode_scripts.total_word_count.toLocaleString()} words</p></header>${content}</body></html>`;
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
	frame.srcdoc = printDocument(result, kind, content, safeTitle);
	document.body.append(frame);
}
