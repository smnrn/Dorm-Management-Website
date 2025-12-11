#### ✅ Test Case Documentation

**Sample Test Cases**:

| # | Test Description | Steps | Expected Result | Actual Result | Status |
|---|------------------|-------|-----------------|---------------|--------|
| 1 | Login with valid credentials | 1. Enter username<br>2. Enter password<br>3. Click "Login" | User logged in successfully, redirected to dashboard | ✅ Redirected to dashboard | Pass ✅ |
| 2 | Register visitor (12-hour notice) | 1. Fill visitor form<br>2. Select date tomorrow<br>3. Submit | Success message, visitor created | ✅ Visitor created | Pass ✅ |
| 3 | Register visitor (violation) | 1. Fill visitor form<br>2. Select date today<br>3. Submit | Error: "12-hour notice required" | ✅ Error shown | Pass ✅ |
| 4 | Approve visitor | 1. View pending visitors<br>2. Click "Approve"<br>3. Confirm | Visitor status = 'Approved', email sent | ✅ Email received | Pass ✅ |
| 5 | Check-in visitor | 1. View approved visitors<br>2. Click "Check In"<br>3. Enter ID type | Visitor moved to "Currently Inside" | ✅ Moved to active | Pass ✅ |
| 6 | Check-out visitor | 1. View active visitors<br>2. Click "Check Out"<br>3. Confirm | Visitor removed, check_out_time recorded | ✅ Checked out | Pass ✅ |
| 7 | Change password (valid) | 1. Enter current password<br>2. Enter new password<br>3. Confirm<br>4. Submit | Password updated, can login with new password | ✅ Login works | Pass ✅ |
| 8 | Change password (reuse) | 1. Enter current password<br>2. Enter same password<br>3. Submit | Error: "Cannot reuse old password" | ✅ Error shown | Pass ✅ |
| 9 | Upload profile image | 1. Click "Upload"<br>2. Auth Google<br>3. Select image | Image uploaded, Drive URL stored | ✅ Image displays | Pass ✅ |
| 10 | Real-time sync | 1. Open 2 browsers<br>2. Admin approves visitor<br>3. Wait 5 sec | Help Desk sees update automatically | ✅ Auto-refreshed | Pass ✅ |
| 11 | Empty form validation | 1. Leave form empty<br>2. Click submit | Error: "All fields required" | ✅ Error shown | Pass ✅ |
| 12 | Email notification | 1. Approve visitor<br>2. Check tenant email | Approval email received with details | ✅ Email received | Pass ✅ |
| 13 | Notification badge | 1. Visitor approved<br>2. Tenant logs in | Badge shows count of new notifications | ✅ Badge appears | Pass ✅ |
| 14 | Search functionality | 1. Enter visitor name<br>2. Search | Filtered results shown | ✅ Correct results | Pass ✅ |
| 15 | Responsive design | 1. Resize browser<br>2. Test mobile view | Layout adapts to screen size | ✅ Responsive | Pass ✅ |

**Test Results**: 15/15 tests passed (100% pass rate) ✅
