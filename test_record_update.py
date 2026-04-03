#!/usr/bin/env python3
"""
Test script to verify record update functionality
"""
import requests
import json
from datetime import date

BASE_URL = "http://localhost:8000/api/v1"

def test_update():
    print("=" * 60)
    print("Testing Record Update Functionality")
    print("=" * 60)
    
    # Step 1: Login
    print("\n1. Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": "admin@finance.com", "password": "Admin1234"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print(f"✓ Login successful")
    
    # Step 2: Get all records
    print("\n2. Fetching records...")
    records_response = requests.get(
        f"{BASE_URL}/records/?page=1&page_size=5",
        headers=headers
    )
    
    if records_response.status_code != 200:
        print(f"❌ Failed to fetch records: {records_response.text}")
        return
    
    records_data = records_response.json()
    records = records_data.get('data', [])
    
    if not records:
        print("❌ No records found to update")
        return
    
    record = records[0]
    print(f"✓ Found {len(records)} record(s)")
    print(f"  First record ID: {record['id']}")
    print(f"  Current amount: {record['amount']}")
    print(f"  Current category: {record['category']}")
    
    # Step 3: Update the record
    print(f"\n3. Updating record {record['id']}...")
    
    update_payload = {
        "amount": 9999,
        "category": "other",
        "description": "Updated via test script"
    }
    
    print(f"  Payload: {json.dumps(update_payload, indent=2)}")
    
    update_response = requests.patch(
        f"{BASE_URL}/records/{record['id']}",
        json=update_payload,
        headers=headers
    )
    
    print(f"  Status code: {update_response.status_code}")
    
    if update_response.status_code == 200:
        updated_record = update_response.json()
        print(f"✓ Update successful!")
        print(f"  New amount: {updated_record['amount']}")
        print(f"  New category: {updated_record['category']}")
        print(f"  New description: {updated_record['description']}")
        print(f"  Updated at: {updated_record['updated_at']}")
    else:
        print(f"❌ Update failed!")
        print(f"  Response: {update_response.text}")
        return
    
    # Step 4: Verify the update by fetching again
    print(f"\n4. Verifying update...")
    verify_response = requests.get(
        f"{BASE_URL}/records/{record['id']}",
        headers=headers
    )
    
    if verify_response.status_code == 200:
        verified_record = verify_response.json()
        if verified_record['amount'] == 9999 and verified_record['category'] == 'other':
            print(f"✓✓ Update verified! Changes persisted to database!")
        else:
            print(f"❌ Verification failed - data not persisted")
            print(f"  Amount: {verified_record['amount']}")
            print(f"  Category: {verified_record['category']}")
    else:
        print(f"❌ Verification request failed: {verify_response.text}")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    test_update()
