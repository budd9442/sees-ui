import { notifyUser } from '../lib/notifications/notification-service';
import { NotificationEventKey } from '../lib/notifications/events';

async function test() {
    console.log('--- Testing Notification Service ---');
    
    const testUserId = 'fdd458a5-efdd-4565-957a-ebbdbcc09e3c'; // Admin User ID from logs
    
    console.log(`Target User: ${testUserId}`);
    
    // Test 1: Simple Notification
    console.log('\n[Test 1] Sending simple system alert...');
    await notifyUser({
        userId: testUserId,
        eventKey: NotificationEventKey.SYSTEM_ALERT,
        title: 'System Maintenance',
        content: 'The system will be down for maintenance at 12:00 AM tonight.',
        data: {
            alertTitle: 'Maintenance Notice',
            alertBody: 'Full system lockdown for 2 hours.'
        }
    });
    
    // Test 2: Grade Release (with placeholders if a template exists)
    console.log('\n[Test 2] Sending grade release notification...');
    await notifyUser({
        userId: testUserId,
        eventKey: NotificationEventKey.GRADE_RELEASED,
        title: 'Grades Released: CS101',
        content: 'Your results for Introduction to Computer Science are now available.',
        data: {
            studentName: 'Admin',
            moduleName: 'Introduction to Computer Science',
            moduleCode: 'CS101',
            letterGrade: 'A'
        }
    });
    
    console.log('\n--- Done. Please check the DB or Dashboard ---');
}

test().catch(console.error);
