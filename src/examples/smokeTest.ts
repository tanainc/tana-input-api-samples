import { TanaAPIHelper } from '../TanaAPIClient';

const token = process.env.TANA_TOKEN || '';

if (!token) {
  console.log('Please set TANA_TOKEN in your environment');
  process.exit(1);
}

// a simple smoke test, internal use only. May serve as an example
const run = async () => {
  const tanaAPIHelper = new TanaAPIHelper(token, 'http://127.0.0.1:5001/emulator/europe-west1/addToNodeV2');
  const INLINEREF_NODE_ATTRIBUTE = 'data-inlineref-node';

  // plain node
  const helloWorldId = (
    await expectSuccess(() =>
      tanaAPIHelper.createNode({
        name: `Hello world`,
      }),
    )
  ).nodeId;

  await expectSuccess(() => tanaAPIHelper.setNodeName('foo', helloWorldId!));

  // valid inline ref
  await expectSuccess(() =>
    tanaAPIHelper.createNode({
      name: `hey <span ${INLINEREF_NODE_ATTRIBUTE}="${helloWorldId}"></span> you`,
    }),
  );

  // urls
  await expectSuccess(() =>
    tanaAPIHelper.createNode({
      name: 'url node test',
      children: [
        {
          dataType: 'url',
          name: 'https://tana.inc/',
        },
      ],
    }),
  );

  // custom protocol
  await expectSuccess(() =>
    tanaAPIHelper.createNode({
      name: 'url node test',
      children: [
        {
          dataType: 'url',
          name: 'tana://tana.inc/',
        },
      ],
    }),
  );

  // invalid urls
  await expectFailure(() =>
    tanaAPIHelper.createNode({
      name: 'url node test',
      children: [
        {
          dataType: 'url',
          name: 'https/tana.inc/',
        },
      ],
    }),
  );

  // fails on newlines
  await expectFailure(() =>
    tanaAPIHelper.createNode({
      name: `Hello \nworld`,
    }),
  );

  // ID too short
  await expectFailure(() =>
    tanaAPIHelper.createNode({
      name: 'hello',
      children: [
        {
          id: 'x',
          dataType: 'reference',
        },
      ],
    }),
  );

  // ID too long
  await expectFailure(() =>
    tanaAPIHelper.createNode({
      name: 'hello',
      children: [
        {
          id: 'x'.repeat(100),
          dataType: 'reference',
        },
      ],
    }),
  );

  // invalid Id characters
  await expectFailure(() =>
    tanaAPIHelper.createNode({
      name: 'hello',
      children: [
        {
          id: '_"#$#%&/()',
          dataType: 'reference',
        },
      ],
    }),
  );

  const children: { id: string; dataType: 'reference' }[] = [...Array(101).keys()].map((i) => ({
    id: `xxxxxxxxxxx${i}`,
    dataType: 'reference',
  }));

  // Too many nodes (max 100)
  await expectFailure(() =>
    tanaAPIHelper.createNode({
      name: 'hello',
      children,
    }),
  );

  // too long node name (max 80*100)
  await expectFailure(() =>
    tanaAPIHelper.createNode({
      name: 'x'.repeat(81 * 100),
    }),
  );

  // bad inline ref
  await expectFailure(() =>
    tanaAPIHelper.createNode({
      name: `hey <span ${INLINEREF_NODE_ATTRIBUTE}="$#%&/("></span> foo`,
    }),
  );
};

async function expectFailure(method: () => Promise<any>) {
  // wait for 1000ms
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return method().then(
    () => {
      throw new Error('Expected failure');
    },
    () => {
      // Expected
    },
  );
}

async function expectSuccess<T = any>(method: () => Promise<T>): Promise<T> {
  // wait for 1000ms
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return method().then(
    (r) => {
      // Expected
      return r;
    },
    (e) => {
      throw new Error('Expected success', { cause: e });
    },
  );
}

run().then(() => process.exit(0));
