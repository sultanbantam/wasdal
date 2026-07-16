from __future__ import annotations

from typing import Protocol, TypeVar

StateT = TypeVar("StateT")


class Agent(Protocol[StateT]):
    name: str

    def run(self, state: StateT) -> StateT:
        """Mutate and return state in one auditable agent step."""
