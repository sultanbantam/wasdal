import pytest
from fastapi.testclient import TestClient

from app.main import app


def test_urban_overview_endpoint():
    with TestClient(app) as client:
        res = client.get("/api/v1/urban/overview")
        assert res.status_code == 200
        data = res.json()
        assert "health_index" in data
        assert "cables" in data
        assert "obstructions" in data
        assert "walkpoints" in data
        assert data["payment_readiness_status"] == "SIMULATION / NOT ENABLED FOR COLLECTION"


def test_urban_cables_and_clutter_index():
    with TestClient(app) as client:
        res = client.get("/api/v1/urban/cables")
        assert res.status_code == 200
        items = res.json()
        assert len(items) >= 1
        assert "clutter_index" in items[0]
        assert "asset_code" in items[0]


def test_urban_sidewalks_and_obstructions():
    with TestClient(app) as client:
        # Check sidewalks
        sw_res = client.get("/api/v1/urban/sidewalks")
        assert sw_res.status_code == 200
        assert len(sw_res.json()) >= 1

        # Report obstruction
        obs_payload = {
            "title": "Mobil Parkir Menutup Jalur Trotoar",
            "description": "Kendaraan parkir melintang di atas trotoar depan kantor pos",
            "location_name": "Jl. Pahlawan Seribu No. 12",
            "latitude": -6.291,
            "longitude": 106.668,
            "source": "Laporan Warga",
        }
        create_res = client.post("/api/v1/urban/obstructions", json=obs_payload)
        assert create_res.status_code == 200
        data = create_res.json()
        assert "id" in data
        assert data["ai_analysis"]["requires_human_verification"] is True


def test_walkpoints_flow():
    with TestClient(app) as client:
        overview_res = client.get("/api/v1/urban/walkpoints/overview")
        assert overview_res.status_code == 200
        data = overview_res.json()
        account_id = data["account_demo"]["id"]
        assert account_id is not None

        # Check in
        ci_res = client.post(
            "/api/v1/urban/walkpoints/checkin",
            json={"account_id": account_id, "corridor_location": "Koridor BSD"},
        )
        assert ci_res.status_code == 200
        assert ci_res.json()["new_balance"] >= 50


def test_talent_overview_and_socialization():
    with TestClient(app) as client:
        overview_res = client.get("/api/v1/talent/overview")
        assert overview_res.status_code == 200
        data = overview_res.json()
        assert data["readiness_index_pct"] > 0
        assert "nine_box_distribution" in data

        soc_res = client.get("/api/v1/talent/socialization")
        assert soc_res.status_code == 200
        soc_data = soc_res.json()
        assert len(soc_data["materials"]) >= 1


def test_talent_faq_and_nine_box():
    with TestClient(app) as client:
        # FAQ test
        faq_res = client.post("/api/v1/talent/faq", json={"question": "Bagaimana cara kerja penilaian 9 Box?"})
        assert faq_res.status_code == 200
        faq_data = faq_res.json()
        assert "official_source" in faq_data
        assert "PAN-RB" in faq_data["official_source"]

        # 9-Box matrix test
        box_res = client.get("/api/v1/talent/9box")
        assert box_res.status_code == 200
        box_data = box_res.json()
        assert len(box_data["boxes"]) == 9


def test_talent_succession_and_mobility():
    with TestClient(app) as client:
        succ_res = client.get("/api/v1/talent/succession")
        assert succ_res.status_code == 200
        assert len(succ_res.json()) >= 1

        mob_res = client.get("/api/v1/talent/mobility")
        assert mob_res.status_code == 200
        assert len(mob_res.json()) >= 1
        assert "ai_disclaimer" in mob_res.json()[0]
