import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export async function waitForEnter(term: string = 'Hit <enter> to continue'): Promise<string> {
  console.log('\n\n');
  return new Promise<string>((resolve) => {
    rl.question(term, (answer) => {
      console.log('\n\n');

      // waits for 1sec
      setTimeout(() => {
        resolve(answer);
      }, 1000);
    });
  });
}
