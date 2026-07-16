from agents.wasdal_agents import WasdalAgentGraph


def test_intake_agent_graph_returns_structured_recommendation():
    graph = WasdalAgentGraph()
    result = graph.run_intake(
        "Ratusan warga melaporkan jalan pasar rusak berat, viral di media lokal, dan perlu tindak lanjut segera.",
        source="WhatsApp",
    )

    assert result["category"] == "Infrastruktur"
    assert result["priority"] in {"High", "Critical"}
    assert result["suggested_agency"] == "Dinas PUPR"
    assert result["recommendations"]


def test_meeting_agent_generates_action_items():
    graph = WasdalAgentGraph()
    result = graph.run_meeting(
        "Rapat Wasdal",
        "Diputuskan perbaikan darurat jalan pasar. Tindak lanjut PIC: Dinas PUPR, Deadline: H+3.",
    )

    assert result["decisions"]
    assert result["action_items"]
    assert "Notulen" in result["minutes"]
