const http = require("http");
const https = require("https");
const url = "https://time.com";

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
          // using regex to match and extract the required latest-stories section
          const pattern =
            /<li class="latest-stories__item">\s*<a href="([^"]+)">\s*<h3 class="latest-stories__item-headline">([^<]+)<\/h3>/g;

          const Lateststories = []; // initialising an array to store stories iwth the title and the link
          let story;
          // now we are performing the match in the response from the http request using regex exec command and adding it to the lateststories array
          while ((story = pattern.exec(data)) !== null) {
            Lateststories.push({
              title: story[2],
              link: `https://time.com${story[1]}`,
            });
          }

          // slicing the top 6 stories
          const responseData = Lateststories.slice(0, 6);
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
