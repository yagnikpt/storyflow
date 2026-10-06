"""Small, explicit creative controls shared by the API and prompt pipeline."""

from __future__ import annotations

from typing import Literal

TonePreset = Literal["comedic", "dark", "romantic", "thriller", "custom"]

TONE_PRESET_PARAMS: dict[TonePreset, str] = {
    "comedic": (
        "Tone preset: COMEDIC. Use conversational humour, escalating awkwardness, "
        "clean reversals and a warm emotional payoff. Keep characters credible; do not "
        "turn them into caricatures or rely on accents, caste, region, or gender as a joke."
    ),
    "dark": (
        "Tone preset: DARK. Build dread through moral pressure, consequence, restrained "
        "detail and unsettling reversals. Keep violence implied unless the premise needs it; "
        "avoid gratuitous cruelty."
    ),
    "romantic": (
        "Tone preset: ROMANTIC. Centre mutual agency, chemistry in specific actions, emotional "
        "vulnerability and earned intimacy. Let conflict come from meaningful choices, not "
        "miscommunication alone."
    ),
    "thriller": (
        "Tone preset: THRILLER. Open on an immediate threat, contradiction, or urgent question. "
        "Escalate causally, reveal information fairly, and end each episode with a concrete "
        "choice, deadline, or reversal."
    ),
}
