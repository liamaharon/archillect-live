const fs = require('fs')
const { spawn } = require('child_process')
const axios = require('axios')
const querystring = require('querystring')

const API_KEY = process.env.TWITTER_API_KEY
const API_SECRET_KEY = process.env.TWITTER_API_SECRET_KEY

let token = null
let lastPostTime = null
let child = null

async function authenticate() {
  console.log('Authenticating')
  try {
    const authRes = await axios({
      method: 'post',
      url: 'https://api.twitter.com/oauth2/token',
      auth: {
        username: API_KEY,
        password: API_SECRET_KEY,
      },
      data: querystring.stringify({ grant_type: 'client_credentials' }),
    })

    token = authRes.data.access_token
    console.log('Authenticated')
    setTimeout(authenticate, 1000 * 60 * 60)
  } catch (error) {
    console.log('Failed to authenticate')
    console.log(error)
  }
}

async function updatePost() {
  try {
    const latestPostRes = await axios({
      method: 'get',
      url: 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=archillect&count=1',
      headers: { Authorization: `Bearer ${token}` },
    })
    const thisPostTime = latestPostRes.data[0].created_at
    if (thisPostTime !== lastPostTime) {
      lastPostTime = thisPostTime
      console.log('Updating!')
      const mediaUrl = latestPostRes.data[0].entities.media[0].media_url_https
      const mediaType = latestPostRes.data[0].entities.media[0].type
      const fileName = mediaType === 'photo' ? 'latest.jpg' : 'latest.gif'
      await axios({
        method: 'get',
        url: mediaUrl,
        responseType: 'stream',
      }).then((response) => {
        response.data.pipe(fs.createWriteStream(`${__dirname}/${fileName}`))
      })
      await new Promise(r => setTimeout(r, 2000))
      if (child) console.log(child.kill())
      child = spawn('feh', ['-xFZ'])
    }
  } catch (error) {
    console.log('Failed to fetch latest post')
    console.log(error)
  } finally {
    setTimeout(updatePost, 1000 * 5)
  }
}

async function main() {
  await authenticate()
  await updatePost()
}

main()
