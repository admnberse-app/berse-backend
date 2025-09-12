# GitHub Organization Migration Guide

## Why Use a GitHub Organization?
- **Team collaboration**: Add multiple developers with different permission levels
- **Professional appearance**: Organizations look more professional for projects
- **Better organization**: Separate personal repos from project repos
- **Team management**: Manage access, teams, and permissions centrally

## Step 1: Create GitHub Organization

1. Go to: https://github.com/organizations/new
2. Fill in:
   - **Organization account name**: `nama-fund` or `bersemuka-org`
   - **Contact email**: Your email
   - **This organization belongs to**: My personal account
3. Choose: **Free plan** (unlimited public repos)
4. Click: **Create organization**
5. Skip: Invite members (you can do this later)

## Step 2: Transfer Repositories

### Transfer Frontend Repository (raihaan123/BerseMuka)
1. Go to: https://github.com/raihaan123/BerseMuka/settings
2. Scroll to bottom → **Danger Zone**
3. Click: **Transfer**
4. Enter repository name: `BerseMuka`
5. New owner: `your-org-name`
6. Click: **I understand, transfer this repository**

### Transfer Backend Repository (zaydmahdaly00/BerseMuka)
1. Go to: https://github.com/zaydmahdaly00/BerseMuka/settings
2. Follow same steps as above
3. Note: You might need to rename one repo since both are called "BerseMuka"
   - Suggestion: Rename to `BerseMuka-Backend` or merge into one repo

## Step 3: Update Local Git Configuration

Run the provided script:
```bash
# Edit the script first to set your org name
nano update-to-org.sh

# Change line: ORG_NAME="YOUR-ORG-NAME" 
# To: ORG_NAME="nama-fund"  # or your chosen name

# Run the script
chmod +x update-to-org.sh
./update-to-org.sh
```

Or manually update:
```bash
# View current remotes
git remote -v

# Update to new organization
git remote set-url origin https://github.com/nama-fund/BerseMuka.git
git remote set-url origin2 https://github.com/nama-fund/BerseMuka.git

# Verify changes
git remote -v
```

## Step 4: Update Deployment Services

### Netlify (Frontend)
1. Go to: https://app.netlify.com
2. Select your site: berse.app
3. Go to: **Site settings** → **Build & deploy** → **Continuous Deployment**
4. Click: **Link to a different repository**
5. Authorize: GitHub organization access if needed
6. Select: `nama-fund/BerseMuka`
7. Keep same build settings:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`

### Railway (Backend)
1. Go to: https://railway.app/dashboard
2. Select your project
3. Go to: **Settings** → **Source**
4. Disconnect GitHub
5. Reconnect and select: `nama-fund/BerseMuka` (or BerseMuka-Backend)
6. Ensure environment variables are still set:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CORS_ORIGIN`

## Step 5: Add Team Members

1. Go to: https://github.com/nama-fund (your org)
2. Click: **People** tab
3. Click: **Invite member**
4. Enter GitHub username or email
5. Choose role:
   - **Member**: Can see all repos, push to repos they have access to
   - **Owner**: Full admin access to organization

### Recommended Team Structure
```
Owners (Full Access):
- You (founder)
- Co-founder/CTO

Members (Write Access):
- Senior developers
- Regular developers

Outside Collaborators (Specific Repo Access):
- Contractors
- Part-time developers
```

## Step 6: Update Code References

Update any hardcoded GitHub URLs:

1. **verify-deployment.sh** - Line 39:
   ```bash
   # Old: https://github.com/raihaan123/BerseMuka/actions
   # New: https://github.com/nama-fund/BerseMuka/actions
   ```

2. **README.md** - Update badges and links:
   ```markdown
   <!-- Old -->
   [https://github.com/raihaan123/BerseMuka](...)
   
   <!-- New -->
   [https://github.com/nama-fund/BerseMuka](...)
   ```

3. **package.json** - Update repository field:
   ```json
   "repository": {
     "type": "git",
     "url": "git+https://github.com/nama-fund/BerseMuka.git"
   }
   ```

## Step 7: Benefits After Migration

### Organization Features You Get:
1. **Team discussions**: GitHub Discussions at org level
2. **Project boards**: Kanban boards for project management
3. **Packages**: Publish npm packages under org name
4. **GitHub Pages**: Organization site at `nama-fund.github.io`
5. **Security**: Security policies and advisories
6. **Insights**: Contribution analytics across repos

### Setting Up Teams:
```
nama-fund/
├── Teams/
│   ├── Frontend (access to frontend code)
│   ├── Backend (access to backend code)
│   ├── DevOps (access to deployment configs)
│   └── Admins (full access)
```

## Step 8: Post-Migration Checklist

- [ ] Organization created
- [ ] Repositories transferred
- [ ] Local git remotes updated
- [ ] Netlify reconnected
- [ ] Railway reconnected
- [ ] Team members invited
- [ ] GitHub URLs updated in code
- [ ] Test deployment pipeline
- [ ] Update any API webhooks
- [ ] Update CI/CD secrets if any

## Common Issues

### Issue: "Repository already exists"
**Solution**: Rename one repository before transfer (e.g., BerseMuka-Frontend and BerseMuka-Backend)

### Issue: "You need to be an organization owner"
**Solution**: Make sure you created the org with your account

### Issue: Netlify/Railway can't access org repos
**Solution**: 
1. Go to: https://github.com/settings/installations
2. Find Netlify/Railway
3. Click Configure
4. Add organization access

### Issue: Push fails after transfer
**Solution**: Update your git remote URLs using the script provided

## Future Enhancements

Once migrated, consider:
1. **Branch protection**: Require PR reviews for main branch
2. **CODEOWNERS**: Define who reviews what code
3. **Issue templates**: Standardize bug reports and feature requests
4. **GitHub Actions**: Set up CI/CD pipelines
5. **Security scanning**: Enable Dependabot and code scanning

## Support

For GitHub Organization help:
- Docs: https://docs.github.com/en/organizations
- Support: https://support.github.com

---

**Created**: December 2024
**For**: BerseMuka Project Migration