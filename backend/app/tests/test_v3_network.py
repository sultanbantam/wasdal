import pytest
from fastapi.testclient import TestClient

from app.main import app


def test_network_overview():
    with TestClient(app) as client:
        res = client.get("/api/v1/network/overview")
        assert res.status_code == 200
        data = res.json()
        assert "tagline" in data
        assert "Satu Data, Banyak Gagasan" in data["tagline"]
        assert "national_metrics" in data
        assert data["national_metrics"]["total_regions"] >= 2
        assert len(data["recent_urgent_issues"]) >= 1
        assert len(data["top_replicable_ideas"]) >= 1


def test_network_regions_and_profile():
    with TestClient(app) as client:
        res = client.get("/api/v1/network/regions")
        assert res.status_code == 200
        regions = res.json()
        assert len(regions) >= 2
        
        tangsel = next((r for r in regions if "36.74" in r["code"]), None)
        assert tangsel is not None
        assert tangsel["region_type"] == "Kota"
        
        # Test detail profile
        detail_res = client.get(f"/api/v1/network/regions/{tangsel['id']}")
        assert detail_res.status_code == 200
        detail = detail_res.json()
        assert detail["region"]["code"] == "36.74"
        assert detail["profile"]["leader_name"] is not None
        assert detail["profile"]["completion_score"] > 80
        assert len(detail["team_members"]) >= 1


def test_network_profile_update_autosave():
    with TestClient(app) as client:
        regions = client.get("/api/v1/network/regions").json()
        tangsel = next(r for r in regions if "36.74" in r["code"])
        
        update_payload = {
            "growth_center_zones": "Koridor BSD City, Bintaro Jaya, Ciputat, Alam Sutera (Pembaruan Terkini)",
            "total_umkm": 46800,
        }
        res = client.put(f"/api/v1/network/regions/{tangsel['id']}/profile", json=update_payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["completion_score"] >= 80


def test_network_indicators_and_csv_import():
    with TestClient(app) as client:
        regions = client.get("/api/v1/network/regions").json()
        tangsel = next(r for r in regions if "36.74" in r["code"])
        
        # List indicators
        res = client.get(f"/api/v1/network/indicators?region_id={tangsel['id']}")
        assert res.status_code == 200
        data = res.json()
        assert len(data["definitions"]) >= 3
        assert len(data["values"]) >= 3

        # Test CSV Import
        csv_content = (
            "kode_indikator,nama_indikator,kategori,periode,nilai,satuan,sumber,status_data,catatan\n"
            "IND_TEST_01,Tingkat Partisipasi Angkatan Kerja,Sosial,2024,68.4,%,Disnaker,Sementara,Data rintisan\n"
            "IND_TEST_02,Indeks Kualitas Lingkungan Hidup,Lingkungan,2024,72.1,Poin,DLH,Sementara,Rintisan\n"
            "IND_BAD,,Umum,invalid,abc,%,BPS,Sementara,Gagal\n"
        )
        files = {"file": ("test_indicators.csv", csv_content.encode("utf-8"), "text/csv")}
        import_res = client.post(f"/api/v1/network/indicators/import?region_id={tangsel['id']}", files=files)
        assert import_res.status_code == 200
        import_data = import_res.json()
        assert import_data["success_count"] == 2
        assert import_data["failed_count"] == 1


def test_network_issues_and_diagnosis():
    with TestClient(app) as client:
        regions = client.get("/api/v1/network/regions").json()
        tangsel = next(r for r in regions if "36.74" in r["code"])

        # Create issue
        issue_payload = {
            "region_id": tangsel["id"],
            "title": "Uji Penataan Kabel Udara di Simpang Djuanda",
            "summary": "Tingkat kesemrawutan kabel udara mengganggu estetika dan keselamatan.",
            "category": "Infrastruktur",
            "target_opd": "Dinas Bina Marga & Diskominfo",
            "urgency_level": "Sedang",
            "impact_level": "Tinggi",
            "decision_required": True,
        }
        res_issue = client.post("/api/v1/network/issues", json=issue_payload)
        assert res_issue.status_code == 200
        issue_id = res_issue.json()["id"]

        # Create diagnosis
        diag_payload = {
            "region_id": tangsel["id"],
            "issue_id": issue_id,
            "problem_statement": "Kabel utilitas semrawut melebihi kapasitas beban tiang.",
            "baseline_condition": "60 kabel optik aktif di satu koridor tanpa ducting bawah tanah.",
            "root_cause": "Belum ada Perda ducting bersama terintegrasi.",
            "program_gaps": "Operator utilitas memasang kabel tanpa koordinasi lintas izin.",
            "inaction_risks": "Potensi tiang roboh dan korsleting arus lemah.",
            "solution_options": [{"code": "A", "title": "Bundling darurat"}, {"code": "B", "title": "Ducting swasta"}],
            "expert_recommendation": "Pilihan A untuk jangka pendek 30 hari, dilanjutkan Pilihan B.",
            "author_name": "Staf Ahli Bidang Pembangunan",
        }
        res_diag = client.post("/api/v1/network/diagnoses", json=diag_payload)
        assert res_diag.status_code == 200
        assert res_diag.json()["id"] is not None


def test_network_ideas_and_interest():
    with TestClient(app) as client:
        regions = client.get("/api/v1/network/regions").json()
        tangsel = next(r for r in regions if "36.74" in r["code"])

        # List ideas
        ideas_res = client.get("/api/v1/network/ideas")
        assert ideas_res.status_code == 200
        ideas = ideas_res.json()
        assert len(ideas) >= 2
        first_idea = ideas[0]

        # Express interest
        interest_res = client.post(f"/api/v1/network/ideas/{first_idea['id']}/interest")
        assert interest_res.status_code == 200
        assert interest_res.json()["status"] == "success"
        assert interest_res.json()["interested_regions_count"] == first_idea["interested_regions_count"] + 1


def test_network_fiscal_and_roadmap():
    with TestClient(app) as client:
        regions = client.get("/api/v1/network/regions").json()
        tangsel = next(r for r in regions if "36.74" in r["code"])

        res = client.get(f"/api/v1/network/fiscal?region_id={tangsel['id']}")
        assert res.status_code == 200
        data = res.json()
        assert len(data["snapshots"]) >= 1
        assert "pad_ratio_pct" in data["snapshots"][0]
        assert data["roadmap"] is not None
        assert "disclaimer" in data


def test_network_decision_disposition():
    with TestClient(app) as client:
        regions = client.get("/api/v1/network/regions").json()
        tangsel = next(r for r in regions if "36.74" in r["code"])

        decisions = client.get(f"/api/v1/network/decisions?region_id={tangsel['id']}").json()
        assert len(decisions) >= 1
        target_dec = decisions[0]

        # Submit disposition
        disp_payload = {
            "status": "Disetujui",
            "selected_option": "Option A",
            "disposition_notes": "Segera susun draf Perwal bersama Bagian Hukum dan koordinasikan dengan Sekda.",
            "disposition_by": "Wali Kota Tangerang Selatan",
        }
        res = client.post(f"/api/v1/network/decisions/{target_dec['id']}/disposition", json=disp_payload)
        assert res.status_code == 200
        assert res.json()["current_status"] == "Disetujui"


def test_network_ai_assistant():
    with TestClient(app) as client:
        regions = client.get("/api/v1/network/regions").json()
        tangsel = next(r for r in regions if "36.74" in r["code"])

        res_diag = client.post("/api/v1/network/ai/assist", json={"action": "diagnose", "region_id": tangsel["id"]})
        assert res_diag.status_code == 200
        data = res_diag.json()
        assert "evidence_facts" in data
        assert "guardrail_notice" in data

        res_brief = client.post("/api/v1/network/ai/assist", json={"action": "policy_brief", "region_id": tangsel["id"]})
        assert res_brief.status_code == 200
        brief_data = res_brief.json()
        assert "key_recommendations" in brief_data
        assert "guardrail_notice" in brief_data
