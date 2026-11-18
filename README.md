# Eugene Marathon Training HQ

A personal training app for the 2027 Eugene Marathon (25 April 2027, goal 3:00–3:05).

It holds a 22-week plan, pushes each workout to a Garmin watch, shows the morning's recovery numbers next to the day's session, and collects written feedback after every run.

- Live app: private (it shows personal training data)
- Share card page: https://eugene-bay.vercel.app
- Case study: https://www.wendelfreitas.com/cases

## What is in here

| Folder | Contents |
|---|---|
| `app/` | The app page. `gen.py` generates `plan.json`; `garmin.py` turns each workout into Garmin's workout format; `build.py` assembles `index.html` from the `new_*` pieces and the base in `index_prev.html`. |
| `share/` | `card.html`, the standalone page that draws a run card and hands it to the phone's share sheet. It reads the run from the link's `#` fragment and stores nothing. |
| `tools/` | `card.py`, a Python version of the card for generating images offline. |

## How it runs

The app page is published as a Claude artifact. It reads live Garmin data through the owner's Garmin connector, so visitors see the plan but not the health numbers. Three scheduled Claude tasks do the routine work:

1. **Morning check** (daily, 4:45am ET): readiness, sleep, HRV, resting heart rate and weather, with a green, amber or red call for the day.
2. **Session feedback** (three times a day): compares the latest run with its target and writes a short review.
3. **Sunday review**: summarises the week, applies the fitness gate to the paces and syncs the next week to Garmin.

## Building

```
cd app
python3 gen.py      # writes plan.json
python3 build.py    # writes index.html
```

`share/card.html` is a single static file and can be hosted anywhere.

## Notes

Personal baseline values (weight, VO2 max, race prediction) are removed from `plan.json` in this repository. The app was designed and directed by Wendel de Freitas and written with Claude.
