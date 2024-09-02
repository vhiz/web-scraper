import axios from "axios";
import * as cheerio from "cheerio";
import express from "express";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [process.env.CORS],
  })
);

app.get("/", (req, res) => {
  res.json("Hello world");
});

app.post("/", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.json({ data: "Input url" });
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let items = [];
    $("div.itm.col").each((i, elem) => {
      const name = $(elem).find(".name").text().trim();
      const price = $(elem).find(".prc").text().trim();
      const dataSrc = $(elem).find("img").attr("data-src").trim();
      const link = $(elem).find("a").attr("href").trim();
      items.push({
        name,
        price:price.split('-')[0],
        img: {
          "dataSrc": dataSrc,
          src: dataSrc.split("?")[0],
        },

        link: `https://www.jumia.com.ng${link}`,
      });
    });
    res.json(items);
  } catch (error) {
    res.json(error);
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
