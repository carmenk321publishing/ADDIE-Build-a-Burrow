# Build-a-Burrow: The ADDIE Adventure

An interactive, single-page simulation that teaches new instructional designers the ADDIE framework by having them design a real course instead of reading about the model.

**Live app:** https://carmenk321publishing.github.io/ADDIE-Build-a-Burrow/

<img width="1239" height="718" alt="Screenshot 2026-09-20 at 6 23 40 PM" src="https://github.com/user-attachments/assets/3e06f59b-0852-43a3-99f2-016adcb5d5fc"/>
 
---

## What it is

Most ADDIE training asks people to memorize five words and their purpose. This asks them to use the five phases on a course of their own choosing, one decision at a time, and to leave with something they can actually take to a stakeholder.

The framing device is a hillside burrow. As the designer works through each phase, the burrow gets built: a hole in a hill becomes a door, a room, a lit window, a garden. The metaphor is deliberate. Analysis looks like nothing from the outside, and that is exactly why new designers skip it.

Nothing is graded and nothing is locked. Phases can be completed in any order, and the feedback is written to sharpen thinking rather than to score it.

## How it works

The learner moves through four short steps, repeated per phase: explore and choose, build, review, continue.

Underneath that loop sit the five ADDIE phases, plus a sixth reflective step:

| Phase | What the learner decides |
| --- | --- |
| 1. Analyze | The performance problem, its root cause, the audience, whether learning is even the right solution, and what success would look like |
| 2. Design | Learning objectives, an audience branch, and a lesson blueprint (ESA, TTT, CLIL, task-based, or exam preparation) |
| 3. Develop | Delivery formats, an accessibility pass, chunking, and a pilot plan |
| 4. Implement | Delivery mode, where the course lives, stakeholders, and a launch timeline |
| 5. Evaluate | Summative assessment, completion tracking, which level of impact is being measured, and reinforcement |
| 6. Improve | What the next pass should change |

Each phase ends with a "Check my work" review. Every entry the learner writes is carried forward into a downloadable course design outline, so the simulation produces a usable artefact rather than a completion screen.

## Features

- **Rule-based feedback engine.** Responses are checked against the criteria that matter for each phase: unobservable verbs in objectives ("understand", "know", "be aware of"), a stated problem with no root cause behind it, a solution chosen before the gap was diagnosed, evaluation that does not point back at the objectives. Feedback separates what is working from what still needs another pass.
- **Exportable course design outline.** Everything entered is compiled into a formatted document, downloadable as a Word file or printable to PDF.
- **Inline glossary.** Highlighting any word on the page returns a definition in a popup at the selection. Lookups hit the Wiktionary REST API first, fall back to a secondary dictionary API, and finally offer a dictionary link.
- **Saved progress.** Work persists in the browser through `localStorage`, so a session can be left and resumed. No account, no server, no data leaving the device.
- **Reference modals.** Bloom's taxonomy verb tables, Universal Design for Learning principles, and guidance on reducing reading load, available at the point of need rather than front-loaded.
- **Progress made visible.** Five outlined blocks fill as phases are completed, and reviewed phases are marked separately from finished ones, so completing and reflecting are not treated as the same act.
- **Optional customisation.** The hillside can be decorated with unlocked items. There is no points economy and nothing is paywalled behind effort.
- **Light and dark themes**, switchable, both meeting contrast requirements.

## Instructional design grounding

The simulation is built on established practice rather than invented rules:

- **ADDIE** as the overall process model
- **Mager-style objectives** (condition, action, standard) with observable verbs
- **Bloom's revised taxonomy** for verb selection at the right cognitive level
- **Universal Design for Learning** for the accessibility and variability pass in Develop
- **Kirkpatrick-style levels** as the prompt behind "which level are you actually measuring"
- **Lesson blueprints** drawn from English language teaching practice, including ESA, TTT, CLIL, and task-based frameworks

## Technology

Vanilla HTML, CSS, and JavaScript. Around 2,700 lines across three files. No framework, no build step, no package manager, no dependencies to install, and no backend. Static hosting is all it needs.

```
index.html    markup, inline SVG symbol sprite, scene illustration
style.css     design tokens, layout, themes, motion
script.js     phase logic, feedback engine, glossary, persistence, export
```

### Running it locally

```bash
git clone <repository-url>
cd build-a-burrow
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`. Opening `index.html` directly from the filesystem mostly works, but a local server is recommended so the glossary lookups behave normally.

## Accessibility

- Full keyboard operation. Interactive cards are real buttons, with state exposed through `aria-expanded`.
- Meaning is never carried by colour alone. Feedback categories are distinguished by shape and icon as well as hue.
- Animation respects `prefers-reduced-motion`, which replaces the completion sequence with a static state.
- Live regions announce feedback and progress changes.
- Text content is written for a plain-language reading level, with a reading-load reduction guide included.

## Design system

The interface follows the Atlantis Learning Archives design charter: Be Vietnam Pro for headings, Lato for body text, a calm sea-and-kelp palette, and a custom SVG symbol set in place of emoji. Two accent colours are semantically reserved, coral for review reminders and gold for completion, so colour carries consistent meaning throughout.

## Authorship and attribution

Concept, learning design, pedagogical content, feedback criteria, information architecture, and testing by Carmen Khoury.

The code was generated by AI (Perplexity) working from my written specification and iterative direction. I did not hand-write the JavaScript. I designed what it had to do, why each phase asks what it asks, what counts as a good or weak answer, and what the learner should walk away with, then directed and tested the build through many rounds of revision.

I am naming that plainly because the distinction matters. This is a learning design and AI-direction portfolio piece, not a software engineering one.

## Status

A concept project, functional and publicly usable, built to demonstrate approach rather than to serve a specific client. Not formally validated with a learner cohort.

Possible next passes: an LLM-assisted feedback layer for open responses that rules cannot assess well, a facilitator version for use in live onboarding sessions, and SCORM or xAPI packaging for LMS delivery.

## Licence

To be confirmed before reuse. Please ask before adapting the pedagogical content or feedback criteria.
