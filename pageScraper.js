const scraperObject = {
  url: "https://champaca.in/collections",
  async scraper(browser) {
    let scrapedData = [];
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}`);
    await page.goto(this.url);

    await page.waitForSelector(".shopify-section");

    let urls = await page.$$eval(
      ".shopify-section > .grid-uniform > .grid__item",
      (categories) => {
        return categories.map((el) => el.querySelector("a").href);
      }
    );

    let pagePromise = (link) =>
      new Promise(async (resolve, reject) => {
        console.log(link);
        let dataObj = {};
        let newPage = await browser.newPage();
        await newPage.goto(link);

        let books = await newPage.$$eval(
          "main > .grid > .grid__item > .shopify-section > #CollectionSection > .grid-link__container > .grid__item",
          (b) => {
            return b.map((el) => ({
              title: el.querySelector("div > a > .grid-link__title")
                ?.textContent,
              price: el
                .querySelector("div > a > .grid-link__meta")
                ?.textContent.replace(/\s+/g, " ")
                .trim()
                .split(" ")
                .at(-1),
            }));
          }
        );
        if (
          await newPage.$(
            "main > .grid > .grid__item > .shopify-section > #CollectionSection > .text-center"
          )
        ) {
          let paginationLinks = await newPage.$$eval(
            "main > .grid > .grid__item > .shopify-section > #CollectionSection > .text-center > .pagination-custom > li",
            (b) => {
              return b.map((el) => el.querySelector("a")?.href);
            }
          );
          let newPaginationLinks = Array.from(
            new Set(paginationLinks.filter((item) => item !== null))
          );

          const totalPages = newPaginationLinks.at(-1).split("=")[1];
          const url = newPaginationLinks.at(-1).split("=")[0];

          const allPagesArray = [];
          for (let page = 2; page <= totalPages; page++) {
            allPagesArray.push(`${url}=${page}`);
          }
          for (pageLink in allPagesArray) {
            console.log("Navigating to new page", allPagesArray[pageLink]);
            let newPaginationPage = await browser.newPage();
            await newPaginationPage.goto(allPagesArray[pageLink]);

            let newPageBooks = await newPage.$$eval(
              "main > .grid > .grid__item > .shopify-section > #CollectionSection > .grid-link__container > .grid__item",
              (b) => {
                return b.map((el) => ({
                  title: el.querySelector("div > a > .grid-link__title")
                    ?.textContent,
                  price: el
                    .querySelector("div > a > .grid-link__meta")
                    ?.textContent.replace(/\s+/g, " ")
                    .trim()
                    .split(" ")
                    .at(-1),
                }));
              }
            );
            books.push(...newPageBooks);
            await newPaginationPage.close();
          }
        }
        dataObj[link.toString().split("/").at(-1)] = books;
        resolve(dataObj);
        await newPage.close();
      });

    for (link in urls) {
      let currentPageData = await pagePromise(urls[link]);
      scrapedData.push(currentPageData);
    }

    return scrapedData;
  },
};

module.exports = scraperObject;
