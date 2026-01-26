# 📖 Leafclutch Backend - Developer Guide

Welcome to the Leafclutch Backend! This document is designed to help frontend developers and future maintainers understand **how** the system works and **why** it was built this way.

---

## 🚀 1. Project Overview

### **What is this?**
This backend is the "Brain" of the Leafclutch Admin Dashboard. It manages all the content that appears on the main website—from the team members you see to the projects in the portfolio.

### **Admin-Only vs. Public**
*   **Admin-Only**: Currently, this entire API is designed for **Admins**. Every action (creating, updating, deleting) requires a secure login.
*   **Public**: The data managed here will eventually be consumed by the public website, but this specific dashboard is for internal management.

### **Core Principles**
*   **Domain-Driven**: We organize code by "What it is" (e.g., Projects, Members) rather than "How it's stored" (Tables).
*   **Safety First**: We use strict validation (Schemas) to ensure the frontend never sends "bad data" that could break the database.
*   **Simplicity**: We use clear, readable logic so anyone can jump in and understand the flow.

---

## 📁 2. Domain Breakdown

We have 5 main "Domains" in this project:

### **A. Members (The Team)**
*   **What it is**: Manages the people at Leafclutch.
*   **Core Entities**: `Member` (can be either a core Team member or an Intern).
*   **Design**: We use a single "Member" entity with a `role` flag. This makes it easy to list everyone together or filter them into separate pages on the frontend.

### **B. Services (What we sell)**
*   **What it is**: Manages the service packages offered to clients.
*   **Core Entities**: `Service`, `Technology`, and `Offering`.
*   **Design**: A Service is a "Package." It links to multiple Technologies (like React) and multiple Offerings (like SEO). We keep Tech and Offerings as separate "Master Data" so you can reuse them across different services.

### **C. Projects (Our Portfolio)**
*   **What it is**: Showcases the work we have completed.
*   **Core Entities**: `Project` and `Feedback`.
*   **Design**: Every project can have multiple client reviews (Feedback) attached to it. This allows us to show "Social Proof" directly next to our work.

### **D. Opportunities (Hiring)**
*   **What it is**: Manages job openings and internship calls.
*   **Core Entities**: `Opportunity`, `JobDetail`, `InternshipDetail`, and `Requirement`.
*   **Design**: We use a "Base + Detail" pattern. Every post is an Opportunity, but if it's a Job, it gets extra fields (like Salary); if it's an Internship, it gets different fields (like Duration).

### **E. Training (Learning)**
*   **What it is**: Manages courses and educational programs.
*   **Core Entities**: `Training`, `Mentor`, and `Benefit`.
*   **Design**: Courses are linked to Mentors. We store "Benefits" (what the student gets) as a simple list attached to each course.

---

## 🔗 3. Database Relationships (The "Connections")

To keep things simple, think of the connections like this:

*   **One-to-Many**:
    *   One **Project** has many **Feedbacks**.
    *   One **Opportunity** has many **Requirements**.
    *   One **Training** has many **Benefits**.
*   **Many-to-Many** (Managed via "Join Tables"):
    *   Many **Services** can use many **Technologies**.
    *   Many **Projects** can use many **Technologies**.
    *   Many **Trainings** can have many **Mentors**.

**Note for Frontend**: You never see the "Join Tables." You just send us a list of **IDs** (UUIDs), and the backend handles the complicated connection logic internally.

---

## 🛠 4. API Design Philosophy

We follow these rules to keep the API clean and predictable:

1.  **Schemas are Contracts**: If a field isn't in the Schema, the API will reject it. This prevents "mystery data" from entering the system.
2.  **UUIDs Everywhere**: We use long, unique strings (UUIDs) for IDs instead of simple numbers. This is more secure and professional.
3.  **PATCH for Updates**: We use `PATCH` instead of `PUT`. This means you only need to send the fields you want to change, not the whole object.
4.  **No Magic Strings**: We use "Enums" for fixed options (like `TEAM` vs `INTERN`). This prevents typos like "tem" or "internn."
5.  **Join Tables are Hidden**: The frontend only deals with IDs. For example, when creating a service, you just send `tech_ids: ["uuid1", "uuid2"]`.

---

## 🔄 5. Frontend Integration Flow

Here is how the frontend should interact with the API to create content:

### **Example: Creating a New Service**
1.  **Fetch Master Data**: Frontend calls `GET /admin/service-techs` to get the list of available technologies.
2.  **Render Dropdown**: Frontend shows these technologies in a multi-select dropdown.
3.  **User Selects**: The admin selects "React" and "Node.js".
4.  **Send Request**: Frontend sends the **IDs** of those selections to `POST /admin/services`.
    *   *Payload*: `{ "title": "Web Dev", "tech_ids": ["uuid-for-react", "uuid-for-node"] }`

This flow ensures that the frontend and backend are always in sync regarding "Master Data."

---

## 🚫 6. What Is Intentionally NOT Built

We made conscious choices to keep the first version focused:

*   **No Public APIs**: Currently, there are no endpoints for the public website. Those will be added in the next phase.
*   **No Bulk Actions**: You cannot delete 10 projects at once. You must delete them one by one for safety.
*   **No Image Hosting**: The backend expects a `photo_url`. You should upload images to a storage service (like appwrite Storage) and then send the link here.

---

*Happy Coding! If you have questions, check the [Swagger Docs](http://localhost:8000/docs) for the exact JSON formats.*
