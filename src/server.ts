import express from 'express';
import { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';

const app = express();

const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.engine('handlebars', engine());

app.use(express.static('public'));

app.set('view engine', 'handlebars');

app.get('/', function (req: Request, res: Response) {
  res.render('home');
});

app.post('/submitUrl', urlencodedParser, function (req: Request, res: Response) {
  const url = req.body.url;

  try {
    app.get(`/${url}`, async function (req: Request, res: Response) {
     const html  = await browse(url);
      res.render('content', { html });
    })

    res.redirect(`/${url}`);
  } catch (err) {
    console.log(err);
  }
});

const browse = async (url: string) => {

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setRequestInterception(true);

  page.on('request', request => {
    if (request.resourceType() === 'script') {
      request.abort();
      return;
    }
    request.continue();
  });

  await page.goto(url);
  const html = await page.content();
  await browser.close();
  return html;
};

app.listen(5000, () => console.log('server is running on port 5000'));