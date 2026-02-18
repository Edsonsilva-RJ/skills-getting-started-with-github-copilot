import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_list_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_signup_and_unregister():
    # Use a test activity and email
    activity = next(iter(client.get("/activities").json().keys()))
    email = "testuser@mergington.edu"

    # Sign up
    signup = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert signup.status_code == 200
    assert f"Signed up {email}" in signup.json().get("message", "")

    # Try duplicate signup
    dup = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert dup.status_code == 400

    # Unregister
    unregister = client.post(f"/activities/{activity}/unregister", params={"email": email})
    assert unregister.status_code == 200
    assert f"Unregistered {email}" in unregister.json().get("message", "")

    # Unregister again (should fail)
    unregister2 = client.post(f"/activities/{activity}/unregister", params={"email": email})
    assert unregister2.status_code == 400
