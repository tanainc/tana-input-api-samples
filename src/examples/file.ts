import { TanaAPIHelper } from '../TanaAPIClient';
import { waitForEnter } from '../utils';

const token = process.env.TANA_TOKEN || '';

if (!token) {
  console.log('Please set TANA_TOKEN in your environment');
  process.exit(1);
}

// read a file name from the command line
const fileName = process.argv[2];

if (!fileName) {
  console.log('Please provide a file name');
  process.exit(1);
}

const run = async () => {
  // Create new api client with your token and workspace id
  const tanaAPIHelper = new TanaAPIHelper(token);

  await waitForEnter('Hit enter to upload: ' + fileName);

  await tanaAPIHelper.sendfile(fileName);

  console.log('File saved');
};
run().then(() => process.exit(0));
