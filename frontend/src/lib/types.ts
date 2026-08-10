export type Progress = { node: string; status: "started" | "completed" };

export type EpisodePlan = {
	episode_number: number;
	title: string;
	outline: string;
	emotional_arc_notes: string;
	cliffhanger_idea: string;
	retention_hooks: string[];
	estimated_word_count: number;
};

export type Result = {
	run_id: string;
	story_idea: string;
	revisions_completed: number;
	created_at: string;
	episode_planner: {
		total_episodes: number;
		overall_narrative_arc: string;
		target_audience: string;
		episodes: EpisodePlan[];
	};
	episode_scripts: {
		scripts: {
			episode_number: number;
			title: string;
			script: string;
			word_count: number;
			scene_directions: string[];
			continuity_notes: string;
		}[];
		total_word_count: number;
		series_continuity_summary: string;
	};
	emotional_arc: {
		episodes: {
			episode_number: number;
			emotion_beats: {
				timestamp_range: string;
				emotion: string;
				intensity: number;
			}[];
			dominant_emotion: string;
			emotional_range: number;
		}[];
		overall_progression: string;
		emotional_coherence_score: number;
		tension_curve_description: string;
	};
	retention_analysis: {
		strongest_episode: number;
		weakest_episode: number;
		overall_series_retention_prediction: string;
		episodes: {
			episode_number: number;
			overall_retention_score: number;
			hook_strength: number;
			pacing_score: number;
			risk_zones: {
				timestamp_range: string;
				risk_level: string;
				reason: string;
				suggested_fix: string;
			}[];
		}[];
	};
	cliffhanger_analysis: {
		average_score: number;
		strongest_cliffhanger: number;
		weakest_cliffhanger: number;
		scores: {
			episode_number: number;
			score: number;
			cliffhanger_type: string;
			curiosity_gap: number;
			stakes_level: number;
			emotional_charge: number;
			reasoning: string;
		}[];
	};
	optimization_report: {
		overall_quality_score: number;
		predicted_quality_after_optimization: number;
		top_3_priorities: string[];
		suggestions: {
			episode_number: number;
			category: string;
			current_issue: string;
			suggested_improvement: string;
			priority: string;
			expected_impact: string;
		}[];
	};
};
