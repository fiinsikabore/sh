# sh…

**Books for the mood you're actually in.**

sh… is a small web app that recommends books based on how you feel. Pick one or two moods, tune the sliders, choose French, English or both, and get six books with their cover, author and a short description. Each mood comes with a quote from a classic book.

Built by [Fiinsi Kabore](https://github.com/fiinsikabore).

## Features

- **12 moods**: Swoony, Spicy, Enemies to lovers, Dark romance, Cozy, Heartbroken, Adventurous, Dreamy, Curious, Restless, Nostalgic, Brave. Pick up to two to mix their shelves.
- **Language switch**: French, English or both.
- **Three sliders**: book length, era (classics to brand new), and hidden gems vs. everyone's favorites.
- **Real book data** from Google Books, with Open Library as a backup. If neither can be reached, the app shows a built-in shelf of about 45 books.
- **Author picks**: each mood also searches a hand-picked list of authors, so favorites like Ali Hazelwood, Sarah Rivens or Shelby Mahurin show up reliably.
- **Cross-stitch design**: the logo is drawn stitch by stitch on a canvas, with sticker-style mood chips and tick-mark sliders.

## Project structure

```
sh/
├── index.html      page structure
├── css/
│   └── style.css   all styles (colors are CSS variables at the top)
└── js/
    ├── data.js     moods, authors, quotes, sliders and the built-in shelf
    └── app.js      search, filtering, rendering and the stitched logo
```

No build step, no framework, no dependencies. Just open `index.html`.

## Run it locally

Open `index.html` in a browser, or serve the folder to avoid browser restrictions:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy on GitHub Pages

1. Push this folder to a GitHub repository.
2. Go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. After a minute your site is live at `https://fiinsikabore.github.io/<repo-name>/`.

## Roadmap

- [ ] Save books to a personal shelf
- [ ] Free-text mood box ("something that feels like a rainy Sunday")
- [ ] AI-assisted recommendations (needs a small backend to keep the API key private)
- [ ] Share a shelf as an image

## Credits

- Book data and covers: [Google Books](https://books.google.com) and [Open Library](https://openlibrary.org)
- Fonts: [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) and [Silkscreen](https://fonts.google.com/specimen/Silkscreen) from Google Fonts
- Quotes: Jane Austen, John Keats, Emily Brontë, Herman Melville, L. M. Montgomery, Lewis Carroll, F. Scott Fitzgerald, Louisa May Alcott (all public domain)

## License

MIT
