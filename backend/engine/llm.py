"""LLM factory for the Episodic Intelligence Engine."""

from __future__ import annotations

from app.config import settings
from langchain.chat_models import BaseChatModel, init_chat_model

DEFAULT_MODEL = settings.ai_model


def get_model(
    model_name: str | None = None,
    temperature: float = 0,
) -> BaseChatModel:
    """Return a configured chat model.

    Args:
        model_name: Model identifier.
        temperature: Sampling temperature (0 = deterministic).

    Returns:
        A configured chat model backed by Vertex AI.
    """
    resolved_model = model_name or DEFAULT_MODEL

    model = init_chat_model(
        f"{settings.ai_provider}:{resolved_model}",
        api_key=settings.ai_provider_api_key,
        temperature=temperature,
    )
    return model
