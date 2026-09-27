/* sh… data: moods, sliders and the built-in shelf.
   Edit this file to change moods, authors and quotes. */

/* Your Google Books API key (optional). Without a key the app still works for
   light use. If you add one, restrict it to your GitHub Pages address in the
   Google Cloud console so nobody else can use it. */
const GOOGLE_BOOKS_KEY = "";

/* Each mood: subjects (topic tags) + authors (your picks, searched by name).
   Edit the author lists freely: that's what makes sh… yours. */
const MOODS = [
  { id: "swoony", label: "Swoony", color: "#ff5fa2", on: "#0b0b0b",
    subjects: ["romance", "romantic comedy", "love stories"],
    authors: ["Ali Hazelwood", "Emma Green", "Emily Henry", "Colleen Hoover", "Ara Reeed", "Agnès Martin-Lugand"],
    quote: { text: "You must allow me to tell you how ardently I admire and love you.", who: "Jane Austen", book: "Pride and Prejudice, 1813" } },
  { id: "spicy", label: "Spicy", color: "#d7263d", on: "#ffffff",
    subjects: ["romance", "erotic romance", "fantasy romance"],
    authors: ["Jennifer L. Armentrout", "Kerri Maniscalco", "Navessa Allen", "Sarah J. Maas", "Ara Reeed"],
    quote: { text: "You have ravish'd me away by a Power I cannot resist.", who: "John Keats", book: "Letter to Fanny Brawne, 1819" } },
  { id: "enemies", label: "Enemies to lovers", color: "#2f6b55", on: "#ffffff",
    subjects: ["fantasy romance", "romantic fantasy", "romance"],
    authors: ["Shelby Mahurin", "Kerri Maniscalco", "Stacey McEwan", "Jennifer L. Armentrout", "Holly Black"],
    quote: { text: "I could easily forgive his pride, if he had not mortified mine.", who: "Jane Austen", book: "Pride and Prejudice, 1813" } },
  { id: "dark", label: "Dark romance", color: "#5b0f24", on: "#ffffff",
    subjects: ["dark romance", "romantic suspense", "gothic fiction"],
    authors: ["Sarah Rivens", "Navessa Allen", "Colleen Hoover"],
    quote: { text: "Whatever our souls are made of, his and mine are the same.", who: "Emily Brontë", book: "Wuthering Heights, 1847" } },
  { id: "cozy", label: "Cozy", color: "#fbba00", on: "#0b0b0b",
    authors: ["Virginie Grimaldi", "Agnès Martin-Lugand", "TJ Klune", "Travis Baldree"],
    subjects: ["friendship", "small town life", "cooking", "cats", "found family"],
    quote: { text: "I declare after all there is no enjoyment like reading!", who: "Jane Austen", book: "Pride and Prejudice, 1813" } },
  { id: "heartbroken", label: "Heartbroken", color: "#ff9eed", on: "#0b0b0b",
    subjects: ["love", "grief", "heartbreak", "loss"],
    authors: ["Colleen Hoover", "Sally Rooney", "Guillaume Musso", "Mariama Bâ"],
    quote: { text: "I have loved none but you.", who: "Jane Austen", book: "Persuasion, 1817" } },
  { id: "adventurous", label: "Adventurous", color: "#ff6d18", on: "#0b0b0b",
    subjects: ["adventure", "voyages and travels", "survival", "quests"],
    authors: ["Jules Verne", "Tomi Adeyemi", "Paulo Coelho"],
    quote: { text: "I love to sail forbidden seas, and land on barbarous coasts.", who: "Herman Melville", book: "Moby-Dick, 1851" } },
  { id: "dreamy", label: "Dreamy", color: "#d77df6", on: "#0b0b0b",
    subjects: ["fantasy", "magic", "fairy tales", "magical realism"],
    authors: ["Christelle Dabos", "Erin Morgenstern", "Susanna Clarke"],
    quote: { text: "Dear old world, you are very lovely, and I am glad to be alive in you.", who: "L. M. Montgomery", book: "Anne of Green Gables, 1908" } },
  { id: "curious", label: "Curious", color: "#35c4ea", on: "#0b0b0b",
    subjects: ["mystery", "science", "history", "puzzles"],
    authors: ["Joël Dicker", "Umberto Eco", "Agatha Christie"],
    quote: { text: "Curiouser and curiouser!", who: "Lewis Carroll", book: "Alice's Adventures in Wonderland, 1865" } },
  { id: "restless", label: "Restless", color: "#e800b5", on: "#ffffff",
    subjects: ["coming of age", "road fiction", "self-discovery", "travel"],
    authors: ["Teju Cole", "Hermann Hesse", "Jack Kerouac"],
    quote: { text: "It's no use going back to yesterday, because I was a different person then.", who: "Lewis Carroll", book: "Alice's Adventures in Wonderland, 1865" } },
  { id: "nostalgic", label: "Nostalgic", color: "#7f56d9", on: "#ffffff",
    subjects: ["childhood", "memories", "family", "domestic fiction"],
    authors: ["Marcel Pagnol", "Kazuo Ishiguro", "Chimamanda Ngozi Adichie"],
    quote: { text: "So we beat on, boats against the current, borne back ceaselessly into the past.", who: "F. Scott Fitzgerald", book: "The Great Gatsby, 1925" } },
  { id: "brave", label: "Brave", color: "#f24d28", on: "#0b0b0b",
    subjects: ["courage", "resistance", "women heroes", "social justice"],
    authors: ["Chimamanda Ngozi Adichie", "Maya Angelou", "Angie Thomas", "Mariama Bâ"],
    quote: { text: "I'm not afraid of storms, for I'm learning how to sail my ship.", who: "Louisa May Alcott", book: "Little Women, 1868" } },
];

/* ------------------------------------------------------------------
   TUNERS: the tick sliders. Each has 5 stops.
   ------------------------------------------------------------------ */
const TUNERS = [
  { id: "len", ask: "How much time do you have for this book?", ends: ["Quick read", "Long haul"],
    stops: ["A quick read", "On the short side", "Any length", "Something long", "A whole saga"],
    range: [[0, 180], [0, 280], null, [320, 99999], [550, 99999]] },
  { id: "era", ask: "Old soul or brand new?", ends: ["Classics", "New"],
    stops: ["Classics only", "Last century", "Any era", "Since 2000", "The last few years"],
    range: [[0, 1930], [1900, 1999], null, [2000, 9999], [2018, 9999]] },
  { id: "pop", ask: "Hidden gem or everyone's favorite?", ends: ["Hidden gems", "Loved by many"],
    stops: ["Hidden gems", "Lesser known", "A bit of both", "Well loved", "Everyone's favorite"],
    sort: ["random", "random", null, "rating", "readinglog"] },
];

/* ------------------------------------------------------------------
   BUILT-IN SHELF: used when Open Library can't be reached
   (for example inside a sandboxed preview).
   ------------------------------------------------------------------ */
const SHELF = [
  ["Anne of Green Gables", "L. M. Montgomery", 1908, 320, ["cozy","dreamy","nostalgic"], "A talkative, imaginative orphan is sent by mistake to an elderly brother and sister on Prince Edward Island, and slowly makes the farm, the town and their hearts her own."],
  ["The House in the Cerulean Sea", "TJ Klune", 2020, 394, ["cozy","dreamy"], "A rule-following caseworker is sent to inspect an island orphanage for magical children and finds a home, a family and a reason to break a few rules."],
  ["Legends & Lattes", "Travis Baldree", 2022, 296, ["cozy"], "An orc warrior hangs up her sword to open the first coffee shop in a fantasy city. Low stakes, warm friendships and a lot of cinnamon rolls."],
  ["Before the Coffee Gets Cold", "Toshikazu Kawaguchi", 2015, 213, ["cozy","heartbroken","nostalgic"], "In a small Tokyo café, customers can travel back in time for as long as it takes their coffee to cool. Four gentle stories about what we wish we had said."],
  ["Persuasion", "Jane Austen", 1817, 249, ["heartbroken","nostalgic"], "Eight years after being persuaded to break off her engagement, Anne Elliot meets the man she gave up again, now a successful naval captain."],
  ["Normal People", "Sally Rooney", 2018, 273, ["heartbroken","restless"], "Connell and Marianne circle each other from school in small-town Ireland to university in Dublin, never quite able to stay together or apart."],
  ["So Long a Letter", "Mariama Bâ", 1979, 90, ["heartbroken","brave"], "A Senegalese widow writes to her closest friend about marriage, betrayal and friendship after her husband takes a second wife. Short, sharp and tender."],
  ["Norwegian Wood", "Haruki Murakami", 1987, 296, ["heartbroken","nostalgic"], "A song on a plane sends Toru Watanabe back to his student years in 1960s Tokyo and the two young women he loved."],
  ["Moby-Dick", "Herman Melville", 1851, 635, ["adventurous","curious"], "Ishmael signs on to a whaling ship whose captain is obsessed with hunting the white whale that took his leg."],
  ["The Alchemist", "Paulo Coelho", 1988, 197, ["adventurous","restless","dreamy"], "A young Andalusian shepherd follows a recurring dream across the desert toward the pyramids of Egypt, learning to read the signs along the way."],
  ["Around the World in Eighty Days", "Jules Verne", 1872, 250, ["adventurous"], "A precise English gentleman bets his fortune that he can circle the globe in eighty days, with his loyal valet and a detective close behind."],
  ["Children of Blood and Bone", "Tomi Adeyemi", 2018, 531, ["adventurous","brave","dreamy"], "In a West African-inspired kingdom where magic was stolen, Zélie sets out to bring it back, whatever it costs."],
  ["The Night Circus", "Erin Morgenstern", 2011, 387, ["dreamy"], "A black-and-white circus that opens only at night hides a contest between two young magicians who were bound to it as children."],
  ["The Little Prince", "Antoine de Saint-Exupéry", 1943, 96, ["dreamy","nostalgic","heartbroken"], "A pilot stranded in the Sahara meets a small prince from a faraway asteroid who tells him about his rose and the grown-ups he met."],
  ["Piranesi", "Susanna Clarke", 2020, 245, ["dreamy","curious"], "Piranesi lives in an endless house of statues and tides. He keeps careful journals, until the entries start to tell him something strange."],
  ["Alice's Adventures in Wonderland", "Lewis Carroll", 1865, 96, ["curious","dreamy"], "Alice follows a white rabbit down a hole into a world of riddles, tea parties and a queen who wants everyone's head."],
  ["The Name of the Rose", "Umberto Eco", 1980, 536, ["curious"], "In a medieval Italian abbey, a Franciscan friar and his novice investigate a series of deaths linked to a forbidden book."],
  ["Braiding Sweetgrass", "Robin Wall Kimmerer", 2013, 390, ["curious","cozy"], "A botanist and member of the Potawatomi Nation weaves plant science and Indigenous knowledge into essays about gratitude and the living world."],
  ["Sapiens", "Yuval Noah Harari", 2011, 443, ["curious"], "A fast, big-picture history of how our species went from foraging bands to empires, money and algorithms."],
  ["Siddhartha", "Hermann Hesse", 1922, 152, ["restless","curious"], "A young man leaves his comfortable home to search for meaning, trying asceticism, pleasure and finally the patience of a river."],
  ["On the Road", "Jack Kerouac", 1957, 320, ["restless","adventurous"], "Sal Paradise and the wild Dean Moriarty crisscross post-war America by car, chasing jazz, friendship and something they can't name."],
  ["Open City", "Teju Cole", 2011, 259, ["restless","curious"], "Julius, a young Nigerian psychiatrist, walks the streets of New York and Brussels, and his thoughts wander through history, music and memory."],
  ["Wild", "Cheryl Strayed", 2012, 315, ["restless","brave","heartbroken"], "After losing her mother, Strayed hikes more than a thousand miles of the Pacific Crest Trail alone with no experience and a huge backpack."],
  ["The Great Gatsby", "F. Scott Fitzgerald", 1925, 180, ["nostalgic","heartbroken"], "Nick Carraway watches his mysterious neighbor throw dazzling parties on Long Island, all to win back the woman he lost."],
  ["Purple Hibiscus", "Chimamanda Ngozi Adichie", 2003, 307, ["nostalgic","brave"], "Fifteen-year-old Kambili grows up under her devout, controlling father in Enugu, until a stay with her aunt shows her laughter and freedom."],
  ["Little Women", "Louisa May Alcott", 1868, 449, ["nostalgic","cozy","brave"], "The four March sisters grow up in Massachusetts during the Civil War, each chasing her own idea of a good life."],
  ["The Remains of the Day", "Kazuo Ishiguro", 1989, 245, ["nostalgic","heartbroken"], "An aging English butler takes a road trip and looks back on decades of loyal service and the feelings he never let himself show."],
  ["Jane Eyre", "Charlotte Brontë", 1847, 507, ["brave","heartbroken"], "An orphaned governess with a fierce sense of self falls for her brooding employer, then discovers the secret in his house."],
  ["Things Fall Apart", "Chinua Achebe", 1958, 209, ["brave","curious"], "Okonkwo, a proud Igbo leader, watches his world change as colonial rule and missionaries arrive in his village."],
  ["I Know Why the Caged Bird Sings", "Maya Angelou", 1969, 289, ["brave","nostalgic"], "Maya Angelou's memoir of her childhood in Arkansas and California, and of finding her voice through literature."],
  ["The Hate U Give", "Angie Thomas", 2017, 444, ["brave"], "Sixteen-year-old Starr witnesses the police shooting of her childhood friend and has to decide what her voice is worth."],
  ["Half of a Yellow Sun", "Chimamanda Ngozi Adichie", 2006, 433, ["brave","heartbroken"], "Twin sisters, a houseboy and a British writer live through the Nigerian civil war and the short life of Biafra."],
  ["The Love Hypothesis", "Ali Hazelwood", 2021, 384, ["swoony"], "PhD student Olive fake-dates Adam Carlsen, the most feared young professor in her department, to convince her best friend she has moved on."],
  ["Beach Read", "Emily Henry", 2020, 361, ["swoony","heartbroken"], "Two blocked writers with opposite styles spend a summer as neighbors and agree to swap genres. Neither expects to fall for the other."],
  ["Pride and Prejudice", "Jane Austen", 1813, 432, ["swoony","enemies"], "Elizabeth Bennet and the proud Mr. Darcy get off to a terrible start, and both have to swallow their first impressions."],
  ["It Ends with Us", "Colleen Hoover", 2016, 384, ["heartbroken","swoony","dark"], "Lily falls for Ryle, a charming neurosurgeon, but his temper and the return of her first love Atlas force her to make a hard choice."],
  ["The Duke and I", "Julia Quinn", 2000, 371, ["spicy","swoony"], "Daphne Bridgerton and the Duke of Hastings pretend to court so she gets better suitors and he gets left alone. The plan goes wrong fast."],
  ["From Blood and Ash", "Jennifer L. Armentrout", 2020, 613, ["spicy","enemies"], "Poppy, the Maiden chosen by the gods, is guarded by Hawke, whose loyalty and secrets make her question everything she was taught."],
  ["A Court of Thorns and Roses", "Sarah J. Maas", 2015, 419, ["spicy","enemies","dreamy"], "A huntress kills a wolf in the woods and is taken to a faerie land as payment, where her captor is not what he seems."],
  ["Kingdom of the Wicked", "Kerri Maniscalco", 2020, 372, ["enemies","spicy","dark"], "After her twin is murdered in Sicily, Emilia summons Wrath, a prince of Hell, and makes a dangerous deal to find the killer."],
  ["Serpent & Dove", "Shelby Mahurin", 2019, 528, ["enemies","spicy"], "Lou, a witch hiding in a city that burns witches, is forced to marry Reid, a devoted witch hunter."],
  ["The Cruel Prince", "Holly Black", 2018, 370, ["enemies","dark","dreamy"], "Mortal Jude grows up in the High Court of Faerie and fights her way into its politics, clashing with the cruel Prince Cardan."],
  ["Wuthering Heights", "Emily Brontë", 1847, 416, ["dark","heartbroken"], "Heathcliff and Catherine's wild, destructive love on the Yorkshire moors poisons two families for a generation."],
  ["Rebecca", "Daphne du Maurier", 1938, 410, ["dark","curious"], "A young bride arrives at Manderley and finds her husband's first wife, Rebecca, still everywhere in the house."],
].map(([title, author, year, pages, moods, desc]) => ({ title, author, year, pages, moods, desc }));
