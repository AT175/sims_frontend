# SIMS — School Information Management System
## User Manual

**Version:** 1.0  
**Platform:** Web (https://simsgh.netlify.app)  
**Backend:** https://sims-backends-3.onrender.com/api  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [User Roles & Access](#3-user-roles--access)
4. [System Administrator Dashboard](#4-system-administrator-dashboard)
5. [Headmaster Dashboard](#5-headmaster-dashboard)
6. [Assistant Headmaster (Admin) Dashboard](#6-assistant-headmaster-admin-dashboard)
7. [Bursary Dashboard](#7-bursary-dashboard)
8. [Teacher Dashboard](#8-teacher-dashboard)
9. [Student Dashboard](#9-student-dashboard)
10. [Other Role Dashboards](#10-other-role-dashboards)
11. [Public School Website](#11-public-school-website)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Introduction

SIMS is a comprehensive School Information Management System designed for Ghanaian senior high schools and basic schools. It provides role-based dashboards for every aspect of school administration — from academics and bursary to domestic operations, student management, and public-facing school websites.

### Key Features

- **Multi-tenant architecture**: Each school is a separate tenant with its own branding, users, and data
- **Role-based access control**: 40+ roles with dedicated dashboards
- **Offline-capable**: Works with intermittent connectivity using IndexedDB caching
- **Public school website**: Each school gets a customizable public page with gallery, programmes, events, and more
- **Comprehensive modules**: Academics, Bursary, Registry, Domestic, Security, Health, Transport, Library, Sports, Counselling, and more

---

## 2. Getting Started

### Accessing the System

1. Open your web browser and navigate to **https://simsgh.netlify.app**
2. You will see the **School Directory** listing all registered schools
3. Click on your school to view its public website
4. Click the **"Portal Login"** button on the school website to access the login screen

### Logging In

1. Enter your **username** and **password** provided by your system administrator
2. Click **"Sign In"**
3. You will be redirected to your role-specific dashboard

### First-Time Login

- Your initial credentials are set by the System Administrator
- Contact your administrator if you cannot log in or have forgotten your password

### Logging Out

- Click the **"Logout"** button in the top-right corner of your dashboard
- You will be returned to your school's public website

---

## 3. User Roles & Access

SIMS supports the following primary roles, each with a dedicated dashboard:

| Role | Dashboard | Description |
|------|-----------|-------------|
| System Admin | System Admin | Manages all tenants, users, modules, subscriptions |
| Headmaster | Headmaster | Executive oversight, approvals, communication, discipline |
| Asst. Headmaster (Academic) | Academic | Academic operations, timetables, exams |
| Asst. Headmaster (Admin) | Admin | Admissions, compliance, facilities, SRC, discipline |
| Asst. Headmaster (Domestic) | Domestic | Boarding, kitchen, health, transport, cleaning |
| Teacher | Teacher | Subjects, lesson plans, assignments, gradebook, attendance |
| Student | Student | Profile, timetable, assignments, results, fees, library |
| Bursary | Bursary | Cash book, student accounts, procurement, feeding account |
| Accountant | Accountant | Payroll, financial reporting |
| Stores | Stores | Inventory, requisitions, stock management |
| Registry | Registry | Student records, admissions processing |
| Security | Security | Gate management, visitor logs, incident reports |
| Health | Health Centre | Student health records, clinic visits |
| Catering | Catering | Menu planning, feeding account, kitchen supplies |
| Transport | Transport | Vehicle management, trip logs |
| Senior Housemaster/Mistress | Senior House | Boarding house oversight, exeats |
| Housemaster/Mistress | House | House management, student welfare |
| Library & ICT | Library ICT | Book circulation, ICT resources |
| Sports & Clubs | Sports Clubs | Sports events, club management |
| Counselling | Counselling | Student counselling sessions, case tracking |
| PLC | PLC | Professional Learning Community meetings |
| Subject HOD | Subject HOD | Department management, teacher oversight |
| Chaplain | Chaplain | Spiritual activities, chapel services |
| Parent | Parent | View child's academic progress, fees, attendance |
| SRC | SRC | Student Representative Council affairs |
| Electoral Commission | Electoral Commission | Student elections management |
| PTA | PTA | Parent-Teacher Association management |
| Governing Board | Governing Board | Board of governors oversight |
| Exam Committee | Exam Committee | Examination planning and results |
| Internal Auditor | Internal Auditor | Financial audit and compliance |
| GES (National/Regional/District/SISO) | GES | GES oversight and inspection |

---

## 4. System Administrator Dashboard

The System Admin has the highest level of access and manages the entire SIMS platform.

### Navigation Menu

- **System Overview** — Platform health, connection status, total tenants and users
- **User Management** — Create, edit, suspend, or delete user accounts across all tenants
- **Tenants (Schools)** — Register new schools, view all registered tenants
- **School Configuration** — Configure school-level settings, offered levels, max students/staff
- **Website Settings** — Manage school public website branding (logo, banner, colours, gallery, programmes, events, testimonials, news)
- **Modules** — Enable or disable modules per tenant
- **Subscriptions & Payments** — Manage subscription plans and billing
- **Database & Sync** — Monitor database health and synchronization status
- **Backups** — View and manage system backups
- **System Logs** — View audit logs and system events

### Creating a New School (Tenant)

1. Go to **Tenants (Schools)**
2. Click **"Add School"**
3. Fill in the form:
   - **Tenant Key**: A unique URL-friendly identifier (e.g., `dumasua-presby`)
   - **School Name**: Full official name
   - **School Code**: GES school code
   - **School Level**: Choose from Basic, JHS, SHS, or Combined
   - **Offered Levels**: Select the class levels offered
   - **Region & District**: Location information
   - **Contact Details**: Phone, email, address
   - **Max Students / Max Staff**: Capacity limits
   - **Subscription Plan**: Choose plan and expiry date
   - **Headmaster Details**: Create the headmaster account (username, password, display name)
4. Click **"Save"** to create the tenant

### Creating Users

1. Go to **User Management**
2. Click **"Add User"**
3. Enter username, display name, email, and password
4. Select one or more **roles** to assign
5. Select the **tenant** (school) the user belongs to
6. Click **"Save"**
7. The generated password will be displayed — share it with the user

### Managing Website Branding

1. Go to **Website Settings**
2. Configure the following:
   - **Logo**: Upload or link the school logo
   - **Banner Image**: Set the hero banner image
   - **Primary & Secondary Colors**: School brand colors
   - **Motto, Mission, Vision**: School statements
   - **About Text**: School description
   - **Principal's Message**: Head's welcome message
   - **Programmes**: Add academic programmes with icons
   - **Gallery Images**: Add images to the public gallery
   - **Upcoming Events**: Add school events
   - **News Items**: Post news updates
   - **Testimonials**: Add community testimonials
   - **Staff Profiles**: Showcase key staff
   - **Contact Info**: Phone, email, address, region, district
   - **Social Media**: Facebook, Instagram, Twitter links
3. Click **"Save Branding"** to publish changes

---

## 5. Headmaster Dashboard

The Headmaster has executive oversight of the entire school.

### Navigation Menu

- **Executive Overview** — Key metrics: student count, fee collection rate, pending approvals, staff on leave
- **School-Wide Oversight** — Comprehensive view across all departments
- **Staff Directory & Appraisal** — View all staff, manage performance appraisals, approve leave requests
- **Approvals Inbox** — Review and approve/reject:
  - Budget revisions
  - Procurement requests
  - Discipline escalations
  - Policy changes
  - Leave requests
- **Reports & Analytics** — Generate reports on academics, finance, attendance, discipline
- **Communication** — Send broadcast messages to:
  - Everyone, All Staff, Teaching Staff, Non-Teaching Staff, All Students, Parents
  - Set priority: Normal, Important, Urgent
- **Discipline Case Log** — Track discipline cases with severity levels (minor, serious, critical)
- **User Management** — Create and manage users for the school
- **Access Control** — Manage module access for different roles
- **Today's Menu** — View the kitchen's daily menu
- **Website Settings** — Update the school's public website (same as System Admin's website settings)
- **Sync & Data Health** — Monitor data synchronization status

---

## 6. Assistant Headmaster (Admin) Dashboard

The Admin dashboard handles admissions, compliance, and administrative operations.

### Navigation Menu

- **Admin Overview** — Summary of pending tasks and key metrics
- **Approvals** — Process pending approval requests
- **Compliance Tracker** — Track GES compliance requirements and deadlines
- **Admissions** — Process new student admissions:
  - Review applications
  - Auto-assign houses and classes
  - Generate admission numbers
  - Manage document checklists
- **CSSPS Placement Upload** — Bulk import CSSPS-placed students
- **Prospectus Publishing** — Create and publish school prospectus
- **Admission Form Config** — Configure online admission form fields
- **Scratch Cards** — Generate and manage admission scratch cards
- **Student ID Cards** — Generate and print student ID cards
- **Staff Management** — Manage staff records and assignments
- **Facilities** — Report and track facility issues
- **Correspondence** — Manage incoming/outgoing official correspondence
- **Board of Governors** — Manage board meetings and minutes
- **Document Drafting** — Draft official documents and memos
- **Official Functions** — Plan and manage school events
- **SRC Affairs** — Oversee Student Representative Council activities
- **Discipline Oversight** — School-wide discipline monitoring
- **Meetings** — Schedule and minute meetings
- **Task Assignments** — Assign tasks to staff
- **Communication** — Send announcements and notices
- **Reports** — Generate administrative reports

---

## 7. Bursary Dashboard

The Bursary dashboard manages all financial operations of the school.

### Navigation Menu

- **Bursary Overview** — Cash balance, total income, total expense, pending items
- **Cash Book** — Record cash transactions (income and expenses) by category
- **Student Accounts** — Manage student fee accounts, track payments and outstanding balances
- **Petty Cash** — Manage petty cash requests and retirements
- **Imprest Accounts** — Track imprest disbursements and retirements
- **Procurement** — Manage procurement requisitions and approvals
- **Feeding Account** — Track feeding costs by meal type (breakfast, lunch, supper)
- **Boarding Supplies** — Manage boarding supply inventory and purchases
- **Disbursements** — Process approved budget submissions, kitchen requests, and payroll
- **Daily/Monthly Returns** — Generate financial returns for GES submission
- **Bursary Reports** — Comprehensive financial reporting

### Recording a Cash Transaction

1. Go to **Cash Book**
2. Click **"Add Transaction"**
3. Select type: **Income** or **Expense**
4. Choose a category
5. Enter the amount and description
6. Click **"Save"**

### Managing Student Fees

1. Go to **Student Accounts**
2. Search for the student by admission number or name
3. View their fee balance, payment history
4. Record new payments

---

## 8. Teacher Dashboard

The Teacher dashboard provides all tools for classroom management.

### Navigation Menu

- **Overview** — Summary of classes, assignments, and pending tasks
- **My Subjects & Classes** — View assigned subjects and class sections
- **My Timetable** — Weekly teaching schedule
- **Calendar** — View and add calendar events
- **Lesson Plans** — Create, edit, and mark lesson plans as taught
- **AI Lesson Assistant** — Generate lesson plans using AI
- **Lesson Materials** — Upload and manage teaching materials (documents, presentations, worksheets)
- **Audio & Videos Library** — Upload and manage audio/video resources
- **Live / Virtual Class** — Start, schedule, or cancel live virtual classes
- **Virtual Classroom** — Join interactive classroom with:
  - Camera/mic controls
  - Screen sharing
  - Whiteboard with drawing tools
  - Chat and hand-raising
- **Assignments & Assessments** — Create, publish, grade, and duplicate assignments
- **Question Bank / Quizzes** — Create questions, build quizzes, publish to students
- **Gradebook** — Enter and manage student grades
- **Performance Analytics** — View class and student performance trends
- **Class Attendance** — Mark daily attendance, view attendance statistics
- **Attendance Analytics** — Analyze attendance patterns
- **Student Roster** — View class lists with student details
- **Student Profile** — View individual student profiles
- **Behavior & Discipline** — Record behavior notes (positive/negative) with severity
- **Syllabus Tracker** — Track syllabus coverage progress
- **Remedial Support** — Identify and support struggling students
- **Parent Communication** — Log communication with parents
- **Class Announcements** — Post announcements to classes
- **Shared Resources** — Share resources with other teachers
- **Notifications** — View and manage notifications
- **PLC** — Professional Learning Community meetings and observations
- **Today's Menu** — View the kitchen's daily menu

### Creating an Assignment

1. Go to **Assignments & Assessments**
2. Click **"Add Assignment"**
3. Enter title, description, subject, class, due date
4. Set total marks
5. Click **"Save"** (status: Draft)
6. Click **"Publish"** when ready for students
7. Students can submit their work
8. Grade submissions individually or use **bulk grade**

### Marking Attendance

1. Go to **Class Attendance**
2. Select the class and date
3. Mark each student as: **Present**, **Absent**, **Late**, or **Excused**
4. Click **"Save"**

### Using the Virtual Classroom

1. Go to **Virtual Classroom**
2. Click **"Join Class"**
3. Use the toolbar to:
   - Toggle camera and microphone
   - Share your screen
   - Open the whiteboard
   - Send chat messages
4. Students can raise hands — click to lower hand when ready

---

## 9. Student Dashboard

The Student dashboard provides access to academic and personal information.

### Navigation Menu

- **Profile** — View personal information, admission details, house assignment
- **Timetable** — View weekly class schedule by day
- **My Classes** — View enrolled classes and subjects
- **Learning Materials** — Access materials shared by teachers
- **Assignments** — View, submit, and track assignments
- **Results & Report Cards** — View exam results and download report cards
- **Attendance** — View attendance records and statistics
- **Fees / Capitation** — View fee statements, payment history, and outstanding balances
- **Today's Menu** — View the daily dining menu
- **Library Account** — View borrowed books, due dates, and circulation history
- **Health Record** — View health centre visits and records
- **Exeat Requests** — Request permission to leave campus:
  - Select reason and destination
  - Set departure and return dates
  - Choose transport mode
- **Announcements** — View school and class announcements
- **Teacher Content** — Access teacher-shared materials, live sessions, videos, and quizzes
- **My House** — View house information and members
- **Messages** — Send messages to parents or staff
- **Elections** — Vote in SRC elections, view candidate manifestos, check results
- **Grievance / Feedback** — Submit feedback or grievances to the SRC or administration

### Submitting an Assignment

1. Go to **Assignments**
2. Find the assignment you want to submit
3. Click **"Submit"**
4. Enter your submission text and/or provide a file URL
5. Click **"Submit"**

### Requesting an Exeat

1. Go to **Exeat Requests**
2. Click **"Request Exeat"**
3. Fill in:
   - Reason (medical, family, personal, etc.)
   - Destination
   - Departure date and return date
   - Transport mode
4. Submit for approval

---

## 10. Other Role Dashboards

### Registry Dashboard
- Manage student records and enrollment
- Process admission applications
- Generate admission numbers
- Manage student transfers

### Domestic Dashboard
- Manage boarding houses
- Oversee kitchen and catering
- Monitor health centre operations
- Manage transport and cleaning services

### Stores Dashboard
- Manage inventory levels
- Process requisitions
- Track stock movements
- Generate stock reports

### Security Dashboard
- Manage gate entries and exits
- Log visitor records
- Report security incidents
- Track security patrols

### Health Centre Dashboard
- Record student clinic visits
- Manage medical records
- Track medication inventory
- Generate health reports

### Catering Dashboard
- Plan daily and weekly menus
- Manage kitchen supplies
- Track feeding costs
- Process kitchen financial requests

### Transport Dashboard
- Manage vehicle fleet
- Log trips and fuel consumption
- Track maintenance schedules
- Manage driver assignments

### Library & ICT Dashboard
- Manage book catalog
- Track book circulation (borrow/return)
- Manage ICT resources
- Generate library reports

### Sports & Clubs Dashboard
- Manage sports teams and fixtures
- Track club registrations
- Organize sporting events
- Record match results

### Counselling Dashboard
- Schedule counselling sessions
- Maintain case notes
- Track student wellbeing
- Generate referral letters

### PLC Dashboard
- Schedule PLC meetings
- Record peer observations
- Share teaching resources
- Track action items

### Parent Dashboard
- View child's academic performance
- Track attendance
- View fee statements
- Communicate with teachers
- View school announcements

---

## 11. Public School Website

Every school registered on SIMS gets a customizable public website accessible at:

```
https://simsgh.netlify.app/{tenant-key}
```

For example: `https://simsgh.netlify.app/dumasua-presby`

### Website Features

- **Hero Carousel**: Rotating banner images with school motto and welcome message
- **About Section**: School description, mission, vision, and principal's message
- **Programmes Section**: List of academic programmes with icons
- **Gallery Section**: Professional image gallery with:
  - Two large frames displayed side by side
  - Previous/Next navigation buttons
  - Page indicator dots
  - Click any image to open fullscreen lightbox viewer
  - Lightbox supports swipe navigation and arrow buttons
  - Images automatically paired by orientation (landscape with landscape, portrait with portrait)
- **Stats Band**: Dynamic statistics (student count, programmes, staff, levels) pulled from tenant data
- **Events Section**: Upcoming school events with dates
- **News Section**: Latest news updates
- **Testimonials**: Community testimonials with star ratings
- **Staff Profiles**: Key staff members with photos
- **Contact Information**: Phone, email, address, region, district
- **Social Media Links**: Facebook, Instagram, Twitter
- **Portal Login Button**: Access the login screen
- **Online Admissions**: Apply for admission online
- **Application Status Check**: Track admission application status

### Customizing the Website

The school website can be customized by:
1. **System Administrator** — via Website Settings in the System Admin dashboard
2. **Headmaster** — via Website Settings in the Headmaster dashboard

Both can update branding, gallery, programmes, events, news, and all other website content.

---

## 12. Troubleshooting

### Cannot Log In

- **Check your username and password** — Ensure correct spelling and case
- **Contact your System Administrator** — Your account may be suspended or locked
- **Check internet connection** — SIMS requires internet to authenticate

### Page Loads but Data Doesn't Appear

- **Check your internet connection** — SIMS caches data offline but needs connectivity to refresh
- **Try refreshing the page** — Press F5 or Ctrl+R
- **Clear browser cache** — If the page seems stuck on old content

### "School Not Found" Error

- **Verify the URL** — Ensure the tenant key in the URL is correct
- **Contact your administrator** — The school may not be registered yet

### Gallery Images Not Loading

- **Check image URLs** — Images must be accessible via public URLs
- **Wait for images to load** — The gallery pre-fetches image dimensions for optimal display
- **Try a hard refresh** — Press Ctrl+Shift+R

### Website Changes Not Appearing

- **Wait for deployment** — Changes pushed to GitHub may take 2-5 minutes to appear on Netlify
- **Hard refresh** — Press Ctrl+Shift+R to bypass browser cache
- **Check if the build succeeded** — Contact your administrator to verify the deployment

### Contact Support

For technical support, contact your school's **System Administrator** or the **SIMS support team**.

---

*This manual covers SIMS Version 1.0. Features and functionality may be updated over time.*
