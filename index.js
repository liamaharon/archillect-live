const axios = require('axios')

async function authenticate() {
  await axios.post('api.twitter.com/oauth2/token HTTP/1.1')
}

async function updatePost() {
  setTimeout(updatePost, 10000)
}

async function main() {
  console.log('Authenticating')
  await authenticate()
  await updatePost()
}

main()
