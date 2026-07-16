from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable


@dataclass
class DocumentChunk:
    document_id: str
    title: str
    text: str
    metadata: dict


def chunk_text(document_id: str, title: str, text: str, chunk_size: int = 900, overlap: int = 120) -> list[DocumentChunk]:
    chunks: list[DocumentChunk] = []
    clean = " ".join(text.split())
    cursor = 0
    index = 0
    while cursor < len(clean):
        end = min(cursor + chunk_size, len(clean))
        chunk = clean[cursor:end]
        chunks.append(
            DocumentChunk(
                document_id=document_id,
                title=title,
                text=chunk,
                metadata={"chunk_index": index, "start": cursor, "end": end},
            )
        )
        if end >= len(clean):
            break
        cursor = max(end - overlap, cursor + 1)
        index += 1
    return chunks


class WasdalRetriever:
    """Small retrieval boundary; production implementation stores embeddings in pgvector."""

    def __init__(self, chunks: Iterable[DocumentChunk] | None = None) -> None:
        self.chunks = list(chunks or [])

    def add(self, chunks: Iterable[DocumentChunk]) -> None:
        self.chunks.extend(chunks)

    def search(self, query: str, limit: int = 5) -> list[DocumentChunk]:
        tokens = {token.lower() for token in query.split() if len(token) > 2}
        ranked: list[tuple[int, DocumentChunk]] = []
        for chunk in self.chunks:
            text = chunk.text.lower()
            score = sum(1 for token in tokens if token in text)
            if score:
                ranked.append((score, chunk))
        ranked.sort(key=lambda item: item[0], reverse=True)
        return [chunk for _, chunk in ranked[:limit]]


def build_context(query: str, chunks: Iterable[DocumentChunk], limit: int = 5) -> str:
    retriever = WasdalRetriever(chunks)
    matches = retriever.search(query, limit=limit)
    return "\n\n".join(f"[{match.title} #{match.metadata['chunk_index']}]\n{match.text}" for match in matches)
