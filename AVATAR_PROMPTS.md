# Making your avatar with an image AI

Use ChatGPT (image generation) or Google Gemini. Attach `source-photo.png` from this folder (or a clearer, front-facing photo of yourself) in the **same chat** for every step, so the character stays consistent.

## Step 1: the base character

Paste this with your photo attached:

> Turn the person in this photo into a 2D flat vector cartoon character for a personal portfolio website. Keep his real likeness at about 80 percent: the same face shape, thick wavy black hair pushed up and back with volume on top, thin silver rectangular-round glasses, thick straight eyebrows, moustache and light stubble, warm brown skin, early twenties. Clean modern flat illustration style (like a premium app mascot, not childish, not chibi), soft simple shading, crisp edges, no outlines heavier than 2px. Outfit: black button-up shirt with sleeves rolled to the forearm, dark blue jeans, white sneakers with a small orange accent. Full body, standing, facing the viewer, friendly confident expression. Transparent background, PNG, portrait 1024 x 1536, character centred with his feet touching the bottom edge and a little space above his head.

If the face is not close enough, reply: "Closer to the photo: [what is off, e.g. longer face, more volume in hair, thinner glasses]". Repeat until you like it.

## Step 2: the poses

Once you are happy with the base, ask for each pose **in the same chat**, one at a time, starting each message with:

> Same character, same style, same outfit, same proportions and framing (transparent background, 1024 x 1536, feet on the bottom edge). Pose:

| Save as | Pose to describe |
|---|---|
| `hello.png` | waving at the viewer with his right hand, left hand in his pocket, warm smile |
| `idle.png` | relaxed, one hand in his pocket, looking curious |
| `curious.png` | holding a magnifying glass up to one eye, other hand on his chin, intrigued |
| `glacier.png` | wearing an orange beanie, holding a tablet that shows a rising line chart, focused |
| `scam.png` | holding a phone showing a red warning icon, smirking, a fishing line with a hooked envelope in the other hand |
| `ocean.png` | holding up a yellow ocean-research float (a tall capsule with an antenna), small blue waves at his feet |
| `local.png` | holding an open laptop with a padlock on the screen, a crossed-out cloud icon floating beside him |
| `calm.png` | holding a warm mug with steam with both hands, eyes gently closed, peaceful |
| `building.png` | typing on a laptop held at waist height, concentrating, a small "</>" symbol floating nearby |
| `trophy.png` | raising a gold trophy above his head, big grin |
| `contact.png` | waving with one hand, holding an envelope in the other, welcoming smile |

## Step 3: drop them in

Download each PNG and put it in `public/avatar/` with exactly the file names above (for example `public/avatar/hello.png`).

The site checks that folder when it loads. As soon as `hello.png` is there, your generated character replaces the drawn one everywhere. He still walks while you scroll, hops between poses, breathes, sways toward the cursor and nods when he talks. Any pose you skip falls back to `idle.png`, then `hello.png`, so you can start with just one or two.

Tips:
- Transparent background matters. If the AI gives you a white background, ask it again for "transparent background PNG", or remove it with any background remover before saving.
- Keep every image the same size and framing, so he does not jump in size between poses.
