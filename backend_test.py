import requests
import sys
from datetime import datetime, date
import json

class AttendanceAPITester:
    def __init__(self, base_url="https://work-presence-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = "test_session_1765263219733"  # From test user creation
        self.user_id = "test-user-1765263219733"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        # Add auth header
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json() if response.text else {}
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:300]}")

            self.test_results.append({
                "name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response": response.text[:200] if response.text else ""
            })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": "ERROR",
                "success": False,
                "error": str(e)
            })
            return False, {}

    def test_auth_me(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User (/api/auth/me)",
            "GET",
            "api/auth/me",
            200
        )
        return success, response

    def test_get_users(self):
        """Test getting all users"""
        success, response = self.run_test(
            "Get All Users (/api/users)",
            "GET", 
            "api/users",
            200
        )
        return success, response

    def test_get_attendances(self):
        """Test getting attendances"""
        success, response = self.run_test(
            "Get Attendances (/api/attendances)",
            "GET",
            "api/attendances",
            200
        )
        return success, response

    def test_get_attendances_with_filter(self):
        """Test getting attendances with year/month filter"""
        current_year = datetime.now().year
        current_month = datetime.now().month
        success, response = self.run_test(
            f"Get Attendances Filtered (/api/attendances?year={current_year}&month={current_month})",
            "GET",
            f"api/attendances?year={current_year}&month={current_month}",
            200
        )
        return success, response

    def test_create_attendance(self):
        """Test creating attendance"""
        today = date.today().isoformat()
        attendance_data = {
            "date": today,
            "status": "present",
            "notes": "Test attendance from backend test"
        }
        
        success, response = self.run_test(
            "Create Attendance (/api/attendances)",
            "POST",
            "api/attendances",
            200,
            data=attendance_data
        )
        return success, response

    def test_update_attendance(self, attendance_id):
        """Test updating attendance"""
        update_data = {
            "status": "remote",
            "notes": "Updated from backend test"
        }
        
        success, response = self.run_test(
            f"Update Attendance (/api/attendances/{attendance_id})",
            "PUT",
            f"api/attendances/{attendance_id}",
            200,
            data=update_data
        )
        return success, response

    def test_delete_attendance(self, attendance_id):
        """Test deleting attendance"""
        success, response = self.run_test(
            f"Delete Attendance (/api/attendances/{attendance_id})",
            "DELETE",
            f"api/attendances/{attendance_id}",
            200
        )
        return success, response

    def test_logout(self):
        """Test logout"""
        success, response = self.run_test(
            "Logout (/api/auth/logout)",
            "POST",
            "api/auth/logout",
            200
        )
        return success, response

    # Admin endpoints tests
    def test_admin_stats(self):
        """Test admin stats endpoint"""
        success, response = self.run_test(
            "Admin Stats (/api/admin/stats)",
            "GET",
            "api/admin/stats",
            200
        )
        return success, response

    def test_admin_clear_old_sessions(self):
        """Test admin clear old sessions"""
        success, response = self.run_test(
            "Admin Clear Old Sessions (/api/admin/clear-old-sessions)",
            "POST",
            "api/admin/clear-old-sessions",
            200
        )
        return success, response

    def test_admin_delete_attendance(self, attendance_id):
        """Test admin delete attendance"""
        success, response = self.run_test(
            f"Admin Delete Attendance (/api/admin/attendances/{attendance_id})",
            "DELETE",
            f"api/admin/attendances/{attendance_id}",
            200
        )
        return success, response

    def test_admin_delete_user_unauthorized(self, user_id):
        """Test admin delete user (should fail for non-admin)"""
        success, response = self.run_test(
            f"Admin Delete User - Unauthorized (/api/admin/users/{user_id})",
            "DELETE",
            f"api/admin/users/{user_id}",
            403  # Should fail with 403 for non-admin users
        )
        return success, response

    def test_non_admin_access_to_admin_endpoints(self):
        """Test that non-admin users cannot access admin endpoints"""
        print("\n🔒 Testing admin endpoint security for non-admin users...")
        
        # Test admin stats (should fail)
        success, _ = self.run_test(
            "Non-Admin Access to Stats (should fail)",
            "GET",
            "api/admin/stats",
            403
        )
        
        return success

def main():
    print("🚀 Starting Greek Office Attendance Calendar API Tests")
    print("=" * 60)
    
    tester = AttendanceAPITester()
    
    # Test authentication
    print("\n📋 AUTHENTICATION TESTS")
    print("-" * 30)
    auth_success, user_data = tester.test_auth_me()
    if not auth_success:
        print("❌ Authentication failed, stopping tests")
        return 1

    # Test users endpoint
    print("\n👥 USERS TESTS")
    print("-" * 30)
    users_success, users_data = tester.test_get_users()

    # Test attendances endpoints
    print("\n📅 ATTENDANCES TESTS")
    print("-" * 30)
    
    # Get attendances (empty initially)
    tester.test_get_attendances()
    tester.test_get_attendances_with_filter()
    
    # Create attendance
    create_success, attendance_data = tester.test_create_attendance()
    attendance_id = None
    if create_success and 'attendance_id' in attendance_data:
        attendance_id = attendance_data['attendance_id']
        print(f"   Created attendance ID: {attendance_id}")
    
    # Update attendance if created successfully
    if attendance_id:
        tester.test_update_attendance(attendance_id)
        
        # Get attendances again to verify update
        tester.test_get_attendances()
        
        # Delete attendance
        tester.test_delete_attendance(attendance_id)
        
        # Verify deletion
        tester.test_get_attendances()

    # Test admin endpoints (if user is admin)
    print("\n🔐 ADMIN ENDPOINTS TESTS")
    print("-" * 30)
    
    # Check if current user is admin
    if user_data and user_data.get('is_admin'):
        print("✅ Current user is admin, testing admin endpoints...")
        
        # Test admin stats
        tester.test_admin_stats()
        
        # Test clear old sessions
        tester.test_admin_clear_old_sessions()
        
        # Test admin delete attendance (if we have an attendance)
        if attendance_id:
            # Create a new attendance for admin deletion test
            create_success, admin_att_data = tester.test_create_attendance()
            if create_success and 'attendance_id' in admin_att_data:
                admin_att_id = admin_att_data['attendance_id']
                tester.test_admin_delete_attendance(admin_att_id)
    else:
        print("ℹ️  Current user is not admin, testing security restrictions...")
        # Test that non-admin cannot access admin endpoints
        tester.test_non_admin_access_to_admin_endpoints()

    # Test logout (optional - will invalidate session)
    print("\n🚪 LOGOUT TEST")
    print("-" * 30)
    # tester.test_logout()  # Commented out to keep session for frontend tests

    # Print final results
    print(f"\n📊 FINAL RESULTS")
    print("=" * 60)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"Success rate: {success_rate:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        
        # Print failed tests
        failed_tests = [t for t in tester.test_results if not t['success']]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test['name']}: Expected {test['expected_status']}, got {test.get('actual_status', 'ERROR')}")
        
        return 1

if __name__ == "__main__":
    sys.exit(main())