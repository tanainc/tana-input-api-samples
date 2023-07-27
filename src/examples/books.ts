import { readFileSync } from 'fs';
import { TanaAPIHelper } from '../TanaAPIClient';
import { waitForEnter } from '../utils';

const token = process.env.TANA_TOKEN || '';

if (!token) {
  console.log('Please set TANA_TOKEN in your environment');
  process.exit(1);
}

console.log('----------------------------------------');
console.log('This script will create a tag called "Book"');
console.log('It will then create a books with that tag andd some contents to it');
console.log('');
console.log('Hit enter to go to the next step');
console.log('The rate limit is one call per second');
console.log('----------------------------------------');

const run = async () => {
  // Create new api client with your token and workspace id
  const tanaAPIHelper = new TanaAPIHelper(token);

  await waitForEnter('Hit enter to create a few fields');

  // Create some fields for our book tag
  const fields = await tanaAPIHelper.createFieldDefinitions([
    {
      name: 'Author',
      description: 'Who wrote the book',
    },
    {
      name: 'My rating',
      description: 'How I rated the book',
    },
    {
      name: 'Purchase date',
      description: 'When I bought the book',
    },
  ]);

  console.log(fields);

  await waitForEnter('Fields created, hit enter to create tag');

  // create the book tag itself, using the fields we just created
  const bookTagId = await tanaAPIHelper.createTagDefinition({
    name: 'Book',
    description: 'A book',
    children: fields.map((field) => ({
      attributeId: field.id,
      type: 'field',
      children: [{ name: '' }],
    })),
  });

  if (!bookTagId) {
    console.log('bookTagId is undefined, something went wrong creating the tag');
    return;
  }

  console.log('bookTagId', bookTagId);
  await waitForEnter('Tag created, hit enter to create an author');

  // get references to the fields we created earlier
  const authorFieldId = fields.find((field) => field.name === 'Author')?.id;
  const myRatingFieldId = fields.find((field) => field.name === 'My rating')?.id;
  const purchaseDateFieldId = fields.find((field) => field.name === 'Purchase date')?.id;

  const williamGibson = await tanaAPIHelper.createNode({
    name: 'William Gibson',
    description: 'A writer of science fiction',
  });

  console.log(williamGibson);
  await waitForEnter('Author created, press enter to create the book');

  const neuromancer = await tanaAPIHelper.createNode({
    name: 'Neuromancer',
    description: 'Got the chiba city blues',
    children: [
      {
        attributeId: authorFieldId!,
        type: 'field',
        children: [
          {
            id: williamGibson.nodeId!,
            dataType: 'reference',
          },
        ],
      },
      {
        attributeId: myRatingFieldId!,
        type: 'field',
        children: [{ name: '5' }],
      },
      {
        attributeId: purchaseDateFieldId!,
        type: 'field',
        children: [{ name: '1984-09-21', dataType: 'date' }],
      },
    ],
    supertags: [{ id: bookTagId }],
  });

  console.log(neuromancer);

  await waitForEnter('First note created, hit enter to add some notes for the book');

  // Add my favourite quote from the book, with Neuromancer as target node
  const neuromancerQuote = await tanaAPIHelper.createNode(
    {
      name: 'Favourite quote',
      description: 'My favourite quote from the book',
      children: [
        {
          name: 'Quote',
          description: 'The sky above the port was the color of television, tuned to a dead channel.',
        },
      ],
    },
    neuromancer.nodeId,
  );

  console.log(neuromancerQuote);

  await waitForEnter('Notes added, hit enter to upload a synopsis of the book (pdf)');

  const filename = 'examples/synopsis.pdf';
  const synposisFileContents = readFileSync(filename, { encoding: 'base64' });
  // Upload a PDF synopsis of the book
  const synopsis = await tanaAPIHelper.createNode(
    {
      filename: 'synopsis.pdf',
      dataType: 'file',
      contentType: 'application/pdf',
      file: synposisFileContents.toString(),
    },
    neuromancer.nodeId,
  );
  console.log(synopsis);
};
run().then(() => process.exit(0));
