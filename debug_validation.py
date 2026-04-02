#!/usr/bin/env python3
"""
Debug validation errors for RecordUpdate
"""

from datetime import date
from decimal import Decimal
from app.schemas.record import RecordUpdate, RecordCreate

# Test 1: Valid update
print("Test 1: Valid update with all fields")
try:
    data = RecordUpdate(
        amount=Decimal("5000"),
        type="income",
        category="salary",
        date=date(2026, 4, 22),
        description="Test update"
    )
    print(f"✓ Valid: {data}")
except Exception as e:
    print(f"✗ Error: {e}")

# Test 2: Partial update (should be allowed)
print("\nTest 2: Partial update with only amount")
try:
    data = RecordUpdate(
        amount=Decimal("6000")
    )
    print(f"✓ Valid: {data}")
except Exception as e:
    print(f"✗ Error: {e}")

# Test 3: Partial update with date
print("\nTest 3: Partial update with only date")
try:
    data = RecordUpdate(
        date=date(2026, 5, 1)
    )
    print(f"✓ Valid: {data}")
except Exception as e:
    print(f"✗ Error: {e}")

# Test 4: With None description
print("\nTest 4: Update with None description")
try:
    data = RecordUpdate(
        amount=Decimal("7000"),
        description=None
    )
    print(f"✓ Valid: {data}")
except Exception as e:
    print(f"✗ Error: {e}")

# Test 5: model_dump with exclude_unset
print("\nTest 5: model_dump with exclude_unset")
try:
    data = RecordUpdate(
        amount=Decimal("8000")
    )
    dumped = data.model_dump(exclude_unset=True)
    print(f"✓ Valid: {dumped}")
except Exception as e:
    print(f"✗ Error: {e}")

# Test 6: Check what gets sent to API (dict form)
print("\nTest 6: Simulating API payload")
payload = {
    "amount": 5000,
    "type": "income",
    "category": "salary",
    "date": "2026-04-22"
}
try:
    data = RecordUpdate(**payload)
    print(f"✓ Valid: {data}")
    print(f"  Dumped: {data.model_dump(exclude_unset=True)}")
except Exception as e:
    print(f"✗ Error: {e}")

print("\n" + "=" * 60)
print("If all tests pass, the validation is working correctly.")
