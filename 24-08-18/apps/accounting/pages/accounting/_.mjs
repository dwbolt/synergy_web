import  {page_         }    from '/_lib/UX/page_.mjs'

const name = "accounting";
const page           = new page_(name);  // give app access to page methods
app.pages[name]  = page;
await page.init();