// Test login functionality
async function testLogin() {
  try {
    // Test login with alice@university.edu
    const response = await fetch('http://localhost:3003/api/test-auth', {
      method: 'GET',
      headers: {
        'Cookie': 'auth-storage=' + encodeURIComponent(JSON.stringify({
          state: {
            user: {
              id: 'STU0000',
              email: 'alice@university.edu',
              firstName: 'Alice',
              lastName: 'Johnson',
              role: 'student',
              isActive: true,
              studentId: 'STU0000',
              academicYear: 'L2',
              degreeProgram: 'MIT',
              specialization: 'BSE',
              currentGPA: 3.65,
              totalCredits: 65,
              academicClass: 'Second Class Upper',
              pathwayLocked: true,
              enrollmentDate: '2023-09-01',
              enrollmentStatus: 'enrolled'
            },
            isAuthenticated: true
          },
          version: 0
        }))
      }
    });

    const data = await response.json();
    console.log('Test Auth Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();