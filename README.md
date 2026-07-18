# VISUAILS — website

Static, multi-page website for VISUAILS. Dark, cinematic, futuristic. No build step, no
framework, no external image dependencies — plain HTML/CSS/JS you can push straight to
GitHub → Cloudflare Pages.

## Structure

```
index.html                 Homepage
catalog / lifestyle / video.html   Service hubs
models.html                Standard + custom models
pricing.html               Transparent pricing + add-ons
gallery.html               Filterable style samples
test-sample.html           Free sample explainer + 2-step request wizard
order.html                 Order hub + catalog form + 3-step lifestyle checkout + custom WhatsApp intake
about / contact / faq / how-it-works.html
upload-guidelines / order-status / thank-you / 404.html
privacy / terms / cookie-policy.html
assets/css/styles.css      Design system (one file)
assets/js/main.js          Interactions (nav, reveal, before/after, forms, filters)
_headers                   Cloudflare Pages security + cache headers
robots.txt · sitemap.xml   SEO
```

## Notes

- **Fonts** load from Fontshare (Clash Display + General Sans) with system fallbacks.
- **Imagery** is fully self-contained (CSS/SVG "visual" scenes) so nothing breaks. Real product
  photos can be dropped into any `.vis` slot later by adding `style="background-image:url(...)"`.
- **Forms have no backend yet.** They validate and route to `thank-you.html` / WhatsApp. Wire them
  to Cloudflare Pages Functions, Formspree, or your own endpoint when ready. Login-gated ordering
  (per the blueprint) is a later phase.
- No fake social proof anywhere — only verifiable value claims (10× cheaper, ~24–48h, 100%
  human-reviewed, from €19). Add real testimonials/case studies once you have clients.

## Deploy: GitHub → Cloudflare Pages

In **Command Prompt** (not PowerShell), from this folder:

```
git init
git add .
git commit -m "VISUAILS website"
git branch -M main
git remote add origin git@github.com:LucasVISUAILS/visuails-web.git   # create this empty repo on GitHub first
git push -u origin main
```

Then in the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git →**
pick the `visuails-web` repo. Build settings:

- Framework preset: **None**
- Build command: *(leave empty)*
- Build output directory: **/**

Cloudflare serves the files as-is. `404.html` is used automatically for unknown paths.
Point your domain (visuails.com) at the Pages project under **Custom domains**.
```
"# visuails-web" 
