import pytest
from main import resolvent, negate, all_resolvents, resolution_level

def test_resolvent_normal_case():
    c1 = {"A", "B"}
    c2 = {"¬A", "B"}
    assert resolvent(c1, c2, "A") == {"B"}

def test_resolvent_other_direction():
    c1 = {"¬A", "B"}
    c2 = {"A", "C"}
    assert resolvent(c1, c2, "A") == {"B", "C"}

def test_resolvent_error():
    c1 = {"A", "B"}
    c2 = {"C", "D"}
    with pytest.raises(ValueError) as e:
        resolvent(c1, c2, "A")
    assert "Literal 'A'" in str(e.value)

def test_negate():
    lit1 = "A"
    lit2 = "¬A"
    assert negate(lit1) == lit2
    assert negate(lit2) == lit1


def test_all_resolvents_none():
    c1 = {"A", "B"}
    c2 = {"C", "D"}
    result = all_resolvents(c1, c2)
    assert result == set()

def test_all_resolvents_single():
    c1 = {"A", "B"}
    c2 = {"¬A", "C"}
    result = all_resolvents(c1, c2)
    expected = {frozenset({"B", "C"})}
    assert result == expected

def test_all_resolvents_multiple():
    c1 = {"A", "B"}
    c2 = {"¬A", "¬B"}
    result = all_resolvents(c1, c2)
    expected = {
        frozenset({"B", "¬B"}),  # Cut über A
        frozenset({"A", "¬A"})   # Cut über B
    }
    assert result == expected

def test_resolutionl_level_1():
    clauses = {
        frozenset({"A", "B"}),
        frozenset({"¬A", "B"}),
        frozenset({"¬B"})
    }
    result = resolution_level(clauses)
    expected = {
        frozenset({"B"}),
        frozenset({"A"}),
        frozenset({"¬A"})
    }
    assert result == expected
"""
def test_resolutionl_level_2():
    clauses = {
        frozenset({"A", "B"}),
        frozenset({"¬A", "B"}),
        frozenset({"¬B"}),
        frozenset({"B"}),
        frozenset({"A"}),
        frozenset({"¬A"})
    }
    result = resolution_level(clauses)
    expected = {frozenset({})}
    assert result == expected
"""