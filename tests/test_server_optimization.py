import pytest
from unittest.mock import MagicMock, AsyncMock, patch
import os
import sys
from fastapi import UploadFile

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Set dummy env vars for import
os.environ['MONGO_URL'] = 'mongodb://localhost:27017'
os.environ['DB_NAME'] = 'test_db'
os.environ['ANTHROPIC_API_KEY'] = 'dummy_key'

# Mocking motor before importing server to prevent connection attempts
# We need to make sure we mock it in a way that allows import
sys.modules['motor'] = MagicMock()
sys.modules['motor.motor_asyncio'] = MagicMock()

# Now import server
from backend import server

@pytest.mark.asyncio
async def test_analyze_drug_image_uses_async_client():
    # Setup mocks
    mock_file = MagicMock(spec=UploadFile)
    mock_file.read = AsyncMock(return_value=b"fake_image_data")
    mock_file.content_type = "image/jpeg"

    mock_user = {"id": "user123"}

    # We need to patch anthropic.Anthropic and anthropic.AsyncAnthropic
    # Since we want to verify that AsyncAnthropic is used, we'll assert on that.

    with patch('anthropic.Anthropic') as MockSyncAnthropic, \
         patch('anthropic.AsyncAnthropic') as MockAsyncAnthropic:

        # Configure Sync Mock
        mock_sync_instance = MockSyncAnthropic.return_value
        mock_sync_instance.messages.create.return_value.content = [MagicMock(text='{"name": "test"}')]

        # Configure Async Mock
        mock_async_instance = MockAsyncAnthropic.return_value
        mock_async_instance.messages.create = AsyncMock()
        mock_async_instance.messages.create.return_value.content = [MagicMock(text='{"name": "test"}')]

        # Call the function
        # Since we are testing server.analyze_drug_image, we call it directly.
        # Note: We need to ensure 'anthropic' used inside server is the patched one.
        # patch('anthropic.Anthropic') patches 'anthropic.Anthropic' where 'anthropic' is the module.
        # server.py does 'import anthropic', so it uses 'anthropic.Anthropic'.
        # This should work.

        print("Calling analyze_drug_image...")
        try:
            result = await server.analyze_drug_image(file=mock_file, current_user=mock_user)
        except Exception as e:
            # If it uses sync client which is a mock returning a value, it might fail on property access if we didn't mock enough
            # or if it returns a non-awaitable when code expects awaitable (after fix).
            # But here we are BEFORE fix.
            # Before fix:
            # client = anthropic.Anthropic() -> returns mock_sync_instance
            # client.messages.create() -> returns MagicMock object
            # response_text = message.content[0].text
            pass


        # Assertions for OPTIMIZED code (Expectation)
        # We want this test to PASS after optimization.
        # So right now it should FAIL.

        if MockSyncAnthropic.call_count > 0:
             pytest.fail("Synchronous Anthropic client was instantiated! The code is still blocking.")

        assert MockAsyncAnthropic.call_count == 1, "Async Anthropic client was NOT instantiated!"
        assert mock_async_instance.messages.create.call_count == 1, "Async create() was not called"
