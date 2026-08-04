# 🎨 Omesa Marketing — Admin Panel Management Guide

This guide provides step-by-step instructions for administrators to add, edit, and delete content across all sections of the Omesa Marketing website.

---

## 🔑 Accessing the Admin Panel

1. Open your browser and navigate to the admin login page:
   - **Local Development URL**: `http://localhost:5173/admin`
   - **Production URL**: `https://omesa.in/admin` (or your staging domain)
2. Enter the administrator credentials:
   - **Email Address**: `admin@omesa.in`
   - **Password**: `Admin@Omesa2026-`
3. Click **Sign In**. Upon successful authentication, you will be redirected to the **Admin Dashboard** (`/admin/dashboard`).

---

## 📺 Section-by-Section Management Guide

The Admin Panel features **10 content sections** accessible via the left sidebar. The management operations vary by section type:

### 1. ℹ️ About Us
*This section manages the "About Us" highlights on the homepage. It is a single-record section (no adding or deleting).*

* **How to Edit**:
  1. Click **About Us** in the sidebar.
  2. Modify the following fields:
     - **Heading**: The main title text (e.g. *Omesa Marketing is where strategy meets experience.*).
     - **Description**: Rich HTML content. You can write paragraphs, format text using bold (`B`), italic (`I`), create headers (`H3`), lists, or insert links using the built-in toolbar.
     - **CTA (Call to Action Link)**: Link/URL destination for the action button (e.g., `https://omesa.in`).
     - **Years of Experience**: A number representing your active years.
     - **Projects**: Total successful projects count.
     - **Satisfaction %**: Customer satisfaction percentage.
  3. Click **Save Changes** at the bottom.

---

### 2. 📺 Hero Banner
*This section manages the homepage splash banner (background image/video, title, and description). It is a single-record section.*

* **How to Edit**:
  1. Click **Hero Banner** in the sidebar.
  2. Update the fields:
     - **Title**: The main bold heading line.
     - **Second Line Text**: The secondary heading line.
     - **Description**: Brief paragraph summary.
     - **Video / Image URL**: Enter a direct URL to a video (MP4/WebM) or image, or click **Upload** to select a media file from your local computer.
  3. Click **Save Changes** at the bottom.

---

### 3. 🏢 Client Logos
*Manages the horizontal scrolling logobar of clients on the site.*

* **How to Add**:
  1. Click **Client Logos** in the sidebar.
  2. Click the **+ Add Record** button in the top right.
  3. Enter the **Logo Name** (for SEO alt-text/reference).
  4. Provide the **Logo Image** by entering a URL or clicking **Upload** to select an image from your computer.
  5. Click **Save Changes**.
* **How to Edit**:
  1. Locate the logo in the table and click **Edit** in the Actions column.
  2. Modify the name or logo image.
  3. Click **Save Changes**.
* **How to Delete**:
  1. Locate the logo in the table and click **Delete**.
  2. Confirm the prompt by clicking **OK**.

---

### 4. 🎨 Portfolio Tiles
*Manages the showcase tiles visible on the Portfolio page (`/portfolio`).*

* **How to Add**:
  1. Click **Portfolio Tiles** in the sidebar.
  2. Click the **+ Add Record** button.
  3. Fill in the fields:
     - **Title**: The name of the project.
     - **Description**: A short teaser sentence.
     - **Category**: **CRITICAL:** Must match a service title exactly (e.g. `Exhibition Design & Turnkey Solutions`) to ensure portfolio page filters work correctly.
     - **Long Description**: Paragraph body text displayed on the Project Details page.
     - **Image Gallery**: Enter image URLs, paste custom URLs, or click **Add File** to upload. You can re-arrange or delete items using the `✕` button.
     - **Project Thumbnail**: Main image shown on the portfolio grid.
     - **Project Video URL**: Direct link to a hosted video or embed link.
     - **Date**: Format as `YYYY-MM-DD`.
  4. Click **Save Changes**.
* **How to Edit**:
  1. Click **Edit** next to the target project in the list.
  2. Update the fields or gallery media as needed.
  3. Click **Save Changes**.
* **How to Delete**:
  1. Click **Delete** next to the project.
  2. Confirm the deletion prompt.

---

### 5. 💼 Services
*Manages detailed pages for each individual service offering.*

* **How to Add**:
  1. Click **Services** in the sidebar and click **+ Add Record**.
  2. Fill in the fields:
     - **Number**: Sequential indicator (e.g., `01`, `02`).
     - **Title**: Service name (e.g., *Digital & Media Production*).
     - **One Liner**: Key tagline displayed at the top of the detail page.
     - **Description**: Summary text.
     - **Long Description**: Complete descriptive body text.
     - **Related Services**: List titles of other related services, one per line.
     - **Image Attachments**: Add primary images or diagrams showing service details.
  3. Click **Save Changes**.
* **How to Edit / Delete**: Use the corresponding actions in the table view and confirm changes.

---

### 6. 📚 Case Studies
*Manages the case studies displaying custom metrics, deliverables, and highlights.*

* **How to Add**:
  1. Click **Case Studies** and select **+ Add Record**.
  2. Fill in the fields:
     - **Title**: Case Study name.
     - **Short Description**: Main summary tagline.
     - **Overview Description**: Overview body paragraph.
     - **Long Description**: Complete implementation body text.
     - **Gallery**: Media files illustrating the project milestones.
     - **Deliverables**: Add specific tasks completed (e.g., Icon: `⚙️`, Title: `Backend Architecture`, Description: `Database schema design`). These render on the detail sidebar.
     - **Key Highlights**: Add custom bullet items to highlight achievements.
  3. Click **Save Changes**.
* **How to Edit / Delete**: Click **Edit** to update custom lists/highlights, or **Delete** to discard.

---

### 7. 📅 Upcoming Events
*Manages public events listing on the site.*

* **How to Add**:
  1. Click **Upcoming Events** -> **+ Add Record**.
  2. Fill in the fields:
     - **Title**: Event name.
     - **Description**: Event details.
     - **Address / Location**: Where the event takes place.
     - **Date / Time**: Display date format.
     - **Image / Video**: Banner representing the event.
  3. Click **Save Changes**.
* **How to Edit / Delete**: Manage using standard actions in the list.

---

### 8. 💬 Testimonials
*Manages homepage reviews and client trust badges.*

* **How to Add**:
  1. Click **Testimonials** -> **+ Add Record**.
  2. Fill in the fields:
     - **Quote / Review Text**: The testimonial content.
     - **Author Name**: Client name.
     - **Author Position**: Client role (e.g. *Founder & CEO*).
     - **Company**: Client organization.
     - **Trust Badge**: Small label (e.g., *TRUSTED AGENCY*).
     - **Trust Title**: Header text.
     - **Trust Description**: Details of the collaboration.
     - **Review Count & Label**: General score highlights.
     - **Avatars**: Comma-separated avatar image URLs.
  3. Click **Save Changes**.
* **How to Edit / Delete**: Update user testimonials via the dashboard table actions.

---

### 9. 👥 Team Members
*Manages the team directory showing designations and display ordering.*

* **How to Add**:
  1. Click **Team Members** -> **+ Add Record**.
  2. Enter **Name**, **Designation**, **Image (Upload/URL)**, and **Display Order** (a number like `1`, `2`, `3` to order team members on the page).
  3. Click **Save Changes**.
* **How to Edit / Delete**: Use list actions to correct names or adjust ordering numbers.

---

### 10. 📨 Contact Inquiries
*Stores messages sent by clients through contact forms.*

* **How to View**:
  1. Click **Contact Inquiries** in the sidebar.
  2. Locate the inquiry in the table and click **View**.
  3. Read the message text in the read-only window.
* **How to Delete**:
  1. Locate the entry and click **Delete** to purge archived submissions.

---

## 💡 Best Practices and Tips

1. **Rich Formatting**: When writing lists or adding layout elements inside Description textareas (like in *About Us*), use standard HTML tag wrappers (`<p>`, `<b>`, `<h3>`, `<ul>`, `<li>`) for clean styling on the live website.
2. **Category Matching**: Ensure categories in *Portfolio Tiles* correspond directly to existing *Services* names so filters operate correctly.
3. **Upload Security**: Do not rename the `uploads` directory. Files uploaded are saved directly onto your server host under the `/uploads/` namespace.
