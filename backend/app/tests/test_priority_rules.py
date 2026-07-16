from shared.wasdal_domain import compute_priority_score, priority_from_score


def test_priority_score_reaches_high_for_risky_public_case():
    score = compute_priority_score(
        {
            "citizen_count": 300,
            "risk": 5,
            "urgency": 5,
            "media_exposure": 3,
            "recurrence": 2,
            "economic_impact": 5,
            "legal_status": 1,
        }
    )

    assert score >= 70
    assert priority_from_score(score) in {"High", "Critical"}


def test_low_signal_case_stays_low():
    score = compute_priority_score({"citizen_count": 1})

    assert score < 35
    assert priority_from_score(score) == "Low"
