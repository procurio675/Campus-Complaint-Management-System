# DAU Campus Complaint Resolve

A smart **Campus Complaint Management System** designed for **DAU Institute**, enabling students and staff to log, track, and resolve campus-related complaints in an efficient and transparent way.  
The system integrates **AI-powered classification** for auto-tagging complaints into relevant committees and prioritizing them based on urgency.

---

## Features

### 🔐 User Authentication
- Role-based login: **Student, Committee, Admin**.
- Secure session management and access control.
- Anonymous complaint submission supported.

### 📝 Complaint Submission & Tracking
- Students can submit complaints with **text + file attachments**.
- Complaints auto-classified by AI into:
  - **8 Committees:** Academic, Annual Fest, Cafeteria, Cultural, Hostel Management, Sports, Student Placement, Tech-Support.
  - **3 Priorities:** High, Medium, Low.
- Track complaint status: **Pending → In-Process → Resolved**.

### 📊 Dashboards
- **Student Dashboard:** View submitted complaints & statuses.
- **Committee Dashboard:** Manage assigned complaints, update progress.
- **Admin Dashboard:** Monitor all complaints across the campus.

### 🔔 Notifications & Escalations
- Email for complaint updates.
- Auto-escalation for overdue or highly negative (sentiment) complaints.

### 📈 Analytics
- Trends in complaint types and priorities.
- Committee performance (average resolution time, response rate).
- Feedback system for students after resolution.
- Filtering & search functionality.

### 📑 Reports
- Generate reports (CSV) for committees and admins.
- Privacy-aware → anonymous complaints stay masked.
- Export history maintained.

### 🛡 Security
- Protection of sensitive student data.
- Role-based restricted access.

---

## 🤖 AI Integration

- **Pre-trained LLM APIs** (Gemini / Groq / OpenAI) used for:
  - Auto-categorizing complaints into committees.
  - Predicting priority levels.
- **Feedback Loop:** Committee/Admin overrides are logged → reused in prompts → system gradually improves classification accuracy.

---

## 📅 Agile Sprint Plan (8 Weeks)

1. **Sprint 1:** User Authentication & Setup  
2. **Sprint 2:** Complaint Submission  
3. **Sprint 3:** Complaint Tracking & Dashboards  
4. **Sprint 4:** Notifications & Escalations  
5. **Sprint 5:** Analytics & Dashboards  
6. **Sprint 6:** Reports & Export  
7. **Sprint 7:** Security  
8. **Sprint 8:** Final Polish & Deployment  

---

## 👥 Team Roles

- **Frontend Team:** UI/UX design, dashboards, complaint submission form.  
- **Backend Team:** APIs, authentication, notifications.  
- **AI Team:** LLM integration, prompt engineering.  
- **All Teams:** Shared database design & integration.  

---
