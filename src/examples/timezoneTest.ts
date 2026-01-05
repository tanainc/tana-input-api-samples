import { TanaAPIHelper } from '../TanaAPIClient.js';

const token = process.env.TANA_TOKEN || '';

if (!token) {
  console.log('Please set TANA_TOKEN in your environment');
  process.exit(1);
}

// Test timezone handling in date parsing
const run = async () => {
  const tanaAPIHelper = new TanaAPIHelper(token, 'http://127.0.0.1:5001/emulator/europe-west1/addToNodeV2');

  console.log('Testing date parsing with timezones...');

  // Test 1: Date without timezone (should use server timezone)
  await expectSuccess(() =>
    tanaAPIHelper.createNode({
      name: 'Date without timezone test',
      children: [
        {
          dataType: 'date',
          name: '2024-01-15 15:30',
        },
      ],
    }),
  );
  console.log('✓ Date without timezone created');

  // Test 2: Date with America/Los_Angeles timezone
  await expectSuccess(() =>
    tanaAPIHelper.createNode({
      name: 'LA timezone test',
      children: [
        {
          dataType: 'date',
          name: '2024-01-15 15:30[America/Los_Angeles]',
        },
      ],
    }),
  );
  console.log('✓ Date with America/Los_Angeles timezone created');

  // Test 3: Date with Europe/London timezone
  await expectSuccess(() =>
    tanaAPIHelper.createNode({
      name: 'London timezone test',
      children: [
        {
          dataType: 'date',
          name: '2024-01-15 15:30[Europe/London]',
        },
      ],
    }),
  );
  console.log('✓ Date with Europe/London timezone created');

  // Test 4: Date with UTC timezone
  await expectSuccess(() =>
    tanaAPIHelper.createNode({
      name: 'UTC timezone test',
      children: [
        {
          dataType: 'date',
          name: '2024-01-15 15:30[UTC]',
        },
      ],
    }),
  );
  console.log('✓ Date with UTC timezone created');

  // Test 5: Date range with timezone
  await expectSuccess(() =>
    tanaAPIHelper.createNode({
      name: 'Date range with timezone test',
      children: [
        {
          dataType: 'date',
          name: '2024-01-15 09:00[America/Los_Angeles]/2024-01-15 17:00[America/Los_Angeles]',
        },
      ],
    }),
  );
  console.log('✓ Date range with America/Los_Angeles timezone created');

  // Test 6: Just date (no time) with timezone
  await expectSuccess(() =>
    tanaAPIHelper.createNode({
      name: 'Date only with timezone test',
      children: [
        {
          dataType: 'date',
          name: '2024-01-15[America/Los_Angeles]',
        },
      ],
    }),
  );
  console.log('✓ Date only with America/Los_Angeles timezone created');

  console.log('\nAll timezone tests completed successfully!');
};

async function expectSuccess<T = any>(method: () => Promise<T>): Promise<T> {
  // wait for 1000ms to avoid rate limiting
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return method().then(
    (r) => {
      // Expected success
      return r;
    },
    (e) => {
      console.error('Unexpected failure:', e);
      throw new Error('Expected success', { cause: e });
    },
  );
}

run()
  .then(() => {
    console.log('Timezone test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Timezone test failed:', error);
    process.exit(1);
  });
