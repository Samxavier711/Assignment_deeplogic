const http = require('http');
const axios = require('axios');
const url = require('url');
////// creating a basic server using http which is an inbuilt library of javascript

const server = http.createServer(async (req, res) => {
const parsedUrl = url.parse(req.url, true);

  if (req.method === 'GET' && parsedUrl.pathname === '/getTimeStories') {
    try {
      const response = await axios.get('https://time.com');  ////// using regex we are trying to parse the required content from the tag which contains the latest-stories
      const titleRegex = /<h3 class="latest-stories__item-headline">(.*?)<\/h3>/g;
      const linkRegex = /<a href="\/659(.*?)">/g;

function createList(titles, links) {
  const resultList = [];
  const minLen = Math.min(titles.length, links.length);

  for (let i = 0; i < minLen; i++) {
    const title = titles[i].trim(); 
    const link = links[i].trim();
    resultList.push({ 'title': title, 'link': "https://time.com/659"+link });
  }

  return resultList;
}

const titles = Array.from(response.data.matchAll(titleRegex), match => match[1]);
const links = Array.from(response.data.matchAll(linkRegex), match => match[1]);
const resultList = createList(titles, links);


res.end(JSON.stringify(resultList));
    } catch (error) {
      console.error('Error fetching data:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  } else {

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
