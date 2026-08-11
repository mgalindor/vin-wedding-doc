---
name: mk.open-dashboard
description: Regenerate the project database and open the summary dashboard in the browser
subtask: true
metadata:
    type: prompt
    version: "1.0.1"
    updated-at: "2026-06-15"
---

# Setup and Launch Dashboard

Execute these steps in sequence from the workspace root:

1. **Regenerate database**: Run `npx mddb ./` to generate the markdown.db file in the workspace root
2. **Verify database**: Check that `markdown.db` file exists in the workspace root
3. **Check port 3000**: If port 3000 is in use, kill the existing process before continuing
4. **Start web server**: Run `npx serve . -l 3000 ` from the workspace root (this serves all project files including /.gene2/dashboard/web/)
5. **Wait for server**: Wait until you see "Serving!" message in terminal
6. **Open dashboard**: Open browser at `http://localhost:3000/.gene2/dashboard/web/`
7. **Verify**: Confirm the dashboard loads and displays project data

## Critical Notes
- The server MUST be started from the workspace root, not from the dashboard folder
- `markdown.db` must be in the workspace root (not in dashboard folder)
- If port 3000 is already in use: Run `netstat -ano | findstr :3000` (Windows) or `lsof -i :3000` (Mac/Linux) to find the process and kill it
