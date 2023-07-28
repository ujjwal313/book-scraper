const fs = require("fs");
const pageScraper = require("./pageScraper");
async function scrapeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;
    const res = await pageScraper.scraper(browser);

    const jsonData = JSON.stringify(res, null, 2);

    const filePath = "data.json";

    fs.writeFile(filePath, jsonData, (err) => {
      if (err) {
        console.error("Error writing to JSON file:", err);
      } else {
        console.log("Data has been written to the JSON file successfully.");
      }
    });
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
