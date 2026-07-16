from __future__ import annotations

from pathlib import Path

from rag.app.rag_pipeline import chunk_text


def ingest_text_file(path: str, document_id: str | None = None) -> dict:
    source = Path(path)
    text = source.read_text(encoding="utf-8")
    chunks = chunk_text(document_id=document_id or source.stem, title=source.name, text=text)
    return {
        "document_id": document_id or source.stem,
        "title": source.name,
        "chunk_count": len(chunks),
        "chunks": [chunk.__dict__ for chunk in chunks],
    }


if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Ingest text file into Wasdal RAG chunks.")
    parser.add_argument("path")
    args = parser.parse_args()
    print(json.dumps(ingest_text_file(args.path), ensure_ascii=False, indent=2))
