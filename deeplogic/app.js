const http = require("http");
const https = require("https");
const url = "https://time.com";


function extractTextBetween(source, startTag, endTag) {
  const startIndex = source.indexOf(startTag);
  if (startIndex === -1) return null;
  
  const endIndex = source.indexOf(endTag, startIndex + startTag.length);
  if (endIndex === -1) return null;

  return source.substring(startIndex + startTag.length, endIndex);
}

// Function to extract all occurrences of a pattern from HTML content
function extractOccurrences(html, startTag, endTag) {
  const occurrences = [];
  let currentIndex = 0;
  
  while (true) {
      const startIndex = html.indexOf(startTag, currentIndex);
      if (startIndex === -1) break;
      
      const endIndex = html.indexOf(endTag, startIndex + startTag.length);
      if (endIndex === -1) break;
      
      const occurrence = html.substring(startIndex, endIndex + endTag.length);
      occurrences.push(occurrence);
      
      currentIndex = endIndex + endTag.length;
  }
  
  return occurrences;
}





// starting the server using http createserver
const server = http.createServer((req, res) => {
  // making a GET request 
  if (req.method === "GET" && req.url === "/getTimeStories") {
    // getting the response from the earlier GEt request made
    https
      .get(url, (response) => {
        let data = "";

        // Extracting data from website as the latest stories section is loading dynamically
        response.on("data", (dataInChunk) => {
          data += dataInChunk;
        });

        response.on("end", () => {
          const startTag = '<li class="latest-stories__item">';
                const endTag = '</h3>';
                const extractedData = [];
                const occurrences = extractOccurrences(data, startTag, endTag);
                occurrences.forEach((occurrence) => {
                    const url = `https://time.com${extractTextBetween(occurrence, '<a href="', '">')}`;
                    const headline = extractTextBetween(occurrence, '<h3 class="latest-stories__item-headline">', '</h3>');
                    extractedData.push({url,headline});
                    // Do something with the extracted data
                    console.log("URL:", url);
                    console.log("Headline:", headline);
                });

                // Here, you can send the extracted data as a response
                // res.end(...);
          

          
          // using regex to match and extract the required latest-stories section
          // const pattern =
          //   /<li class="latest-stories__item">\s*<a href="([^"]+)">\s*<h3 class="latest-stories__item-headline">([^<]+)<\/h3>/g;

          // const Lateststories = []; // initialising an array to store stories iwth the title and the link
          // let story;
          // // now we are performing the match in the response from the http request using regex exec command and adding it to the lateststories array
          // while ((story = pattern.exec(data)) !== null) {
          //   Lateststories.push({
          //     title: story[2],
          //     link: `https://time.com${story[1]}`,
          //   });
          // }

          // slicing the top 6 stories
          const responseData = extractedData.slice(0, 6);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(responseData));
        });
      })
      .on("error", (error) => {
        // Handling errors
        console.error(error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      });
  } else {
    // In case if we didnt get any response from the website
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

const PORT = 3000; // defining the PORT number

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
