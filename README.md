# Gulaab Beauty Lounge: "In bloom"

Concept project 5 of 8 for the Aqoa Systems portfolio. A fictional ladies' salon in DHA Phase 5, Karachi, offering hair, skin, nails, makeup, mehndi and bridal services.

## What's in it
| Page | Signature moment |
|---|---|
| Home | A single 3D rose bud turns slowly in soft light. As you scroll its petals unfurl one by one, outer ring first. Loose petals drift past each section. |
| Services & prices | Every service with its price and duration. Hovering a service brings up its photo, floating beside the cursor and leaning with the movement. |
| Bridal | Three packages arrive as a fanned hand of cards. Pick any two and they straighten, slide apart and turn over side by side, with what only one includes marked in gold. A full comparison table and FAQs follow. |
| Gallery | The lookbook orbits the rose as a ring of arch-shaped images. A switch turns the ring into a rising spiral. Drag to spin, click a look to bring it forward, and click again to open it. |
| Book now | The booking flow, with the rose opening as you go. |
| 404 | A drawn rose, half open: "This petal drifted away." |

**Signature interaction:** booking has three steps, and each one opens a ring of petals: service, then stylist, then time. When all three are chosen the rose is in full bloom, and a summary card shows the duration and price. Confirming gives a booking reference, a calendar file with a 2-hour reminder, and a ready-written WhatsApp message.

Also included:
- A page transition: a feathered evening veil opens from where you click, carrying real petals across, then lifts from the centre while the new page rises into place.
- A faint shimmer that trails the cursor, like highlighter on skin.
- Headings in Instrument Serif, with Hanken Grotesk for reading, rising in line by line.
- A palette taken from the rose itself: ivory linen, deep wine-black evening rooms, petal rose, sage leaf and a touch of brass.

The site has no sound, by design.

## Stack
Vite · Three.js · GSAP + ScrollTrigger · Lenis · Barba.js · SplitType

The rose is procedural, so there are no model files:
- 40 petals sit on a golden-angle spiral, each bent round a cylinder so the bud is a true teardrop.
- As it opens, outer petals spread and their tips and edges roll back, while the centre stays furled.
- A painted petal texture (veins, a pale heart, darker rims), soft self-shadows, a light-through rim glow, dew drops, serrated leaves and thorns do the rest.
- The drifting petals on the pages are rendered from the same model (`public/img/petals/`).

## Run it
From a terminal:
```bash
npm install
npm run dev
```
The site uses ES modules, so it needs a server. Opening `index.html` by double-clicking won't work. Testing flags: `?lite` forces the lighter version, `?full` forces 3D.

## Deploy on Vercel
Import the repo, leave **Root Directory** at the repository root (`./`), and keep the detected **Vite** preset. `vercel.json` turns on clean URLs. Links like `/book?service=gold-facial` open the booking with that service chosen.

## Phones and lighter devices
- **Phones:** the rose uses a simpler model with 24 petals and no shadows, and the gallery ring becomes a swipeable carousel.
- **No WebGL:** devices without WebGL get a drawn rose that opens ring by ring in the same way.

Reduced-motion visitors get simple fades.

## Before publishing
- Search "Gulaab Beauty Lounge Karachi" on Google to check no real salon uses the name.
- Services, prices, stylists, packages and the address are placeholders. Everything lives in `src/data.js`.
- Booked slots are simulated. A real salon would add a staff booking calendar, appointment reminders, and bridal deposits through JazzCash or Easypaisa, as the brief suggests.
- Stylists are shown as monograms rather than stock portraits, since they're fictional people.

Photos from Unsplash (free licence), self-hosted as WebP in `public/img/p/`.
