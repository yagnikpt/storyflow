"""Pydantic schemas for API request and response bodies."""

from __future__ import annotations

import uuid
from datetime import datetime

from engine.state import (
    CliffhangerAnalysis,
    EmotionalArc,
    EpisodePlanner,
    EpisodeScripts,
    OptimizationReport,
    RetentionAnalysis,
)
from engine.tone_presets import TonePreset
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------


class AnalyzeRequest(BaseModel):
    """Payload for POST /episodic-intelligence/analyze."""

    story_idea: str = Field(
        ..., description="The raw story idea to analyze", min_length=1
    )
    target_audience: str = Field(
        default="18-30 mobile-first viewers",
        description="Target audience description",
    )
    tone: str = Field(default="", description="Optional custom tone instruction")
    tone_preset: TonePreset = Field(
        default="thriller",
        description="Creative preset: comedic, dark, romantic, thriller, or custom",
    )
    episode_count_preference: int = Field(
        default=6,
        ge=5,
        le=8,
        description="Preferred number of episodes (5-8)",
    )
    max_revisions: int = Field(
        default=1,
        ge=1,
        le=5,
        description="Number of optimization revision loops (1-5)",
    )


# ---------------------------------------------------------------------------
# Response
# ---------------------------------------------------------------------------


class AnalyzeResponse(BaseModel):
    """Structured response returned by the analysis endpoint."""

    run_id: uuid.UUID = Field(description="Unique identifier for this analysis run")
    story_idea: str
    revisions_completed: int
    episode_planner: EpisodePlanner
    episode_scripts: EpisodeScripts
    emotional_arc: EmotionalArc
    retention_analysis: RetentionAnalysis
    cliffhanger_analysis: CliffhangerAnalysis
    optimization_report: OptimizationReport
    created_at: datetime

    model_config = {"from_attributes": True}
