# Usage Guide

## Getting Started

### Create an Account

1. Open the app in your browser
2. Click **Sign up** on the login screen
3. Enter your email and a password (minimum 6 characters)
4. Check your email for a confirmation link
5. After confirming, log in with your credentials

New accounts are created with the **user** role by default. Only the site owner has the **admin** role.

### Log In / Log Out

- Enter your email and password on the login screen and click **Log in**
- Your session persists across page refreshes
- Click **Log out** in the top-right corner to end your session

## Roles

There are two roles in the app:

- **Admin** (site owner): Can create, edit, and delete blog entries, manage their profile, and comment on entries
- **User** (registered visitor): Can read entries and comment on them

The Editor and Profile tabs in the navigation bar are only visible to admins.

## Writing an Entry (Admin Only)

1. Navigate to the **Editor** tab
2. Type a title in the title field at the top
3. Write your content in the main text area
4. Use the formatting toolbar to style your text:
   - **Bold**
   - *Italic*
   - **H2** and **H3** headings
   - **Bullet List**
   - **Quote**
5. Click **Publish** to save the entry

After publishing, you're automatically taken to the entries list.

## Viewing Entries

1. Navigate to the **Entries** tab
2. Each entry shows its publication date and title
3. Click **View entry** to read the full entry

All entries are publicly readable — no login required.

## Editing an Entry (Admin Only)

1. Navigate to the **Entries** tab
2. Click **Edit** on the entry you want to change
3. The editor loads with the existing title and content
4. Make your changes — the button will show **Update** instead of Publish
5. Click **Update** to save

The original publication date is preserved when you edit.

## Deleting an Entry (Admin Only)

1. Navigate to the **Entries** tab
2. Click **Delete** on the entry you want to remove
3. The entry is permanently removed and the list refreshes

## Commenting

1. Open any entry by clicking **View entry**
2. Scroll to the comments section at the bottom
3. Log in if you are not already signed in
4. Type your comment and click **Post**

Both admins and regular users can comment. You can delete your own comments.

## Things to Know

- The entries list and entry view are publicly readable
- Only admins can create, edit, or delete entries
- Any authenticated user can comment on entries
- Content is stored as rich text (HTML), so formatting is preserved
- Entries are listed newest-first
- An entry without a title will display as "Untitled" in the list
