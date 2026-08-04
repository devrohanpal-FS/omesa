# Omesa Marketing — Admin Panel Content Management Guide

This guide describes how to access the Admin Panel, manage site content, and sync backend data with the frontend website.

---

## 🔑 Admin Login Credentials

To access the custom CMS dashboard, navigate to the admin path in your browser:

- **Admin Login URL**: `http://localhost:5173/admin` (or `/admin` on your production domain)
- **Email Address**: `admin@omesa.in`
- **Password**: `AdminPassword123`

---

## 🎨 Managing Site Content

Once logged in, you will be redirected to the **Admin Dashboard** (`/admin/dashboard`). The dashboard features tabs on the left sidebar for managing different sections of the website.

### 1. Adding & Editing Portfolio Items (`🎨 Portfolio Tiles`)
To add projects to the **Portfolio** page (`/portfolio`):
1. Select the **Portfolio Tiles** tab in the admin panel.
2. Click **Create New / Add Item**.
3. Fill in the fields:
   - **Title**: Project name (e.g., *GAIL METRO*).
   - **Description**: Short teaser text for the project.
   - **Category**: **IMPORTANT:** Must match one of your service names exactly (e.g., `Exhibition Design & Turnkey Solutions`, `Advertising & Brand Consulting`) to ensure filtering works correctly.
   - **Long Description**: Paragraph shown inside the Project Details page.
   - **Images/Videos Gallery**: Click to upload or add media links.
4. Click **Save** to publish.

### 2. Managing Services (`🛠 Services`)
To add or update service pages (`/service/details/:id`):
1. Select the **Services** tab in the admin panel.
2. Fill in the fields:
   - **Title**: Name of the service (e.g., *Digital & Media Production*).
   - **One Liner**: Key tagline displayed at the top of the detail page.
   - **Description**: Summary description.
   - **Long Description**: Complete markdown/paragraph body.
   - **Related Services**: List related service titles separated by new lines.
   - **Image/Gallery**: Main image and secondary display screenshots.
3. Click **Save** to publish.

### 3. Managing Case Studies (`📚 Case Studies`)
To manage Case Study Detail pages (`/case-studies/:id`):
1. Select the **Case Studies** tab.
2. Fill in the fields:
   - **Title**: Title of the Case Study.
   - **Short Description**: Subheading text.
   - **Overview Description**: Detailed overview text.
   - **Long Description**: Long body text paragraph.
   - **Gallery**: Case study images.
   - **Key Deliverables**: Add deliverables with **Title** and optional **Description** (e.g. Title: `Messaging Framework Development`, Description: `Strategic Naming & Rebranding`). These will automatically render as bullet lists on the right sidebar of the Case Study detail page.
   - **Key Highlights**: Add custom bullet items to highlight achievements.
3. Click **Save** to publish.

---

## 🔄 How Spacing and Category Matching Work

- **Service Detail Portfolio Button**: On any service details page, the **Portfolio** button is pre-programmed to direct visitors to the `/portfolio?tab=<ServiceName>` page, which will pre-filter the portfolio tiles list to display only projects belonging to that service.
- **Deliverables Sidebar**: Deliverables entered for Case Studies will dynamically render inside a premium, vertical bullet list (`list-disc`) exactly matching the layout of the Services sidebar.
