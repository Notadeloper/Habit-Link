// Create new habit for user (group or inidividual)
// Get list of auth users havits
// Get habit details of a specific habit
// Update habit details
// Delete habit

/* Habit Tracking Routes
These endpoints log progress or activity on a habit.

POST /api/habit-tracking
Create a new tracking entry for a habit (e.g., mark the habit as completed for a day).

GET /api/habit-tracking?habitId=XYZ
Retrieve tracking logs for a specific habit.

PUT /api/habit-tracking/:trackingId
Update a tracking entry (if needed).

DELETE /api/habit-tracking/:trackingId
Delete a tracking entry.

Note: In many apps, streaks are computed or updated automatically when habit tracking is recorded, so you might not need separate streak endpoints. */