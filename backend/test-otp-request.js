// Quick test script for Email OTP endpoint

async function testEmailOTP() {
  console.log('Testing Email OTP Request...\n');
  
  try {
    const response = await fetch('http://localhost:8080/api/auth/email/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mesinajake9@gmail.com' })
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ SUCCESS! Check your email inbox (and spam folder) for the OTP!');
    } else {
      console.log('\n❌ Error occurred');
    }
  } catch (error) {
    console.error('Request failed:', error.message);
    console.log('\n⚠️ Make sure the server is running on port 8080');
  }
}

testEmailOTP();
