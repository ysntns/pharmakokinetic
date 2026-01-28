#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for PharmacoKinetic MVP
Tests all CRUD operations for drugs, medications, dose logs, and progress tracking
"""

import requests
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List
import sys

# Base URL from frontend environment
BASE_URL = os.environ.get("BASE_URL", "https://pharmacokinetic-mvp.preview.emergentagent.com/api")

class PharmacoKineticAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.created_resources = {
            'drugs': [],
            'medications': [],
            'doses': []
        }
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            'test': test_name,
            'status': status,
            'success': success,
            'details': details
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> Dict:
        """Make HTTP request and return response"""
        url = f"{self.base_url}{endpoint}"
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=params)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return {
                'status_code': response.status_code,
                'data': response.json() if response.content else {},
                'success': 200 <= response.status_code < 300
            }
        except requests.exceptions.RequestException as e:
            return {
                'status_code': 0,
                'data': {},
                'success': False,
                'error': str(e)
            }
        except json.JSONDecodeError as e:
            return {
                'status_code': response.status_code,
                'data': {},
                'success': False,
                'error': f"JSON decode error: {str(e)}"
            }

    def test_api_root(self):
        """Test API root endpoint"""
        response = self.make_request('GET', '/')
        success = response['success'] and 'PharmacoKinetic API' in str(response['data'])
        self.log_test("API Root Endpoint", success, 
                     f"Status: {response['status_code']}, Response: {response['data']}")

    def test_drug_endpoints(self):
        """Test all drug-related endpoints"""
        print("\n=== TESTING DRUG ENDPOINTS ===")
        
        # Test GET /drugs (should return seeded drugs)
        response = self.make_request('GET', '/drugs')
        drugs_list = response['data'] if response['success'] else []
        success = response['success'] and isinstance(drugs_list, list)
        self.log_test("GET /drugs - List all drugs", success,
                     f"Status: {response['status_code']}, Count: {len(drugs_list) if success else 0}")
        
        # Test search functionality
        response = self.make_request('GET', '/drugs', params={'search': 'Amoxicillin'})
        success = response['success']
        self.log_test("GET /drugs?search=Amoxicillin - Search drugs", success,
                     f"Status: {response['status_code']}")
        
        # Create a new drug for testing
        new_drug = {
            "name": "Test Ibuprofen",
            "active_ingredient": "Ibuprofen",
            "description": "Test anti-inflammatory medication",
            "dosage_forms": ["tablet", "liquid"],
            "standard_dosages": ["200mg", "400mg", "600mg"],
            "category": "NSAID",
            "side_effects": ["Stomach upset", "Dizziness"],
            "warnings": ["Take with food"]
        }
        
        response = self.make_request('POST', '/drugs', data=new_drug)
        success = response['success']
        created_drug_id = None
        if success and 'id' in response['data']:
            created_drug_id = response['data']['id']
            self.created_resources['drugs'].append(created_drug_id)
        
        self.log_test("POST /drugs - Create new drug", success,
                     f"Status: {response['status_code']}, ID: {created_drug_id}")
        
        # Test GET specific drug
        if created_drug_id:
            response = self.make_request('GET', f'/drugs/{created_drug_id}')
            success = response['success'] and response['data'].get('id') == created_drug_id
            self.log_test("GET /drugs/{id} - Get specific drug", success,
                         f"Status: {response['status_code']}")
            
            # Test PUT drug update
            update_data = {
                "name": "Updated Test Ibuprofen",
                "active_ingredient": "Ibuprofen",
                "description": "Updated test medication",
                "dosage_forms": ["tablet"],
                "standard_dosages": ["200mg", "400mg"],
                "category": "NSAID"
            }
            response = self.make_request('PUT', f'/drugs/{created_drug_id}', data=update_data)
            success = response['success']
            self.log_test("PUT /drugs/{id} - Update drug", success,
                         f"Status: {response['status_code']}")

    def test_medication_endpoints(self):
        """Test medication schedule endpoints"""
        print("\n=== TESTING MEDICATION SCHEDULE ENDPOINTS ===")
        
        # First, get available drugs to use for medication
        drugs_response = self.make_request('GET', '/drugs')
        available_drugs = drugs_response['data'] if drugs_response['success'] else []
        
        if not available_drugs:
            self.log_test("Medication tests - No drugs available", False, "Cannot test without drugs")
            return
        
        # Use first available drug
        test_drug = available_drugs[0]
        
        # Create medication schedule
        start_date = datetime.utcnow()
        medication_data = {
            "drug_id": test_drug['id'],
            "drug_name": test_drug['name'],
            "dosage": "500mg",
            "dosage_form": "tablet",
            "frequency": "twice_daily",
            "times_per_day": 2,
            "specific_times": ["08:00", "20:00"],
            "start_date": start_date.isoformat(),
            "with_food": True,
            "special_instructions": "Take with plenty of water"
        }
        
        response = self.make_request('POST', '/medications', data=medication_data)
        success = response['success']
        created_med_id = None
        if success and 'id' in response['data']:
            created_med_id = response['data']['id']
            self.created_resources['medications'].append(created_med_id)
        
        self.log_test("POST /medications - Create medication schedule", success,
                     f"Status: {response['status_code']}, ID: {created_med_id}")
        
        # Test GET all medications
        response = self.make_request('GET', '/medications')
        success = response['success'] and isinstance(response['data'], list)
        self.log_test("GET /medications - List all medications", success,
                     f"Status: {response['status_code']}")
        
        # Test GET active medications only
        response = self.make_request('GET', '/medications', params={'active_only': 'true'})
        success = response['success']
        self.log_test("GET /medications?active_only=true - Filter active medications", success,
                     f"Status: {response['status_code']}")
        
        # Test GET specific medication
        if created_med_id:
            response = self.make_request('GET', f'/medications/{created_med_id}')
            success = response['success'] and response['data'].get('id') == created_med_id
            self.log_test("GET /medications/{id} - Get specific medication", success,
                         f"Status: {response['status_code']}")
            
            # Test PUT medication update
            update_data = {
                "active": False,
                "special_instructions": "Updated instructions - discontinued"
            }
            response = self.make_request('PUT', f'/medications/{created_med_id}', data=update_data)
            success = response['success']
            self.log_test("PUT /medications/{id} - Update medication", success,
                         f"Status: {response['status_code']}")

    def test_dose_log_endpoints(self):
        """Test dose log endpoints"""
        print("\n=== TESTING DOSE LOG ENDPOINTS ===")
        
        # Get medications to work with dose logs
        meds_response = self.make_request('GET', '/medications')
        medications = meds_response['data'] if meds_response['success'] else []
        
        # Test GET all dose logs
        response = self.make_request('GET', '/doses')
        success = response['success'] and isinstance(response['data'], list)
        dose_logs = response['data'] if success else []
        self.log_test("GET /doses - List all dose logs", success,
                     f"Status: {response['status_code']}, Count: {len(dose_logs)}")
        
        # Test filtering by status
        response = self.make_request('GET', '/doses', params={'status': 'scheduled'})
        success = response['success']
        self.log_test("GET /doses?status=scheduled - Filter by status", success,
                     f"Status: {response['status_code']}")
        
        # If we have medications, test filtering by medication_id
        if medications:
            med_id = medications[0]['id']
            response = self.make_request('GET', '/doses', params={'medication_id': med_id})
            success = response['success']
            self.log_test("GET /doses?medication_id={id} - Filter by medication", success,
                         f"Status: {response['status_code']}")
        
        # Test creating a manual dose log
        if medications:
            med = medications[0]
            dose_data = {
                "medication_id": med['id'],
                "drug_name": med['drug_name'],
                "dosage": med['dosage'],
                "scheduled_time": datetime.utcnow().isoformat(),
                "status": "scheduled"
            }
            
            response = self.make_request('POST', '/doses', data=dose_data)
            success = response['success']
            created_dose_id = None
            if success and 'id' in response['data']:
                created_dose_id = response['data']['id']
                self.created_resources['doses'].append(created_dose_id)
            
            self.log_test("POST /doses - Create dose log", success,
                         f"Status: {response['status_code']}, ID: {created_dose_id}")
            
            # Test marking dose as taken (quick action)
            if created_dose_id:
                response = self.make_request('POST', f'/doses/{created_dose_id}/take')
                success = response['success']
                self.log_test("POST /doses/{id}/take - Mark dose as taken", success,
                             f"Status: {response['status_code']}")
        
        # Test updating a dose log
        if dose_logs:
            dose_id = dose_logs[0]['id']
            update_data = {
                "status": "taken",
                "actual_time": datetime.utcnow().isoformat(),
                "notes": "Taken with breakfast"
            }
            
            response = self.make_request('PUT', f'/doses/{dose_id}', data=update_data)
            success = response['success']
            self.log_test("PUT /doses/{id} - Update dose log", success,
                         f"Status: {response['status_code']}")

    def test_progress_endpoints(self):
        """Test progress tracking endpoints"""
        print("\n=== TESTING PROGRESS TRACKING ENDPOINTS ===")
        
        # Test 7-day progress
        response = self.make_request('GET', '/progress', params={'days': 7})
        success = response['success']
        if success:
            data = response['data']
            has_stats = 'stats' in data and 'daily_adherence' in data
            success = success and has_stats
        
        self.log_test("GET /progress?days=7 - Get 7-day progress", success,
                     f"Status: {response['status_code']}")
        
        # Test 30-day progress
        response = self.make_request('GET', '/progress', params={'days': 30})
        success = response['success']
        if success:
            data = response['data']
            has_required_fields = all(key in data.get('stats', {}) for key in 
                                    ['adherence_rate', 'current_streak', 'total_doses_scheduled'])
            success = success and has_required_fields
        
        self.log_test("GET /progress?days=30 - Get 30-day progress", success,
                     f"Status: {response['status_code']}")

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("\n=== TESTING ERROR HANDLING ===")
        
        # Test getting non-existent drug
        response = self.make_request('GET', '/drugs/nonexistent-id')
        success = response['status_code'] == 404
        self.log_test("GET /drugs/{invalid_id} - 404 for non-existent drug", success,
                     f"Status: {response['status_code']}")
        
        # Test creating drug with invalid data
        invalid_drug = {"name": ""}  # Missing required fields
        response = self.make_request('POST', '/drugs', data=invalid_drug)
        success = response['status_code'] >= 400
        self.log_test("POST /drugs with invalid data - Error handling", success,
                     f"Status: {response['status_code']}")
        
        # Test getting non-existent medication
        response = self.make_request('GET', '/medications/nonexistent-id')
        success = response['status_code'] == 404
        self.log_test("GET /medications/{invalid_id} - 404 for non-existent medication", success,
                     f"Status: {response['status_code']}")

    def cleanup_test_data(self):
        """Clean up created test data"""
        print("\n=== CLEANING UP TEST DATA ===")
        
        # Delete created doses
        for dose_id in self.created_resources['doses']:
            response = self.make_request('DELETE', f'/doses/{dose_id}')
            # Note: DELETE endpoint might not exist for doses
        
        # Delete created medications
        for med_id in self.created_resources['medications']:
            response = self.make_request('DELETE', f'/medications/{med_id}')
            success = response['success']
            self.log_test(f"Cleanup - Delete medication {med_id}", success,
                         f"Status: {response['status_code']}")
        
        # Delete created drugs
        for drug_id in self.created_resources['drugs']:
            response = self.make_request('DELETE', f'/drugs/{drug_id}')
            success = response['success']
            self.log_test(f"Cleanup - Delete drug {drug_id}", success,
                         f"Status: {response['status_code']}")

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🧪 Starting PharmacoKinetic API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        try:
            # Core API tests
            self.test_api_root()
            self.test_drug_endpoints()
            self.test_medication_endpoints()
            self.test_dose_log_endpoints()
            self.test_progress_endpoints()
            self.test_error_handling()
            
        finally:
            # Always try to cleanup
            self.cleanup_test_data()
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests > 0:
            print("\n🚨 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}")
                    if result['details']:
                        print(f"     {result['details']}")
        
        print("\n" + "=" * 60)
        return failed_tests == 0


if __name__ == "__main__":
    tester = PharmacoKineticAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)