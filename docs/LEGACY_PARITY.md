# Legacy portal parity checklist

Every sidebar item of the legacy Smart School portal (goturkey.gen.tr, session 2026-27)
and where it lives in the new Super Admin portal (`/admin/dashboard`). Module definitions:
`src/lib/erp/schema.js` (`SECTIONS`). Data migration: `scripts/legacy/transform.mjs` +
System Settings → Legacy Data Import.

Status: ✅ done · 🟡 done, works differently (see note) · ➖ not applicable

Every list screen has search, filters, add / edit / view / delete, bulk select-and-delete,
CSV import, CSV export and print (the legacy copy/Excel/CSV/PDF/print toolbar).

## Top bar
| Legacy | New | Status |
|---|---|---|
| current_session | Dashboard → "Current Session" (from General Settings) | ✅ |
| Search By Student Name | Dashboard → student search (name, admission no, passport, phone, email) → profile | ✅ |
| Quick Links | Sidebar sections | ✅ |
| Language flag | Dashboard language switcher (EN / TR / AR) | ✅ |
| WhatsApp | Front CMS Setting → WhatsApp URL | ✅ |

## Front Office
| Legacy | New tab | Status | Migrated |
|---|---|---|---|
| Admission Enquiry | Front Office → Admission Enquiry | ✅ | — (empty) |
| Visitor Book | Front Office → Visitor Book | ✅ | 178 |
| Phone Call Log | Front Office → Phone Call Log | ✅ | — (empty) |
| Postal Dispatch | Front Office → Postal Dispatch | ✅ | 1 |
| Postal Receive | Front Office → Postal Receive | ✅ | — |
| Complain | Front Office → Complain | ✅ | — |
| Setup Front Office (Purpose, Complaint Type, Source, Reference) | Front Office → Setup tabs | ✅ | — |

## Student Information
| Legacy | New tab | Status | Migrated |
|---|---|---|---|
| All Students | Student Information → All Students (with Paid column) | ✅ | 290 students |
| Student Details | Student Details (class/section/keyword criteria → profile: Profile, Fees, Documents & QR, Uploaded Documents, Timeline, Disable/Enable, Delete) | ✅ | |
| Student Admission | Student Admission (all legacy + system fields, auto admission no) | ✅ | |
| Online admission | Online Admission (public form at `/online_admission`) | ✅ | — (empty) |
| Disabled Students | Disabled Students | ✅ | |
| Multi Class Student | Multi Class Student | ✅ | |
| Bulk delete | Bulk Delete | ✅ | |
| Student Categories | Student Categories | ✅ | 24 |
| Student House | Student House | ✅ | — |
| Disable Reason | Disable Reason | ✅ | 2 |

## Documents & QR (custom legacy add-on: Üst Yazı / belge doğrulama)
| Legacy | New | Status | Migrated |
|---|---|---|---|
| top_text_documents (issued documents list) | Documents & QR → Issued Documents: view EN/TR, print, QR, edit, delete, issue new from per-type templates | ✅ | 301 documents (EN 301, TR 298) |
| Public verification `/belge_dogrulama` + `/belge_dogrulama/{code}/{type}` | Same URLs in the new app; old QR codes resolve once the domain points here | ✅ | |
| Document Requests | Documents & QR → Document Requests (also under System Settings) | ✅ | — (empty) |
| Form Services | Documents & QR → Form Services (also under System Settings) | ✅ | 16 |

## Fees Collection
| Legacy | New tab | Status | Migrated |
|---|---|---|---|
| collect_fees | Collect Fees (assign from Fees Master or ad-hoc, collect with discount/fine/mode, receipts, revert) | ✅ | 13 fee lines, 12 payments (₺3,686.96) |
| Search Fees Payment | Search Fees Payment | ✅ | |
| Search Due Fees | Search Due Fees | ✅ | |
| fees_master | Fees Master | ✅ | — |
| fees_group | Fees Group | ✅ | 2 |
| fees_type | Fees Type | ✅ | 2 |
| fees_discount | Fees Discount | ✅ | 1 |
| Fees Carry Forward | Fees Carry Forward | ✅ | |
| fees Reminder | Fees Reminder | ✅ | settings |

Legacy fee records whose student had been deleted (11 student sessions) are kept under disabled
placeholder students named "Unlinked legacy fee record #N" so finance history is complete.

## Income / Expenses
| Legacy | New | Status |
|---|---|---|
| Add Income / Search Income / Income Head | Income → Add Income, Search Income, Income Head | ✅ |
| Add Expense / Search Expense / Expense Head | Expenses → Add Expense, Search Expense, Expense Head | ✅ |

## Attendance
| Legacy | New | Status |
|---|---|---|
| Student Attendance | Attendance → Student Attendance (class/section/date, Present/Late/Absent/Half Day/Holiday, mark holiday) | ✅ |
| Attendance By Date | Attendance → Attendance By Date | ✅ |
| Staff Attendance | Human Resource → Staff Attendance | ✅ |

## Examinations
| Legacy | New tab | Status | Migrated |
|---|---|---|---|
| exam group | Exam Group | ✅ | 5 |
| exam_schedule | Exam Schedule | ✅ | |
| exam Result | Exam Result | ✅ | |
| Design Admit Card | Design Admit Card | ✅ | 1 |
| Print Admit Card | Print Admit Card (group, class, section, template) | ✅ | |
| Design Marksheet | Design Marksheet | ✅ | 2 |
| Print Marksheet | Print Marksheet (totals, %, grade) | ✅ | |
| marks_grade | Marks Grade | ✅ | 5 |

## Online Examinations
| Legacy | New | Status | Migrated |
|---|---|---|---|
| Online exam | Online Exam | 🟡 managed by staff; students sitting the exam online is not built (legacy student panel) | 1 |
| Question Bank (Bulk Delete, Import, Add) | Question Bank (bulk delete, CSV import, add) | ✅ | 15 (full text) |
| — | Online Exam Results (record attempts/scores for reports) | ✅ | |

## Lesson Plan
| Legacy | New | Status | Migrated |
|---|---|---|---|
| Manage Lesson Plan (by teacher) | Manage Lesson Plan (teacher filter) | ✅ | |
| Manage Syllabus Status | Manage Syllabus Status | ✅ | |
| Lesson | Lesson | ✅ | 1 |
| Topic | Topic | ✅ | 1 |

## Academics
| Legacy | New | Status | Migrated |
|---|---|---|---|
| class_timetable | Class Timetable | ✅ | |
| Teachers Timetable | Teachers Timetable (filter by teacher) | ✅ | |
| Assign Class Teacher | Assign Class Teacher | ✅ | |
| Promote Students | Promote Students (pass/fail, continue/leave) | ✅ | |
| Subject group | Subject Group | ✅ | 2 |
| Subjects | Subjects | ✅ | 40 |
| class | Class | ✅ | 18 |
| Sections | Sections | ✅ | 7 |

## Human Resource
| Legacy | New | Status | Migrated |
|---|---|---|---|
| Staff Directory | Staff Directory | ✅ | 15 |
| Staff Attendance | Staff Attendance | ✅ | |
| Payroll | Payroll | ✅ | |
| Approve Leave Request | Approve Leave Request | ✅ | |
| Apply Leave | Apply Leave | ✅ | |
| Leave Type | Leave Type | ✅ | |
| Teachers Rating | Teachers Rating | ✅ | |
| Department | Department | ✅ | 2 |
| Designation | Designation | ✅ | 3 |
| Disabled Staff | Disabled Staff | ✅ | 1 |

## Communicate
| Legacy | New | Status |
|---|---|---|
| Notice Board | Notice Board | ✅ |
| Send Email / SMS | Send Email / SMS + Log | 🟡 messages are recorded; actual sending needs the SMTP/SMS gateway wired server-side |

## Online Course
| Legacy | New | Status |
|---|---|---|
| Online Course | Online Course + Course Lessons | ✅ (legacy list empty) |
| Offline Payment | Offline Payment | ✅ |
| Online Course Report | Online Course Report (sell, purchase, trending) | ✅ |
| Setting | Setting | ✅ |

## Zoom Live Classes
| Legacy | New | Status |
|---|---|---|
| Live Classes / Live Meeting | Live Classes / Live Meeting (meeting URL, ID, password) | 🟡 no Zoom API — paste the meeting link |
| Live Classes Report / Live Meeting Report | Reports per status | ✅ |
| Setting | Setting | ✅ |

## Download Center
| Legacy | New | Status |
|---|---|---|
| Upload Content | Upload Content | ✅ |
| assignments / Study Material / Syllabus / Other Downloads | filtered tabs of Upload Content | ✅ |
| — | Homework | ✅ |

## Inventory
| Legacy | New | Status |
|---|---|---|
| Add Item Stock, Issue Item, Add Item, Item Category, Item Store, Item Supplier | Inventory tabs | ✅ |

## Certificate
| Legacy | New | Status | Migrated |
|---|---|---|---|
| Student certificate (placeholders, header/footer texts, sizes, background, photo) | Student Certificate | ✅ | 3 |
| Generate certificate | Generate Certificate — prints with QR; each is a verifiable type-9999 document | ✅ | |
| Student ID Card / Generate ID Card | Student ID Card / Generate ID Card | ✅ | 3 |
| Staff ID Card / Generate Staff ID Card | Staff ID Card / Generate Staff ID Card | ✅ | 2 |

## Front CMS
| Legacy | New | Status | Migrated |
|---|---|---|---|
| Event, Gallery, notice, Media Manager, Pages, Menus, Banner Images | Front CMS tabs | ✅ | 28 notices, 28 pages, 26 menu items |

## Alumni
| Legacy | New | Status |
|---|---|---|
| Manage Alumni / Events | Alumni → Manage Alumni / Events | ✅ |

## Reports
| Legacy | New | Status |
|---|---|---|
| Student Information (Student, Class & Section, Guardian, Student History, Login Credential, Class Subject, Admission, Sibling, Student Profile, Homework Evaluation, Gender Ratio, Student Teacher Ratio) | Reports → Student Information (all 12) | ✅ |
| Finance (fees statement, balance, collection, daily collection, by name, income, expense, income/expense group, payroll, online admission, online course) | Reports → Finance | ✅ |
| attendance | Reports → Attendance (student, by date, daily, class, staff) | ✅ |
| examinations | Reports → Examinations (results, rank, schedule) | ✅ |
| Online examinations | Reports → Online Examinations (exams, attend, rank) | ✅ |
| Lesson Plan | Reports → Lesson Plan | ✅ |
| Human Resource | Reports → Human Resource | ✅ |
| Alumni | Reports → Alumni | ✅ |
| User Log | Reports → User Log (super-admin logins logged going forward) | ✅ 3,505 imported |
| Audit Trail Report | Reports → Audit Trail (every insert/update/delete logged going forward) | ✅ 6,811 imported |

## System Settings
| Legacy | New | Status |
|---|---|---|
| general_settings (school, session, attendance type, biometric, language, date/time, currency, admission no auto-generation, logos) | General Settings | ✅ |
| Session Setting | Session Setting | ✅ (14) |
| Document Requests / Form Services | System Settings (and Documents & QR) | ✅ |
| notification_setting | Notification Setting | ✅ |
| SMS Setting / email_setting | SMS Setting / Email Setting | 🟡 stored; sending not wired. Passwords/API keys are not migrated |
| Payment Methods | Payment Methods | 🟡 Param POS credentials intentionally not migrated — re-enter server-side when online payment is wired |
| Print Header Footer | Print Header Footer | ✅ |
| Front CMS Setting | Front CMS Setting | ✅ |
| Roles Permissions | Roles Permissions | 🟡 roles + permission list migrated; the new portal is Super-Admin-only so they are not enforced |
| backup / restore | Backup / Restore (JSON) | ✅ |
| languages | Languages + Language Phrases | 🟡 stored; the new app uses its own EN/TR/AR translation files |
| Users | Users | ✅ (476 usernames; passwords are never migrated) |
| Modules / Custom Fields / Captcha Setting / System Fields / Student Profile Update / Online Admission / File Types | same names | ✅ |
| System Update | System Update | ➖ updates deploy automatically from GitHub via Vercel |

## Not migrated, on purpose
- Passwords of any kind (student, parent, staff, SMTP, payment gateway).
- 3 issued documents that return a server error on the legacy site itself.
