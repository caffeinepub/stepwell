# StepWell - Fitness & Wellbeing App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Step counter: users can manually log steps per day, with a daily goal (default 10,000 steps)
- Daily step progress bar and visual feedback (goal met celebration)
- Step history: view past 7 days of step counts in a chart/list
- Wellbeing check-in: daily mood/energy rating (1-5 scale with emoji)
- Wellbeing log: view recent check-in history
- Hydration tracker: log glasses of water per day (goal: 8 glasses)
- Quick tips section: rotating wellness tips displayed on the home screen
- Dashboard home screen combining steps, hydration, and mood summaries

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend (Motoko):
   - Store daily step entries (date, count) per user session
   - Store daily wellbeing check-ins (date, mood score 1-5, energy score 1-5)
   - Store daily hydration logs (date, glasses count)
   - Queries: get today's data, get last 7 days history for steps/wellbeing/hydration
   - Updates: log steps, log mood/energy, log hydration
   - Step goal and hydration goal stored per user

2. Frontend:
   - Home dashboard: summary cards for steps, hydration, mood today
   - Steps tab: manual step entry, progress ring/bar, 7-day history
   - Wellbeing tab: mood + energy check-in sliders/emoji picker, history
   - Hydration tab: water glass counter with tap-to-add UI
   - Wellness tips carousel on dashboard
   - Bottom navigation between tabs
