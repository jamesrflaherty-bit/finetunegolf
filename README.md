# Fine Tune Golf website

The website for Fine Tune Golf in Wadsworth, Ohio. It's plain HTML, CSS and JavaScript, so there's nothing to install.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home: hero, trust bar, the fitting process, services, reviews and booking |
| `services.html` | Services overview: fitting, building, repair and precision equipment |
| `craft.html` | Our Craft: how we measure, set and build clubs, plus the KZG partnership |
| `fitting.html` | Custom club fitting: the process, what we check, glossary and FAQ |
| `repair.html` | Club repair and adjustment: services, loft and lie, drop-off info and FAQ |
| `about.html` | Jeff and James: the story, credentials and values |
| `expert-notes.html` | Three guides: shaft frequency, loft and lie, grip size |
| `contact.html` | Booking form, appointment details, directions and FAQ |
| `404.html` | "Page not found" page |

## Booking requests

Requests go to **jamesrflaherty@gmail.com**. The form opens the visitor's email app with the request filled in, and the visitor presses Send. Requests only arrive once they press Send.

For requests to arrive in your inbox without that step, connect a free form service:

1. Create a free account at Formspree (formspree.io) with jamesrflaherty@gmail.com. Submissions are sent to the email on your account. Then create a form and copy its endpoint.
2. Copy the endpoint it gives you, open `assets/js/main.js`, and paste it into `formEndpoint: ''`, between the quotes.

## Front-page swing video

- The video loops, muted, on the home page, in the section titled "Every fitting starts with your swing."
- Add the file as `assets/video/golf-swing.mp4`. The section stays hidden until the file loads, so the page is unaffected until then.
- Before you add it:
  - Use MP4 (H.264) at 720p or 1080p, about 6 to 12 seconds, and under 8 MB. Phone videos are often 50 to 150 MB, so compress them first. A free converter such as HandBrake works well.
  - Only use footage you own or have permission to use.
- Visitors can pause the clip. Motion is switched off for people whose devices ask for reduced motion.

## Our Craft feature

- The iron photo is `assets/img/kzg-quad-iron.webp`, a KZG Quad iron with its white background removed. It sits on the white stage on the Our Craft page, with the Fine Tune Golf logo above it.
- It is a KZG product photo. Confirm that KZG allows dealers to use it, or replace it with your own photo of a head.
- The brand mark (`assets/img/logo-mark-iron.svg`) is the Quad iron head and hosel from `assets/img/kzg-quad-iron.webp`, on the green square, with the KZG chrome logo (`assets/img/kzg-logo.png`) angled to follow the head's sole, below it. It is used in the header and footer of every page, on the Our Craft stage, and as the browser-tab icon. The Our Craft stage also shows the KZG logo at top right. Confirm that KZG allows dealers to use its logo and the iron photo, and that these are the current versions.

## About page videos

- **Jeff:** `assets/video/jeff-intro.mp4`, with `assets/video/jeff-intro.jpg` as its still image. It has sound, so visitors press play to hear it.
- **James:** `assets/video/golf-swing.mp4`, the same golf swing clip as the home page, with `assets/video/golf-swing.jpg` as its still image. It loops once a visitor presses play.
- To swap a clip, replace the file and keep its name. The clips sit in the two bio cards in `about.html`.

## Appointments and club drop-offs

- Services are by appointment. The site shows no opening hours, and club drop-offs are arranged by phone in advance.
- The wording appears in the top bar of every page, the home page card, the contact page and the footers. To update it, search the pages for "By appointment" and "Appointments".

## Before you publish

1. **Photo.** Save a photo of Jeff and James as `assets/img/team.jpg`. The About page shows it automatically.
2. **Reviews.** The three reviews on the home page were copied from your current site. Confirm you're happy for them to appear.
3. **Prices.** The approved labor prices are in the Pricing section of `services.html`. Update them there and keep the wording lines. `fitting.html` and `repair.html` link to that section rather than repeating the figures.
4. **Domain.** The canonical links, `sitemap.xml` and `robots.txt` use `https://finetunegolf.net`. If you go with the www address instead, change them to match.
5. **Logo.** The mark is `assets/img/logo-mark-iron.svg`, built from the iron head photo and the KZG logo. Confirm KZG allows both (see Our Craft feature above).

## Preview on your computer

Double-click `index.html`. The layout works offline, but the fonts need an internet connection.

## Put it on FineTuneGolf.net (GoDaddy)

The site is plain files, so any web hosting with file uploads will run it. These steps assume a GoDaddy web hosting plan with cPanel.

1. **Get hosting.** A domain alone doesn't serve a website. In GoDaddy, add a cPanel web hosting plan and connect FineTuneGolf.net to it. If the domain points somewhere else, change its DNS to the hosting.
2. **Open File Manager.** In the hosting dashboard, open cPanel, then File Manager, then `public_html`. Delete any placeholder files GoDaddy added there.
3. **Upload the site.** Upload `FineTuneGolf-upload.zip` to `public_html`, right-click it, choose Extract, and delete the zip afterwards so it isn't public.
4. **Turn on HTTPS.** Install the SSL certificate for FineTuneGolf.net from cPanel's SSL/TLS Status page, or from GoDaddy's SSL setting.
5. **Test.** Open https://finetunegolf.net and check every page, the phone links, the booking form (it opens an email), and a made-up address such as /nothere, which should show the 404 page.
6. **Force HTTPS.** Open `.htaccess` and remove the `# ` from the four Rewrite lines. Do this only after step 4 works, or the site won't load.
7. **Link it on Google Business Profile.** Set the website to https://finetunegolf.net.
## After it goes live

- **Google Business Profile.** Keep the name, address and phone identical to the website. In Edit profile, set the website to https://finetunegolf.net. Don't add set opening hours, since services are by appointment; use an appointment setting if your profile offers one. If the profile isn't verified yet, finish verification first, because the listing won't show publicly until then.
- **Google listing link.** The "See us on Google" links in the footer and the "Read more reviews on Google" button open your listing at https://maps.app.goo.gl/mqLa4XzYkEKV1N688. If that share link ever changes, replace it on every page by searching for "maps.app.goo.gl".
- **Google Search Console.** Add the site and submit `sitemap.xml`.
- **Reviews.** Keep asking customers for Google reviews, and rotate the best ones onto the home page.

## Making changes

- **Colors, fonts and shapes:** edit the variables at the top of `assets/css/styles.css`. The fonts (Instrument Serif and Manrope) are loaded in each page's `<head>`.
- **Menu and footer:** each page has its own copy, so update every `.html` file when you change them.
- **Motion:** the reveal, marquee and rotating sticker respect the "reduce motion" setting on phones and computers.
