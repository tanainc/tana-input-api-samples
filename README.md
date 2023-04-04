<img alt="Twitter Follow" src="https://img.shields.io/twitter/follow/tana_inc?style=for-the-badge">

<img src='https://img.shields.io/github/license/tanainc/add2node-api-sample?style=for-the-badge'>

# 👨‍💻 How to use

This project has a basic client for Tanas Add2Node-API and a few example scripts.

The client uses node-fetch, but native fetch can be used from Node 17.5 with `--experimental-fetch`

Please note that the API currently has the following restrictions:

- One call per second per token
- Max 100 nodes created per call
- Max 5000 chars in one request

Please get in touch if you are hitting these limits

## Example:Books

This example shows how we can create new fields, and then a new tag using those fields. We then create a few books using the tag, and add some extra content to the books afterwards.

`TANA_TOKEN=token TANA_FILE_ID=fileId yarn run example:books`

# ✍️ Contributing

Please check out our [Contribution Guide](CONTRIBUTING.md) first. Also, make sure you read our [Code of Conduct](CODE_OF_CONDUCT.md)
