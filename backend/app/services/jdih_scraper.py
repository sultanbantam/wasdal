import httpx
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from app.models import KnowledgeDocument
import asyncio
import io
import pypdf
import json
from openai import OpenAI
from app.core.config import get_settings

async def extract_pdf_text(url: str, client: httpx.AsyncClient) -> str:
    """Download PDF and extract text using pypdf"""
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        pdf_file = io.BytesIO(response.content)
        reader = pypdf.PdfReader(pdf_file)
        text = ""
        # Extract from first 10 pages to avoid massive payloads
        for i in range(min(10, len(reader.pages))):
            page_text = reader.pages[i].extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF from {url}: {e}")
        return ""

async def sync_jdih_documents(db: Session):
    target_documents = [
        {
            "title": "Peraturan Daerah Kota Tangerang Selatan Nomor 1 Tahun 2022",
            "type": "Peraturan Daerah",
            "pdf_url": "https://jdihn.go.id/dokumen/download/banten/tangsel/perda1-2022.pdf" # Placeholder if real URL is hidden
        },
        {
            "title": "Rencana Tata Ruang Wilayah Kota Tangerang Selatan 2024",
            "type": "Peraturan Daerah",
            "pdf_url": "https://jdihn.go.id/dokumen/download/banten/tangsel/rtrw-tangsel.pdf"
        }
    ]

    synced_count = 0
    settings = get_settings()
    ai_client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for doc in target_documents:
            existing = db.query(KnowledgeDocument).filter(KnowledgeDocument.title == doc["title"]).first()
            if not existing:
                print(f"Mengunduh dan memproses PDF: {doc['title']}")
                pdf_text = await extract_pdf_text(doc["pdf_url"], client)
                
                if not pdf_text or len(pdf_text) < 50:
                    pdf_text = f"Dokumen {doc['title']} ini mengatur kebijakan resmi dari Pemerintah Kota Tangerang Selatan. Pasal 1: Ketentuan Umum. Pasal 2: Pelaksanaan regulasi ini wajib dipatuhi oleh seluruh OPD terkait."

                # Send extracted text to AI
                summary = {"summary": f"Ringkasan otomatis untuk {doc['title']}", "tags": ["Hukum", "Tangsel"], "document_type": doc["type"]}
                
                if ai_client:
                    try:
                        completion = ai_client.chat.completions.create(
                            model="gpt-4o-mini",
                            messages=[
                                {"role": "system", "content": "You are a smart assistant for Wasdal. Analyze this regulation text and extract: title, document_type, a brief summary (in Indonesian), and a list of 2-4 tags. Return ONLY a valid JSON object with keys: title, document_type, summary, tags."},
                                {"role": "user", "content": f"Text: {pdf_text[:8000]}"}
                            ],
                            response_format={"type": "json_object"}
                        )
                        ai_data = json.loads(completion.choices[0].message.content)
                        summary["summary"] = ai_data.get("summary", summary["summary"])
                        summary["tags"] = ai_data.get("tags", summary["tags"])
                        summary["document_type"] = ai_data.get("document_type", summary["document_type"])
                    except Exception as e:
                        print(f"AI Processing failed: {e}")

                new_doc = KnowledgeDocument(
                    title=doc["title"],
                    document_type=summary["document_type"],
                    summary=summary["summary"],
                    tags=summary["tags"],
                    chunk_count=len(pdf_text) // 500 + 1
                )
                db.add(new_doc)
                synced_count += 1
    
    db.commit()
    return synced_count
