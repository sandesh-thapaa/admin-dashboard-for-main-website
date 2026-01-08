# Image Upload Flow (Simple Guide)

This guide explains how image upload works in the system.
It is written in simple language so anyone can understand it.

---

## Big Picture

- The **backend does NOT store images**
- Images are stored in **Cloudinary**
- The backend stores **only the image URL**
- Only **admins** can upload and save images

The frontend handles the upload process.

---

## What the User Experiences

1. User selects an image from their computer
2. A small loading indicator is shown
3. When upload is finished, the **Save** button becomes active
4. User clicks **Save**
5. Data is saved successfully

To the user, this feels like **one simple action**.

---

## What Actually Happens (Behind the Scenes)

### Step 1: Get Upload Permission (Backend)

Frontend first asks the backend for permission to upload an image.

API:
POST /admin/uploads/signature

This step:
- Confirms the user is an admin
- Returns temporary permission details for uploading

---

### Step 2: Upload Image to Cloudinary (Frontend)

Using the permission from Step 1, frontend uploads the image directly to Cloudinary.

Result:
- Image is stored in Cloudinary
- Cloudinary returns a public image URL

Example URL:
https://res.cloudinary.com/.../image.png

---

### Step 3: Save Data (Backend)

When the user clicks **Save**, frontend sends the image URL to the backend.

Example:
{
  "photo_url": "https://res.cloudinary.com/.../image.png"
}

The backend:
- Saves the URL in the database
- Does NOT upload or store the image itself

---

## Important Rules

- Frontend uploads images, backend never does
- Backend only accepts image URLs
- Image upload happens before clicking Save
- Save button should be disabled until upload finishes

---

## One-Line Summary

Upload image → get image URL → click Save → backend stores the URL

---

End of document.
