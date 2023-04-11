<img alt="Twitter Follow" src="https://img.shields.io/twitter/follow/tana_inc?style=for-the-badge">

<img src='https://img.shields.io/github/license/tanainc/add2node-api-sample?style=for-the-badge'>

This project has a basic client for Tanas Add2Node-API and a few example scripts.

The client uses node-fetch, but native fetch can be used from Node 17.5 with `--experimental-fetch`

Please note that the API currently has the following restrictions:

- One call per second per token
- Max 100 nodes created per call
- Max 5000 chars in one request

Please get in touch if you are hitting these limits

# 👨‍💻 How to use

Install the deps with `yarn install`, then see below for the examples

## Creating fields & tags

To create a new field definition you create a node with the supertag set to `SYS_T02`:

```
{
  targetNodeId: 'xxxyyy_SCHEMA',
  targetFileId: 'xxxyyy',
  nodes: [
    {
      name: 'Author',
      description: 'Who wrote the book?',
      supertags: [{id:'SYS_T02'}]
    },
    {
      name: 'My rating',
      description: 'How was it?',
      supertags: [{id:'SYS_T02'}]
    }
  ]
}
```

To create a tag, set the supertag to `SYS_T01`:

```
{
  targetNodeId: 'xxxyyy_SCHEMA',
  targetFileId: 'xxxyyy',
  nodes: [
    {
      name: 'Book',
      description: 'A supertag for my books',
      supertags: [{id:'SYS_T01'}],
      children: []
    }
  ]
}
```

## Creating nodes

```
{
  targetNodeId: 'xxxyyy_STASH',
  targetFileId: 'xxxyyy',
  nodes: [
    {
      name: 'The Hobbit',
      description: 'A book by J.R.R. Tolkien',
      supertags: [{id:'MyTagId'}],
      children: []
    }
  ]
}
```

## Example:Books

This example shows how we can create new fields, and then a new tag using those fields. We then create a few books using the tag, and add some extra content to the books afterwards.

`TANA_TOKEN=token TANA_FILE_ID=fileId yarn run example:books`

# ✍️ Contributing

Feedback, PRs and suggestions for improvements will be highly appreciated. Make sure you read our [Code of Conduct](CODE_OF_CONDUCT.md)
