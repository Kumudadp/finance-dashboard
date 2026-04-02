#!/usr/bin/env python3
"""
Test script to verify update functionality for records and users.
Run this after starting the backend server.
"""

import requests
import json
from decimal import Decimal

BASE_URL = "http://localhost:8000/api/v1"

# Admin credentials
ADMIN_EMAIL = "admin@finance.com"
ADMIN_PASSWORD = "Admin1234"

def login():
    """Login and get access token."""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return None
    token = response.json()["access_token"]
    print(f"✓ Login successful. Token: {token[:20]}...")
    return token

def get_headers(token):
    """Create authorization headers."""
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

def test_create_record(token):
    """Create a test financial record."""
    print("\n--- Testing Record Creation ---")
    headers = get_headers(token)
    payload = {
        "amount": 50000,
        "type": "income",
        "category": "salary",
        "date": "2026-04-02",
        "description": "Monthly salary - Test"
    }
    
    response = requests.post(
        f"{BASE_URL}/records/",
        json=payload,
        headers=headers
    )
    
    if response.status_code == 201:
        record = response.json()
        print(f"✓ Record created successfully")
        print(f"  ID: {record['id']}")
        print(f"  Amount: {record['amount']}")
        print(f"  Description: {record['description']}")
        return record['id']
    else:
        print(f"❌ Failed to create record: {response.text}")
        return None

def test_update_record(token, record_id):
    """Test updating a financial record."""
    print("\n--- Testing Record Update ---")
    headers = get_headers(token)
    
    # Update with new values
    update_payload = {
        "amount": 55000,
        "category": "investment",
        "description": "Monthly salary - Updated Test"
    }
    
    response = requests.patch(
        f"{BASE_URL}/records/{record_id}",
        json=update_payload,
        headers=headers
    )
    
    if response.status_code == 200:
        updated_record = response.json()
        print(f"✓ Record updated successfully")
        print(f"  New Amount: {updated_record['amount']}")
        print(f"  New Category: {updated_record['category']}")
        print(f"  New Description: {updated_record['description']}")
        print(f"  Updated At: {updated_record['updated_at']}")
        return True
    else:
        print(f"❌ Failed to update record: {response.text}")
        return False

def test_get_record(token, record_id):
    """Fetch and verify the updated record."""
    print("\n--- Verifying Updated Record ---")
    headers = get_headers(token)
    
    response = requests.get(
        f"{BASE_URL}/records/{record_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        record = response.json()
        print(f"✓ Record retrieved successfully")
        print(f"  Amount: {record['amount']}")
        print(f"  Category: {record['category']}")
        print(f"  Description: {record['description']}")
        
        # Verify values were actually updated
        assert str(record['amount']) == "55000", "Amount not updated!"
        assert record['category'] == "investment", "Category not updated!"
        assert "Updated" in record['description'], "Description not updated!"
        print(f"✓✓ All values verified!")
        return True
    else:
        print(f"❌ Failed to get record: {response.text}")
        return False

def test_list_records(token):
    """List all records."""
    print("\n--- Listing Records ---")
    headers = get_headers(token)
    
    response = requests.get(
        f"{BASE_URL}/records/?page=1&page_size=10",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Retrieved {len(data['data'])} records")
        print(f"  Total: {data['total']}")
        return True
    else:
        print(f"❌ Failed to list records: {response.text}")
        return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("Financial Dashboard - Update Functionality Tests")
    print("=" * 60)
    
    # Login
    token = login()
    if not token:
        return
    
    # Test create
    record_id = test_create_record(token)
    if not record_id:
        return
    
    # Test update
    if not test_update_record(token, record_id):
        return
    
    # Verify update
    if not test_get_record(token, record_id):
        return
    
    # List records
    test_list_records(token)
    
    print("\n" + "=" * 60)
    print("✓✓✓ All tests passed! Update functionality is working.")
    print("=" * 60)

if __name__ == "__main__":
    main()
