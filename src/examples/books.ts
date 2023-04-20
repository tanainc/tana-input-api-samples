import * as readline from 'readline';
import { TanaAPIHelper } from '../TanaAPIClient';

const readlineX = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function prompt(term: string = 'Hit <enter> to continue'): Promise<string> {
  console.log('\n\n');
  return new Promise<string>((resolve) => {
    readlineX.question(term, (answer) => {
      console.log('\n\n');
      resolve(answer);
    });
  });
}

const token = process.env.TANA_TOKEN || '';

if (!token) {
  console.log('Please set TANA_TOKEN in your environment');
  process.exit(1);
}

console.log('----------------------------------------');
console.log('This script will create a tag called "Book"');
console.log('It will then create a few books with that tag');
console.log('');
console.log('You must hit enter between each call to the API');
console.log('The rate limit is one call per second');
console.log('----------------------------------------');

const run = async () => {
  // Create new api client with your token and workspace id
  const tanaAPIHelper = new TanaAPIHelper(token);

  await prompt('Hit enter to create a few fields');

  // Create some fields for our book tag
  const fields = await tanaAPIHelper.createFields([
    {
      name: 'Author',
      description: 'Who wrote the book',
    },
    {
      name: 'My rating',
      description: 'How I rated the book',
    },
  ]);

  console.log(fields);
  await prompt('Fields created, hit enter to create tag');
  // create the book tag itself, using the fields we just created
  const tagId = await tanaAPIHelper.createTag('Book', 'I use this to track books I read', fields);

  if (!tagId) {
    console.log('tagId is undefined, something went wrong creating the tag');
    return;
  }

  console.log('tagId', tagId);
  await prompt('Tag created, hit enter to create the first book');
  // get references to the fields we created earlier
  const authorFieldId = fields.find((field) => field.name === 'Author')?.id;
  const myRatingFieldId = fields.find((field) => field.name === 'My rating')?.id;

  // create a few books with our new tag
  const hobbit = await tanaAPIHelper.createNode(
    'The Hobbit',
    'A book by J.R.R. Tolkien',
    [
      {
        id: authorFieldId,
        value: 'J.R.R. Tolkien',
      },
      {
        id: myRatingFieldId,
        value: '5',
      },
    ],
    { tagId },
  );

  console.log(hobbit);
  await prompt('First book created, hit enter to create author for the second book');

  const williamGibson = await tanaAPIHelper.createNode('William Gibson', 'A writer of science fiction');

  await prompt('First book created, hit enter to create author for the second book');

  const neuromancer = await tanaAPIHelper.createNode(
    'Neuromancer',
    'Got the chiba city blues',
    [
      {
        id: authorFieldId!,
        value: {
          id: williamGibson.nodeId!,
          dataType: 'reference',
        },
      },
      {
        id: myRatingFieldId!,
        value: '4',
      },
    ],
    { tagId },
  );

  console.log(neuromancer);
  await prompt('Second book created, hit enter to create the third book');
  const dune = await tanaAPIHelper.createNode(
    'Dune',
    'He who controls the spice controls the universe',
    [
      {
        id: authorFieldId!,
        value: 'Frank Herbert',
      },
      {
        id: myRatingFieldId!,
        value: '5',
      },
    ],
    { tagId },
  );

  console.log(dune);
  await prompt('Third book created, hit enter to add some notes for the first book');

  // Make a note of the main antagonist in the first book
  const hobbitNotes = await tanaAPIHelper.createNode(
    'Main antagonist',
    'The main antagonist in the book',
    [
      {
        name: 'Gollum',
        description: 'A creature that lives in the Misty Mountains',
      },
    ],
    {
      targetNodeId: hobbit.nodeId,
    },
  );

  console.log(hobbitNotes);
  await prompt('First note created, hit enter to add some notes for the second book');
  // Add my favourite quote from the second book
  const neuromancerQuote = await tanaAPIHelper.createNode(
    'Favourite quote',
    'My favourite quote from the book',
    [
      {
        name: 'Quote',
        description: 'The sky above the port was the color of television, tuned to a dead channel.',
      },
    ],
    {
      targetNodeId: neuromancer.nodeId,
    },
  );

  console.log(neuromancerQuote);
  await prompt('Second note created, hit enter to add some notes for the third book');
  // Add my favorite characters from the third book
  const duneCharacters = await tanaAPIHelper.createNode(
    'Favourite characters',
    'My favourite characters from the book',
    [
      {
        name: 'Paul Atreides',
        description: 'The son of the Duke Leto Atreides',
      },
      {
        name: 'Chani',
        description: "Paul's concubine",
      },
    ],
    {
      targetNodeId: dune.nodeId,
    },
  );
  console.log(duneCharacters);
  prompt('Third note created, hit enter to continue');
};
run().then(() => process.exit(0));
