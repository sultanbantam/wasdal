from __future__ import annotations

import json
from typing import Any
from pydantic import BaseModel, Field

from app.core.config import get_settings

class IntakeRecommendation(BaseModel):
    action: str = Field(description="Rekomendasi tindakan spesifik")
    horizon: str = Field(description="Jangka waktu (misalnya: Quick Win, Mid Term, Long Term)")
    estimated_time: str = Field(description="Estimasi waktu penyelesaian (misalnya: 1-3 hari)")

class IntakeOutput(BaseModel):
    summary: str = Field(description="Ringkasan singkat dari laporan (maksimal 2 kalimat)")
    category: str = Field(description="Kategori utama (misal: Infrastruktur, Utilitas, Lingkungan)")
    subcategory: str = Field(description="Subkategori laporan (misal: Jalan Rusak, PJU Mati)")
    priority: str = Field(description="Prioritas (Critical, High, Medium, Low)")
    priority_score: float = Field(description="Skor prioritas dari 0.0 sampai 1.0")
    severity: str = Field(description="Tingkat keparahan (Minor, Moderate, Major, Critical)")
    location_name: str = Field(description="Nama lokasi kejadian yang diekstrak dari teks")
    latitude: float | None = Field(default=None, description="Estimasi latitude jika diketahui, atau null")
    longitude: float | None = Field(default=None, description="Estimasi longitude jika diketahui, atau null")
    suggested_agency: str = Field(description="OPD / Dinas yang disarankan untuk menangani")
    suggested_deadline: str | None = Field(default=None, description="Tenggat waktu penyelesaian (ISO format)")
    recommendations: list[IntakeRecommendation] = Field(description="Rekomendasi tindakan yang harus dilakukan")
    confidence: float = Field(description="Tingkat keyakinan AI dari 0.0 sampai 1.0")

class ActionItem(BaseModel):
    task: str = Field(description="Tugas yang harus dilakukan")
    pic: str = Field(description="Penanggung jawab tugas (Assignee)")
    deadline: str = Field(description="Tenggat waktu")
    status: str = Field(default="Open", description="Status (selalu Open)")

class MeetingOutput(BaseModel):
    summary: str = Field(description="Ringkasan rapat (maksimal 3 kalimat)")
    decisions: list[str] = Field(description="Daftar keputusan yang diambil")
    action_items: list[ActionItem] = Field(description="Daftar tugas (action item)")
    confidence: float = Field(description="Tingkat keyakinan AI dari 0.0 sampai 1.0")

class OpenAIWasdalAgentGraph:
    def __init__(self) -> None:
        from openai import OpenAI
        settings = get_settings()
        self.client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)
        self.model = "gpt-4o-mini"

    def run_intake(self, raw_text: str, source: str = "Manual", attachments: list[str] | None = None) -> dict[str, Any]:
        prompt = f"""Anda adalah AI asisten super-cerdas untuk Pemerintah Kota Tangerang Selatan (Bagian Ekbang).
Tugas Anda adalah merespons laporan masyarakat berikut dengan solusi yang SANGAT AGRESIF, TANGGAP, OUT OF THE BOX, dan IMPLEMENTATIF.
JANGAN gunakan bahasa normatif atau birokratis. Sebutkan tindakan taktis nyata (misal: "Gunakan dana CSR", "Kirim tim Katak", "Libatkan RT/RW untuk gotong royong").
Berikan estimasi waktu yang ambisius (hitungan jam untuk kondisi darurat).

Sumber: {source}
Teks Laporan: {raw_text}

Ekstrak semua informasi dan buat rekomendasi paling solutif!"""

        messages_content: list[dict[str, Any]] = [{"type": "text", "text": prompt}]
        for attachment in attachments or []:
            if attachment.startswith("data:image"):
                messages_content.append({
                    "type": "image_url",
                    "image_url": {"url": attachment}
                })

        completion = self.client.beta.chat.completions.parse(
            model=self.model,
            messages=[{"role": "user", "content": messages_content}],
            response_format=IntakeOutput,
        )
        
        output = completion.choices[0].message.parsed
        return {
            "summary": output.summary,
            "category": output.category,
            "subcategory": output.subcategory,
            "priority": output.priority,
            "priority_score": output.priority_score,
            "severity": output.severity,
            "location_name": output.location_name,
            "latitude": output.latitude,
            "longitude": output.longitude,
            "suggested_agency": output.suggested_agency,
            "suggested_deadline": output.suggested_deadline,
            "recommendations": [rec.model_dump() for rec in output.recommendations],
            "confidence": output.confidence,
            "entities": {},
            "audit_notes": ["Diproses menggunakan OpenAI (GPT-4o-mini)"],
        }

    def run_meeting(self, title: str, transcript: str) -> dict[str, Any]:
        prompt = f"""Anda adalah AI asisten rapat untuk Pemerintah Kota Tangerang Selatan (Bagian Ekbang).
Tugas Anda adalah merangkum notulen rapat berikut:
Judul Rapat: {title}
Transkrip Rapat: {transcript}

Ekstrak ringkasan, daftar keputusan, dan daftar Action Item dengan akurat."""

        completion = self.client.beta.chat.completions.parse(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            response_format=MeetingOutput,
        )

        output = completion.choices[0].message.parsed
        
        decision_block = "\n".join(f"- {decision}" for decision in output.decisions)
        action_block = "\n".join(f"- {item.task} | PIC: {item.pic} | Deadline: {item.deadline}" for item in output.action_items)
        minutes = (
            f"# Notulen {title}\n\n"
            f"## Ringkasan\n{output.summary}\n\n"
            f"## Keputusan\n{decision_block}\n\n"
            f"## Action Item\n{action_block}\n"
        )

        return {
            "title": title,
            "transcript": transcript,
            "summary": output.summary,
            "decisions": output.decisions,
            "action_items": [{"action": item.task, "assignee": item.pic, "deadline": item.deadline} for item in output.action_items],
            "minutes": minutes,
            "confidence": output.confidence,
        }
