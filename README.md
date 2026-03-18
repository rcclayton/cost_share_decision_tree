# Cost Share Decision Tree Site

Static website for a cost share decision tree for Purdue Pre-Awards Specialists.

## Local preview

Open `index.html` in a browser.

## Publish to GitHub

From this folder:

```bash
git init
git add .
git commit -m "Initial static site"
```

Create a new GitHub repository (no README/.gitignore/license on GitHub), then:

```bash
git remote add origin <YOUR_GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```

## Deploy on Netlify

- In Netlify: “New site from Git” → select your GitHub repo.
- Build settings:
  - Build command: (leave blank)
  - Publish directory: `.`
