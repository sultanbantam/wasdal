import httpx
import xml.etree.ElementTree as ET
import json
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from openai import OpenAI

from app.core.config import get_settings
from app.models import Case
from app.schemas.cases import CaseCreate
from app.services.case_service import CaseService

async def fetch_tangsel_news() -> list[dict]:
    """Mengambil 5 berita terbaru tentang Tangerang Selatan dari Google News RSS."""
    url = "https://news.google.com/rss/search?q=tangerang+selatan+OR+tangsel&hl=id&gl=ID&ceid=ID:id"
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
    root = ET.fromstring(response.text)
    items = root.findall('.//item')
    
    news_list = []
    for item in items[:5]:  # Batasi 5 berita terbaru
        title = item.find('title').text if item.find('title') is not None else ""
        link = item.find('link').text if item.find('link') is not None else ""
        pub_date = item.find('pubDate').text if item.find('pubDate') is not None else ""
        
        news_list.append({
            "title": title,
            "link": link,
            "pub_date": pub_date
        })
    return news_list

async def analyze_and_create_cases(db: Session, news_list: list[dict]):
    settings = get_settings()
    if not settings.openai_api_key:
        print("OPENAI_API_KEY tidak ditemukan, membatalkan analisis berita.")
        return 0

    client = OpenAI(api_key=settings.openai_api_key)
    case_service = CaseService(db)
    new_cases_count = 0

    for news in news_list:
        # Cek apakah berita dengan judul ini sudah pernah dimasukkan (mencegah duplikasi)
        existing = db.query(Case).filter(Case.title.ilike(f"%{news['title'][:50]}%")).first()
        if existing:
            continue

        try:
            # Gunakan OpenAI untuk menilai potensi keluhan/krisis dari judul berita
            prompt = f"""
Anda adalah Asisten Pengawasan Pemerintah Kota (Wasdal). Evaluasi judul berita berikut:
"{news['title']}"

Tugas Anda:
1. Tentukan apakah berita ini berpotensi menjadi masalah viral atau keluhan masyarakat yang butuh atensi Pemkot (misal: kriminalitas, fasilitas rusak, kemacetan, keluhan publik).
2. Jika BUKAN masalah/keluhan (misal: berita positif, apresiasi, acara biasa), set is_issue = false.
3. Jika YA, berikan kategori, instansi (agency) terkait, tingkat prioritas, dan ringkasan.

Keluarkan format JSON murni:
{{
  "is_issue": true/false,
  "category": "Kategori masalah",
  "priority": "Low/Medium/High/Critical",
  "agency": "Dinas X",
  "summary": "Analisis singkat kenapa ini masalah"
}}
"""
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            
            ai_data = json.loads(completion.choices[0].message.content)
            
            if ai_data.get("is_issue"):
                # Buat Case
                payload = CaseCreate(
                    title=news["title"][:180],
                    description=f"Berita dari Media Online: {news['link']}\n\nTanggal Publikasi: {news['pub_date']}\n\nCatatan AI:\n{ai_data.get('summary')}",
                    category=ai_data.get("category", "Media Berita"),
                    source="Media Monitoring",
                    status="New",
                    priority=ai_data.get("priority", "Medium"),
                    severity="Minor",
                    priority_score=0.8 if ai_data.get("priority") in ["High", "Critical"] else 0.4,
                    agency=ai_data.get("agency", "Diskominfo"),
                    ai_summary=ai_data.get("summary", ""),
                    ai_confidence=0.9
                )
                case_service.create_case(payload, actor_id="media-bot")
                new_cases_count += 1
                
        except Exception as e:
            print(f"Gagal memproses berita {news['title']}: {e}")

    db.commit()
    return new_cases_count

async def run_media_monitoring_sync(db: Session):
    print("Memulai proses Media Monitoring (Google News)...")
    try:
        news_list = await fetch_tangsel_news()
        count = await analyze_and_create_cases(db, news_list)
        print(f"Media Monitoring selesai. {count} isu potensial ditambahkan sebagai Case.")
        return count
    except Exception as e:
        print(f"Error Media Monitoring: {e}")
        return 0
