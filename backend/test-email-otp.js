/**
 * Email OTP Authentication Test Script
 * Tests the passwordless email authentication flow
 */

const BASE_URL = 'http://localhost:8080/api/auth';

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(50)}\n${msg}\n${'='.repeat(50)}${colors.reset}`)
};

// Prompt for user input
const prompt = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => prompt.question(query, resolve));

/**
 * Test 1: Request OTP for new user
 */
async function testRequestOTP(email) {
  log.section('TEST 1: Request Email OTP');
  
  try {
    const response = await fetch(`${BASE_URL}/email/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (data.success) {
      log.success('OTP sent successfully!');
      log.info(`Email: ${data.data.email}`);
      log.info(`New User: ${data.data.isNewUser}`);
      log.info(`Expires In: ${data.data.expiresIn} seconds`);
      return { success: true, data };
    } else {
      log.error(`Failed: ${data.message}`);
      return { success: false, error: data.message };
    }
  } catch (error) {
    log.error(`Network error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test 2: Verify OTP
 */
async function testVerifyOTP(email, otp, name = null) {
  log.section('TEST 2: Verify Email OTP');
  
  try {
    const body = { email, otp };
    if (name) body.name = name;

    const response = await fetch(`${BASE_URL}/email/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.success) {
      log.success('OTP verified successfully!');
      log.info(`User: ${data.data.user.name} (${data.data.user.email})`);
      log.info(`Role: ${data.data.user.role}`);
      log.info(`Token: ${data.data.token.substring(0, 20)}...`);
      return { success: true, data };
    } else {
      log.error(`Failed: ${data.message}`);
      if (data.attemptsRemaining !== undefined) {
        log.warning(`Attempts Remaining: ${data.attemptsRemaining}`);
      }
      return { success: false, error: data.message };
    }
  } catch (error) {
    log.error(`Network error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test 3: Rate limiting (multiple requests)
 */
async function testRateLimiting(email) {
  log.section('TEST 3: Rate Limiting');
  
  log.info('Sending 4 OTP requests rapidly...');
  
  for (let i = 1; i <= 4; i++) {
    const response = await fetch(`${BASE_URL}/email/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (i <= 3) {
      if (data.success) {
        log.success(`Request ${i}: OTP sent`);
      } else {
        log.error(`Request ${i}: ${data.message}`);
      }
    } else {
      // 4th request should be rate limited
      if (!data.success && response.status === 429) {
        log.success('Rate limiting working! 4th request blocked');
        log.info(`Message: ${data.message}`);
      } else {
        log.warning('Rate limiting may not be working correctly');
      }
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

/**
 * Test 4: Invalid OTP attempts
 */
async function testInvalidOTP(email) {
  log.section('TEST 4: Invalid OTP Handling');
  
  // First request OTP
  log.info('Requesting OTP first...');
  await testRequestOTP(email);
  
  log.info('Testing with wrong OTP codes...');
  
  for (let i = 1; i <= 3; i++) {
    const wrongOTP = '000000'; // Wrong OTP
    
    const response = await fetch(`${BASE_URL}/email/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp: wrongOTP })
    });

    const data = await response.json();

    if (!data.success) {
      log.info(`Attempt ${i}: ${data.message}`);
      if (data.attemptsRemaining !== undefined) {
        log.warning(`Attempts remaining: ${data.attemptsRemaining}`);
      }
    }
  }

  log.info('Testing 4th attempt (should be blocked)...');
  const response = await fetch(`${BASE_URL}/email/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, otp: '000000' })
  });

  const data = await response.json();
  
  if (!data.success && data.message.includes('request a new')) {
    log.success('Max attempts protection working!');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.clear();
  log.section('📧 EMAIL OTP AUTHENTICATION TESTER');
  
  log.info('This script will test the Email OTP authentication flow');
  log.info('Make sure your backend server is running on http://localhost:8080\n');

  const testEmail = await question('Enter test email address: ');
  
  if (!testEmail || !testEmail.includes('@')) {
    log.error('Invalid email address');
    prompt.close();
    return;
  }

  console.log('\n');

  // Test 1: Request OTP
  const otpRequest = await testRequestOTP(testEmail);
  
  if (!otpRequest.success) {
    log.error('Cannot continue tests without successful OTP request');
    prompt.close();
    return;
  }

  // Get OTP from console or user input
  log.warning('\n⚠️  Check your email or server console for the OTP code!');
  log.info('In development mode, the OTP is printed to the server console\n');
  
  const otpCode = await question('Enter the OTP code (6 digits): ');
  
  if (!/^\d{6}$/.test(otpCode)) {
    log.error('Invalid OTP format (must be 6 digits)');
    prompt.close();
    return;
  }

  let userName = null;
  if (otpRequest.data.data.isNewUser) {
    userName = await question('Enter your name (new user): ');
  }

  // Test 2: Verify OTP
  await testVerifyOTP(testEmail, otpCode, userName);

  // Ask if user wants to run additional tests
  const runMore = await question('\nRun additional tests? (rate limit & invalid OTP) [y/n]: ');
  
  if (runMore.toLowerCase() === 'y') {
    const testEmail2 = await question('Enter another test email for rate limit test: ');
    
    if (testEmail2 && testEmail2.includes('@')) {
      await testRateLimiting(testEmail2);
      
      const testEmail3 = await question('Enter another test email for invalid OTP test: ');
      if (testEmail3 && testEmail3.includes('@')) {
        await testInvalidOTP(testEmail3);
      }
    }
  }

  log.section('✨ Testing Complete!');
  log.info('Check the results above for any issues\n');
  
  prompt.close();
}

// Run tests
runTests().catch(error => {
  log.error(`Fatal error: ${error.message}`);
  prompt.close();
});
