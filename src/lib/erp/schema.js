// lib/erp/schema.js
// Declarative definition of every module carried over from the legacy Smart School
// portal (goturkey.gen.tr). Each sidebar SECTION has TABS (the legacy sub-menus).
// A tab is either:
//   { entity: "<key>" }   → generic list/search/create/edit/delete (CrudTable) over ENTITIES[key]
//   { custom: "<name>" }  → a purpose-built component (students, fees, documents, …)
//   { singleton: "<key>"} → a single settings document edited as a form (SETTINGS[key])
//
// Every ERP collection is prefixed "erp_" — firestore.rules grants Super Admin access to
// /erp_*/ by that prefix, so adding an entity here needs no rules change.
//
// Field types: text | textarea | html | number | money | date | time | email | phone |
//              select (options) | ref (collection + labelField) | refMulti | checkbox |
//              file | image | color

export const col = (key) => `erp_${key}`;

const t = (key, label, extra = {}) => ({ key, label, type: "text", ...extra });
const ta = (key, label, extra = {}) => ({ key, label, type: "textarea", ...extra });
const num = (key, label, extra = {}) => ({ key, label, type: "number", ...extra });
const money = (key, label, extra = {}) => ({ key, label, type: "money", ...extra });
const date = (key, label, extra = {}) => ({ key, label, type: "date", ...extra });
const time = (key, label, extra = {}) => ({ key, label, type: "time", ...extra });
const sel = (key, label, options, extra = {}) => ({ key, label, type: "select", options, ...extra });
const ref = (key, label, collection, labelField = "name", extra = {}) => ({ key, label, type: "ref", collection, labelField, ...extra });
const file = (key, label, extra = {}) => ({ key, label, type: "file", ...extra });
const chk = (key, label, extra = {}) => ({ key, label, type: "checkbox", ...extra });
const html = (key, label, extra = {}) => ({ key, label, type: "html", ...extra });

const STATUS = ["active", "inactive"];
const GENDER = ["Male", "Female"];

// ── Entities (generic CRUD) ────────────────────────────────────────────────────
export const ENTITIES = {
  // Front office
  enquiries: { title: "Admission Enquiry", fields: [t("name", "Name", { required: true }), t("phone", "Phone"), t("email", "Email"), ta("address", "Address"), ta("description", "Description"), ta("note", "Note"), date("date", "Date"), date("followUpDate", "Next Follow Up Date"), t("assigned", "Assigned"), ref("referenceId", "Reference", "references"), ref("sourceId", "Source", "sources"), ref("classId", "Class", "classes"), num("noOfChild", "Number Of Child"), sel("status", "Status", ["active", "passive", "dead", "won", "lost"])], list: ["name", "phone", "sourceId", "date", "followUpDate", "status"] },
  visitors: { title: "Visitor Book", fields: [ref("purposeId", "Purpose", "visitor_purposes"), t("name", "Name", { required: true }), t("phone", "Phone"), t("idCard", "ID Card"), num("noOfPeople", "Number Of Person"), date("date", "Date"), time("inTime", "In Time"), time("outTime", "Out Time"), ta("note", "Note"), file("document", "Attach Document")], list: ["purposeId", "name", "phone", "date", "inTime", "outTime"] },
  phone_calls: { title: "Phone Call Log", fields: [t("name", "Name"), t("phone", "Phone", { required: true }), date("date", "Date"), ta("description", "Description"), date("followUpDate", "Next Follow Up Date"), t("duration", "Call Duration"), ta("note", "Note"), sel("callType", "Call Type", ["Incoming", "Outgoing"])], list: ["name", "phone", "date", "followUpDate", "callType"] },
  postal_dispatch: { title: "Postal Dispatch", fields: [t("toTitle", "To Title", { required: true }), t("referenceNo", "Reference No"), ta("address", "Address"), ta("note", "Note"), t("fromTitle", "From Title"), date("date", "Date"), file("document", "Attach Document")], list: ["toTitle", "referenceNo", "fromTitle", "date"] },
  postal_receive: { title: "Postal Receive", fields: [t("fromTitle", "From Title", { required: true }), t("referenceNo", "Reference No"), ta("address", "Address"), ta("note", "Note"), t("toTitle", "To Title"), date("date", "Date"), file("document", "Attach Document")], list: ["fromTitle", "referenceNo", "toTitle", "date"] },
  complaints: { title: "Complain", fields: [ref("complaintTypeId", "Complaint Type", "complaint_types"), ref("sourceId", "Source", "sources"), t("complainBy", "Complain By", { required: true }), t("phone", "Phone"), date("date", "Date"), ta("description", "Description"), t("actionTaken", "Action Taken"), t("assigned", "Assigned"), ta("note", "Note"), file("document", "Attach Document")], list: ["complaintTypeId", "complainBy", "phone", "date"] },
  visitor_purposes: { title: "Purpose", fields: [t("name", "Purpose", { required: true }), ta("description", "Description")] },
  complaint_types: { title: "Complaint Type", fields: [t("name", "Complaint Type", { required: true }), ta("description", "Description")] },
  sources: { title: "Source", fields: [t("name", "Source", { required: true }), ta("description", "Description")] },
  references: { title: "Reference", fields: [t("name", "Reference", { required: true }), ta("description", "Description")] },

  // Student information (masters — the student records themselves are custom)
  categories: { title: "Student Categories", fields: [t("name", "Category", { required: true })] },
  houses: { title: "Student House", fields: [t("name", "Name", { required: true }), ta("description", "Description")] },
  disable_reasons: { title: "Disable Reason", fields: [t("name", "Reason", { required: true })] },
  online_admissions: { title: "Online Admission", fields: [t("referenceNo", "Reference No"), t("firstName", "First Name", { required: true }), t("lastName", "Last Name"), ref("classId", "Class", "classes"), ref("sectionId", "Section", "sections"), ref("formServiceId", "Service", "form_services", "title"), sel("gender", "Gender", GENDER), date("dob", "Date Of Birth"), t("mobile", "Mobile Number"), t("email", "Email"), t("passportNo", "Passport / ID No"), t("nationality", "Nationality"), t("fatherName", "Father Name"), t("motherName", "Mother Name"), ta("address", "Address"), file("document", "Document"), sel("formStatus", "Form Status", ["submitted", "not_submitted"]), sel("paymentStatus", "Payment Status", ["paid", "unpaid"]), chk("enrolled", "Enrolled"), date("submitDate", "Submit Date")], list: ["referenceNo", "firstName", "lastName", "classId", "mobile", "formStatus", "paymentStatus", "enrolled"] },

  // Fees
  fee_groups: { title: "Fees Group", fields: [t("name", "Name", { required: true }), ta("description", "Description")] },
  fee_types: { title: "Fees Type", fields: [t("name", "Name", { required: true }), t("code", "Fees Code", { required: true }), ta("description", "Description")] },
  fee_discounts: { title: "Fees Discount", fields: [t("name", "Name", { required: true }), t("code", "Discount Code", { required: true }), money("amount", "Amount", { required: true }), ta("description", "Description")] },
  fee_masters: { title: "Fees Master", fields: [ref("sessionId", "Session", "sessions"), ref("feeGroupId", "Fees Group", "fee_groups", "name", { required: true }), ref("feeTypeId", "Fees Type", "fee_types", "name", { required: true }), date("dueDate", "Due Date"), money("amount", "Amount", { required: true }), sel("fineType", "Fine Type", ["none", "percentage", "fix"]), num("finePercentage", "Percentage"), money("fineAmount", "Fine Amount")], list: ["sessionId", "feeGroupId", "feeTypeId", "dueDate", "amount", "fineType"] },

  // Income / expense
  income_heads: { title: "Income Head", fields: [t("name", "Income Head", { required: true }), ta("description", "Description")] },
  income: { title: "Income", fields: [ref("headId", "Income Head", "income_heads", "name", { required: true }), t("name", "Name", { required: true }), t("invoiceNo", "Invoice Number"), date("date", "Date"), money("amount", "Amount", { required: true }), file("document", "Attach Document"), ta("description", "Description")], list: ["name", "invoiceNo", "headId", "date", "amount"] },
  expense_heads: { title: "Expense Head", fields: [t("name", "Expense Head", { required: true }), ta("description", "Description")] },
  expenses: { title: "Expense", fields: [ref("headId", "Expense Head", "expense_heads", "name", { required: true }), t("name", "Name", { required: true }), t("invoiceNo", "Invoice Number"), date("date", "Date"), money("amount", "Amount", { required: true }), file("document", "Attach Document"), ta("description", "Description")], list: ["name", "invoiceNo", "headId", "date", "amount"] },

  // Examinations
  exam_groups: { title: "Exam Group", fields: [t("name", "Name", { required: true }), sel("examType", "Exam Type", ["General Purpose (Pass/Fail)", "School Based Grading System", "College Based Grading System", "GPA Grading System", "Average Passing"]), ta("description", "Description")], list: ["name", "examType", "description"] },
  exam_schedules: { title: "Exam Schedule", fields: [ref("examGroupId", "Exam Group", "exam_groups", "name", { required: true }), t("exam", "Exam", { required: true }), ref("sessionId", "Session", "sessions"), ref("classId", "Class", "classes"), ref("sectionId", "Section", "sections"), ref("subjectId", "Subject", "subjects"), date("date", "Date"), time("startTime", "Start Time"), num("duration", "Duration (minutes)"), t("room", "Room No"), num("maxMarks", "Max Marks"), num("minMarks", "Min Marks")], list: ["examGroupId", "exam", "classId", "subjectId", "date", "startTime"] },
  exam_results: { title: "Exam Result", fields: [ref("examScheduleId", "Exam", "exam_schedules", "exam", { required: true }), ref("studentId", "Student", "students", "fullName", { required: true }), num("marks", "Marks"), chk("absent", "Absent"), ta("note", "Note")], list: ["examScheduleId", "studentId", "marks", "absent"] },
  grades: { title: "Marks Grade", fields: [sel("examType", "Exam Type", ["General Purpose (Pass/Fail)", "School Based Grading System", "College Based Grading System", "GPA Grading System", "Average Passing"]), t("name", "Grade Name", { required: true }), num("percentUpto", "Percent Upto"), num("percentFrom", "Percent From"), num("gradePoint", "Grade Point"), ta("description", "Description")], list: ["examType", "name", "percentFrom", "percentUpto", "gradePoint"] },
  admit_cards: { title: "Design Admit Card", fields: [t("template", "Template", { required: true }), t("heading", "Heading"), t("title", "Title"), t("examName", "Exam Name"), t("schoolName", "School Name"), t("examCenter", "Exam Center"), ta("footerText", "Footer Text"), image("leftLogo", "Left Logo"), image("rightLogo", "Right Logo"), image("sign", "Sign"), image("background", "Background Image"), chk("showName", "Name"), chk("showFatherName", "Father Name"), chk("showMotherName", "Mother Name"), chk("showDob", "Date Of Birth"), chk("showAdmissionNo", "Admission No"), chk("showRollNo", "Roll Number"), chk("showAddress", "Address"), chk("showGender", "Gender"), chk("showPhoto", "Photo"), chk("showClass", "Class"), chk("showSection", "Section")], list: ["template", "heading", "examName"] },
  marksheets: { title: "Design Marksheet", fields: [t("template", "Template", { required: true }), t("heading", "Heading"), t("title", "Title"), t("examName", "Exam Name"), t("schoolName", "School Name"), t("examCenter", "Exam Center"), ta("bodyText", "Body Text"), ta("footerText", "Footer Text"), t("printingDate", "Printing Date"), image("headerImage", "Header Image"), image("leftLogo", "Left Logo"), image("rightLogo", "Right Logo"), image("leftSign", "Left Sign"), image("middleSign", "Middle Sign"), image("rightSign", "Right Sign"), image("background", "Background Image")], list: ["template", "heading", "examName"] },

  // Online examinations
  online_exams: { title: "Online Exam", fields: [t("title", "Exam", { required: true }), sel("quizType", "Quiz", ["Exam", "Quiz"]), date("from", "Exam From"), date("to", "Exam To"), time("duration", "Duration"), num("attempts", "Attempt"), num("passingPercentage", "Passing Percentage"), chk("published", "Publish Exam"), chk("publishResult", "Publish Result"), html("description", "Description")], list: ["title", "quizType", "from", "to", "attempts", "published"] },
  questions: { title: "Question Bank", fields: [ref("subjectId", "Subject", "subjects"), sel("questionType", "Question Type", ["Single Choice", "Multiple Choice", "True/False", "Descriptive"]), sel("level", "Question Level", ["Low", "Medium", "High"]), ref("classId", "Class", "classes"), ref("sectionId", "Section", "sections"), html("question", "Question", { required: true }), t("optA", "Option A"), t("optB", "Option B"), t("optC", "Option C"), t("optD", "Option D"), t("optE", "Option E"), t("answer", "Answer")], list: ["subjectId", "questionType", "level", "question"] },

  // Lesson plan
  lessons: { title: "Lesson", fields: [ref("classId", "Class", "classes"), ref("sectionId", "Section", "sections"), ref("subjectId", "Subject", "subjects"), t("name", "Lesson Name", { required: true })], list: ["classId", "sectionId", "subjectId", "name"] },
  topics: { title: "Topic", fields: [ref("lessonId", "Lesson", "lessons", "name", { required: true }), t("name", "Topic Name", { required: true }), sel("status", "Status", ["Incomplete", "Complete"]), date("completeDate", "Complete Date")], list: ["lessonId", "name", "status", "completeDate"] },
  syllabus: { title: "Manage Lesson Plan", fields: [ref("topicId", "Topic", "topics", "name", { required: true }), date("date", "Date"), time("from", "Time From"), time("to", "Time To"), t("subTopic", "Sub Topic"), t("lectureYoutubeUrl", "Lecture Youtube URL"), file("lectureVideo", "Lecture Video"), file("attachment", "Attachment"), ta("teachingMethod", "Teaching Method"), ta("generalObjectives", "General Objectives"), ta("previousKnowledge", "Previous Knowledge"), ta("comprehensiveQuestions", "Comprehensive Questions"), html("presentation", "Presentation")], list: ["topicId", "date", "from", "to", "subTopic"] },

  // Academics
  classes: { title: "Class", fields: [t("name", "Class", { required: true }), { key: "sectionIds", label: "Sections", type: "refMulti", collection: "sections", labelField: "name" }], list: ["name", "sectionIds"] },
  sections: { title: "Sections", fields: [t("name", "Section Name", { required: true })] },
  subjects: { title: "Subjects", fields: [t("name", "Subject Name", { required: true }), sel("type", "Subject Type", ["Theory", "Practical"]), t("code", "Subject Code")], list: ["name", "code", "type"] },
  subject_groups: { title: "Subject Group", fields: [t("name", "Name", { required: true }), ref("classId", "Class", "classes"), { key: "sectionIds", label: "Sections", type: "refMulti", collection: "sections", labelField: "name" }, { key: "subjectIds", label: "Subjects", type: "refMulti", collection: "subjects", labelField: "name" }, ta("description", "Description")], list: ["name", "classId", "sectionIds", "subjectIds"] },
  timetables: { title: "Class Timetable", fields: [ref("classId", "Class", "classes", "name", { required: true }), ref("sectionId", "Section", "sections"), sel("day", "Day", ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], { required: true }), ref("subjectId", "Subject", "subjects"), ref("staffId", "Teacher", "staff", "name"), time("from", "Time From"), time("to", "Time To"), t("room", "Room No")], list: ["classId", "sectionId", "day", "subjectId", "staffId", "from", "to", "room"] },
  class_teachers: { title: "Assign Class Teacher", fields: [ref("classId", "Class", "classes", "name", { required: true }), ref("sectionId", "Section", "sections"), { key: "staffIds", label: "Class Teacher", type: "refMulti", collection: "staff", labelField: "name" }], list: ["classId", "sectionId", "staffIds"] },

  // Human resource
  staff: { title: "Staff Directory", fields: [t("staffId", "Staff ID", { required: true }), ref("roleId", "Role", "roles"), ref("designationId", "Designation", "designations"), ref("departmentId", "Department", "departments"), t("name", "First Name", { required: true }), t("surname", "Last Name"), t("fatherName", "Father Name"), t("motherName", "Mother Name"), t("email", "Email"), sel("gender", "Gender", GENDER), date("dob", "Date Of Birth"), date("dateOfJoining", "Date Of Joining"), t("phone", "Phone"), t("emergencyPhone", "Emergency Contact Number"), sel("maritalStatus", "Marital Status", ["Single", "Married", "Widowed", "Separated", "Not Specified"]), image("photo", "Photo"), ta("currentAddress", "Current Address"), ta("permanentAddress", "Permanent Address"), t("qualification", "Qualification"), t("workExperience", "Work Experience"), ta("note", "Note"), t("panNumber", "PAN Number"), t("epfNo", "EPF No"), money("basicSalary", "Basic Salary"), sel("contractType", "Contract Type", ["Permanent", "Probation"]), t("shift", "Work Shift"), t("location", "Work Location"), num("leaves", "Leaves"), t("bankAccountTitle", "Account Title"), t("bankAccountNo", "Bank Account Number"), t("bankName", "Bank Name"), t("ifsc", "IFSC Code"), t("bankBranch", "Bank Branch Name"), t("facebook", "Facebook URL"), t("twitter", "Twitter URL"), t("linkedin", "Linkedin URL"), t("instagram", "Instagram URL"), file("resume", "Resume"), file("joiningLetter", "Joining Letter"), file("otherDocument", "Other Documents"), sel("status", "Status", ["active", "disabled"])], list: ["staffId", "name", "surname", "roleId", "departmentId", "designationId", "phone", "status"] },
  staff_attendance: { title: "Staff Attendance", fields: [ref("staffId", "Staff", "staff", "name", { required: true }), date("date", "Date", { required: true }), sel("status", "Attendance", ["Present", "Late", "Absent", "Half Day", "Holiday"]), ta("note", "Note")], list: ["staffId", "date", "status", "note"] },
  payroll: { title: "Payroll", fields: [ref("staffId", "Staff", "staff", "name", { required: true }), sel("month", "Month", ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]), num("year", "Year"), money("basic", "Basic Salary"), money("earnings", "Earning"), money("deductions", "Deduction"), money("tax", "Tax"), money("netSalary", "Net Salary"), sel("status", "Status", ["generated", "paid"]), sel("paymentMode", "Payment Mode", ["Cash", "Cheque", "Bank Transfer"]), date("paymentDate", "Payment Date"), ta("note", "Note")], list: ["staffId", "month", "year", "netSalary", "status", "paymentDate"] },
  leave_types: { title: "Leave Type", fields: [t("name", "Name", { required: true })] },
  leave_requests: { title: "Leave Request", fields: [ref("staffId", "Staff", "staff", "name", { required: true }), ref("leaveTypeId", "Leave Type", "leave_types"), date("applyDate", "Apply Date"), date("from", "Leave From"), date("to", "Leave To"), ta("reason", "Reason"), ta("note", "Note"), file("document", "Attach Document"), sel("status", "Status", ["pending", "approved", "disapproved"])], list: ["staffId", "leaveTypeId", "from", "to", "applyDate", "status"] },
  staff_ratings: { title: "Teachers Rating", fields: [ref("staffId", "Staff", "staff", "name", { required: true }), ref("studentId", "Student", "students", "fullName"), num("rate", "Rating (1-5)"), ta("comment", "Comment"), sel("status", "Status", ["pending", "approved"])], list: ["staffId", "studentId", "rate", "comment", "status"] },
  departments: { title: "Department", fields: [t("name", "Name", { required: true })] },
  designations: { title: "Designation", fields: [t("name", "Name", { required: true })] },

  // Communicate
  notices: { title: "Notice Board", fields: [t("title", "Title", { required: true }), html("message", "Message"), date("noticeDate", "Notice Date"), date("publishOn", "Publish On"), { key: "visibleTo", label: "Message To", type: "multiCheck", options: ["Student", "Parent", "Admin", "Teacher", "Accountant", "Librarian", "Receptionist", "Super Admin"] }], list: ["title", "noticeDate", "publishOn", "visibleTo"] },
  messages: { title: "Email / SMS Log", fields: [t("title", "Title", { required: true }), sel("channel", "Send Through", ["Email", "SMS", "Both"]), sel("audience", "Message To", ["Group", "Individual", "Class"]), ta("recipients", "Recipients"), html("message", "Message"), date("sentAt", "Date"), sel("status", "Status", ["draft", "logged"])], list: ["title", "channel", "audience", "sentAt", "status"] },

  // Download center / homework
  contents: { title: "Upload Content", fields: [t("title", "Content Title", { required: true }), sel("type", "Content Type", ["Assignments", "Study Material", "Syllabus", "Other Download"], { required: true }), chk("allSuperAdmin", "Available For Super Admin"), chk("allStudents", "Available For All Students"), ref("classId", "Class", "classes"), ref("sectionId", "Section", "sections"), date("uploadDate", "Upload Date"), ta("description", "Description"), file("file", "Content File")], list: ["title", "type", "classId", "uploadDate"] },
  homework: { title: "Homework", fields: [ref("classId", "Class", "classes", "name", { required: true }), ref("sectionId", "Section", "sections"), ref("subjectId", "Subject", "subjects"), date("homeworkDate", "Homework Date"), date("submissionDate", "Submission Date"), date("evaluationDate", "Evaluation Date"), file("document", "Attach Document"), html("description", "Description")], list: ["classId", "sectionId", "subjectId", "homeworkDate", "submissionDate"] },

  // Inventory
  item_categories: { title: "Item Category", fields: [t("name", "Item Category", { required: true }), ta("description", "Description")] },
  item_stores: { title: "Item Store", fields: [t("name", "Item Store Name", { required: true }), t("code", "Item Stock Code"), ta("description", "Description")] },
  item_suppliers: { title: "Item Supplier", fields: [t("name", "Name", { required: true }), t("phone", "Phone"), t("email", "Email"), ta("address", "Address"), t("contactPerson", "Contact Person Name"), t("contactPhone", "Contact Person Phone"), ta("description", "Description")] },
  items: { title: "Item", fields: [t("name", "Item", { required: true }), ref("categoryId", "Item Category", "item_categories"), t("unit", "Unit"), ta("description", "Description")], list: ["name", "categoryId", "unit"] },
  item_stock: { title: "Add Item Stock", fields: [ref("itemId", "Item", "items", "name", { required: true }), ref("supplierId", "Supplier", "item_suppliers"), ref("storeId", "Store", "item_stores"), num("quantity", "Quantity", { required: true }), money("purchasePrice", "Purchase Price"), date("date", "Date"), file("document", "Attach Document"), ta("description", "Description")], list: ["itemId", "supplierId", "storeId", "quantity", "purchasePrice", "date"] },
  item_issues: { title: "Issue Item", fields: [ref("itemId", "Item", "items", "name", { required: true }), sel("userType", "User Type", ["Staff", "Student"]), t("issueTo", "Issue To"), t("issuedBy", "Issued By"), date("issueDate", "Issue Date"), date("returnDate", "Return Date"), num("quantity", "Quantity"), ta("note", "Note"), sel("status", "Status", ["issued", "returned"])], list: ["itemId", "issueTo", "issueDate", "returnDate", "quantity", "status"] },

  // Online course
  courses: { title: "Online Course", fields: [t("title", "Title", { required: true }), ref("classId", "Class", "classes"), ref("sectionId", "Section", "sections"), ref("staffId", "Assign Teacher", "staff", "name"), money("price", "Price"), money("discount", "Discount (%)"), chk("freeCourse", "Free Course"), t("outcomes", "Course Outcomes"), image("thumbnail", "Course Thumbnail"), t("previewUrl", "Course Preview URL"), html("description", "Description"), sel("status", "Status", ["published", "unpublished"])], list: ["title", "classId", "staffId", "price", "status"] },
  course_lessons: { title: "Course Lessons", fields: [ref("courseId", "Course", "courses", "title", { required: true }), t("section", "Section"), t("title", "Lesson Title", { required: true }), sel("lessonType", "Lesson Type", ["Video", "PDF", "Text", "Document"]), t("videoUrl", "Video URL"), t("duration", "Duration"), file("attachment", "Attachment"), html("summary", "Summary")], list: ["courseId", "section", "title", "lessonType", "duration"] },
  course_payments: { title: "Offline Payment", fields: [ref("courseId", "Course", "courses", "title", { required: true }), ref("studentId", "Student", "students", "fullName", { required: true }), money("amount", "Amount"), date("paymentDate", "Payment Date"), t("paymentMode", "Payment Mode"), t("reference", "Reference"), ta("note", "Note"), sel("status", "Status", ["pending", "approved", "rejected"])], list: ["courseId", "studentId", "amount", "paymentDate", "status"] },

  // Live classes
  live_classes: { title: "Live Classes", fields: [t("title", "Class Title", { required: true }), date("date", "Class Date"), time("time", "Time"), num("duration", "Class Duration (Minutes)"), ref("staffId", "Class Host", "staff", "name"), ref("classId", "Class", "classes"), ref("sectionId", "Section", "sections"), t("url", "Meeting URL"), t("meetingId", "Meeting ID"), t("password", "Meeting Password"), ta("description", "Description"), sel("status", "Status", ["awaited", "cancelled", "finished"])], list: ["title", "date", "time", "staffId", "classId", "status"] },
  live_meetings: { title: "Live Meeting", fields: [t("title", "Meeting Title", { required: true }), date("date", "Meeting Date"), time("time", "Time"), num("duration", "Meeting Duration (Minutes)"), { key: "staffIds", label: "Staff", type: "refMulti", collection: "staff", labelField: "name" }, t("url", "Meeting URL"), t("meetingId", "Meeting ID"), t("password", "Meeting Password"), ta("description", "Description"), sel("status", "Status", ["awaited", "cancelled", "finished"])], list: ["title", "date", "time", "staffIds", "status"] },

  // Front CMS
  cms_events: { title: "Event", fields: [t("title", "Event Title", { required: true }), t("venue", "Venue"), date("start", "Event Start"), date("end", "Event End"), image("image", "Featured Image"), html("description", "Description"), t("slug", "URL Slug")], list: ["title", "venue", "start", "end"] },
  cms_gallery: { title: "Gallery", fields: [t("title", "Title", { required: true }), image("image", "Featured Image"), html("description", "Description"), t("slug", "URL Slug")], list: ["title", "slug"] },
  cms_notices: { title: "News / Notice", fields: [t("title", "Title", { required: true }), t("slug", "URL Slug"), date("date", "Date"), image("image", "Featured Image"), html("description", "Description"), t("metaTitle", "Meta Title"), ta("metaDescription", "Meta Description"), ta("metaKeywords", "Meta Keyword"), chk("published", "Published")], list: ["title", "slug", "date", "published"] },
  cms_media: { title: "Media Manager", fields: [t("title", "Title", { required: true }), file("file", "File"), t("videoUrl", "Video URL")], list: ["title", "file", "videoUrl"] },
  cms_pages: { title: "Pages", fields: [t("title", "Title", { required: true }), t("slug", "URL Slug"), sel("pageType", "Page Type", ["Standard", "Event", "Notice", "Gallery"]), image("image", "Featured Image"), html("description", "Description"), t("metaTitle", "Meta Title"), ta("metaDescription", "Meta Description"), ta("metaKeywords", "Meta Keyword"), chk("published", "Published")], list: ["title", "slug", "pageType", "published"] },
  cms_menus: { title: "Menus", fields: [t("menu", "Menu", { required: true }), t("title", "Menu Item", { required: true }), t("slug", "Slug"), t("externalUrl", "External URL"), chk("openNewTab", "Open In New Tab"), t("parent", "Parent Item"), num("order", "Order")], list: ["menu", "title", "slug", "externalUrl", "order"] },
  cms_banners: { title: "Banner Images", fields: [t("title", "Title"), image("image", "Banner Image", { required: true }), t("link", "Link"), num("order", "Order")], list: ["title", "image", "link", "order"] },

  // Alumni
  alumni: { title: "Manage Alumni", fields: [ref("studentId", "Student", "students", "fullName", { required: true }), ref("sessionId", "Pass Out Session", "sessions"), t("currentEmail", "Current Email"), t("currentPhone", "Current Phone"), t("occupation", "Occupation"), ta("address", "Address"), image("photo", "Photo")], list: ["studentId", "sessionId", "currentEmail", "currentPhone", "occupation"] },
  alumni_events: { title: "Alumni Events", fields: [t("title", "Event Title", { required: true }), sel("eventFor", "Event For", ["All Alumni", "Class"]), ref("sessionId", "Pass Out Session", "sessions"), ref("classId", "Class", "classes"), date("from", "Event From"), date("to", "Event To"), html("note", "Note"), image("photo", "Photo")], list: ["title", "eventFor", "from", "to"] },

  // Custom legacy add-on (Holistence): priced services shown on the online admission form
  form_services: { title: "Form Services", fields: [t("title", "Title", { required: true }), money("price", "Price"), ref("classId", "Class", "classes"), ref("sectionId", "Section", "sections"), sel("status", "Status", STATUS)], list: ["title", "price", "classId", "status"] },
  document_requests: { title: "Document Requests", fields: [ref("studentId", "Student", "students", "fullName", { required: true }), t("code", "Code"), sel("documentType", "Document", ["1", "2", "3", "4", "5", "6", "9999"]), ref("formServiceId", "Service", "form_services", "title"), money("price", "Price"), date("receivedAt", "Received At"), sel("status", "Status", ["pending", "issued", "rejected"]), ta("note", "Note")], list: ["studentId", "code", "documentType", "receivedAt", "status"] },

  // System settings
  sessions: { title: "Session", fields: [t("name", "Session", { required: true }), chk("active", "Active Session")], list: ["name", "active"] },
  roles: { title: "Roles", fields: [t("name", "Role", { required: true }), chk("system", "System Role"), ta("permissions", "Permissions (one per line)")], list: ["name", "system"] },
  custom_fields: { title: "Custom Fields", fields: [sel("belongsTo", "Field Belongs To", ["Student", "Staff"], { required: true }), sel("fieldType", "Field Type", ["Input", "Number", "Textarea", "Select", "Multiselect", "Checkbox", "Date", "Link"]), t("name", "Field Name", { required: true }), t("values", "Field Values (comma separated)"), num("gridColumn", "Grid (Bootstrap Column)"), chk("required", "Required"), chk("onTable", "On Table"), chk("visibleOnStudentPanel", "Visible On Student Panel")], list: ["belongsTo", "name", "fieldType", "required", "onTable"] },
  file_types: { title: "File Types", fields: [t("name", "File Extension / MIME", { required: true }), num("maxSizeKb", "Max Size (KB)")], list: ["name", "maxSizeKb"] },
  portal_users: { title: "Users", fields: [t("name", "Name", { required: true }), t("username", "Username"), t("email", "Email"), sel("userType", "Role", ["student", "parent", "staff"]), ref("studentId", "Student", "students", "fullName"), sel("status", "Status", ["active", "disabled"])], list: ["name", "username", "email", "userType", "status"] },
  modules: { title: "Modules", fields: [t("name", "Module", { required: true }), chk("enabledSystem", "System"), chk("enabledStudent", "Student"), chk("enabledParent", "Parent")], list: ["name", "enabledSystem", "enabledStudent", "enabledParent"] },
  user_log: { title: "User Log", fields: [t("user", "Users"), t("role", "Role"), t("ip", "IP Address"), t("loginAt", "Login Time"), t("userAgent", "User Agent")], list: ["user", "role", "ip", "loginAt"], readOnly: true },
  audit_log: { title: "Audit Trail Report", fields: [t("message", "Message"), t("user", "Users"), t("ip", "IP Address"), t("action", "Action"), t("platform", "Platform"), t("agent", "Agent"), t("at", "Date Time")], list: ["message", "user", "action", "at"], readOnly: true },
};

function image(key, label, extra = {}) { return { key, label, type: "image", ...extra }; }

// ── Singletons (settings forms) ────────────────────────────────────────────────
export const SETTINGS = {
  general: { title: "General Setting", fields: [t("schoolName", "School Name", { required: true }), t("schoolCode", "School Code"), ta("address", "Address"), t("phone", "Phone"), t("email", "Email"), ref("sessionId", "Session", "sessions"), sel("sessionStartMonth", "Session Start Month", ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]), t("dateFormat", "Date Format"), t("timezone", "Timezone"), t("currency", "Currency"), t("currencySymbol", "Currency Symbol"), t("language", "Language"), chk("rtl", "Language RTL Text Mode"), t("taxOffice", "Tax Office / Registry"), t("companyNumber", "Number"), t("taxNumber", "Company Tax Number"), t("signatoryTitle", "Signatory Title"), t("signatoryName", "Signatory Name"), t("website", "Web Addresses"), t("gsm", "GSM"), image("logo", "Print Logo"), image("adminLogo", "Admin Logo"), image("headerLogoLeft", "Document Header Logo (Left)"), image("headerLogoCenter", "Document Header Logo (Center)"), image("headerLogoRight", "Document Header Logo (Right)"), ta("documentNotice", "Document Footer Notice (EN)"), ta("documentNoticeTr", "Document Footer Notice (TR)"), num("feeDueDays", "Fees Due Days"), chk("teacherRestricted", "Teacher Restricted Mode"), chk("onlineAdmission", "Online Admission"), t("mobileAppUrl", "Mobile App API URL")] },
  print_header_footer: { title: "Print Header Footer", fields: [image("feeReceiptHeader", "Fees Receipt Header Image"), html("feeReceiptFooter", "Fees Receipt Footer"), image("payslipHeader", "Payslip Header Image"), html("payslipFooter", "Payslip Footer"), image("onlineAdmissionHeader", "Online Admission Receipt Header Image"), html("onlineAdmissionFooter", "Online Admission Receipt Footer")] },
  notification: { title: "Notification Setting", fields: [chk("studentAdmissionEmail", "Student Admission — Email"), chk("studentAdmissionSms", "Student Admission — SMS"), chk("feesSubmissionEmail", "Fees Submission — Email"), chk("feesSubmissionSms", "Fees Submission — SMS"), chk("absentAttendanceEmail", "Absent Attendance — Email"), chk("absentAttendanceSms", "Absent Attendance — SMS"), chk("examResultEmail", "Exam Result — Email"), chk("examResultSms", "Exam Result — SMS"), chk("loginCredentialEmail", "Login Credential — Email"), chk("loginCredentialSms", "Login Credential — SMS"), chk("homeworkEmail", "Homework — Email"), chk("feesReminderEmail", "Fees Reminder — Email"), chk("onlineAdmissionEmail", "Online Admission — Email"), ta("templates", "Templates / Notes")] },
  sms: { title: "SMS Setting", fields: [sel("gateway", "SMS Gateway", ["None", "Clickatell", "Twilio", "MSG91", "Text Local", "SMS Country", "Bulk SMS", "Custom"]), t("senderId", "Sender ID"), t("username", "Username / Account SID"), t("apiKey", "API Key / Auth Token (stored server-side only when wired up)"), t("phone", "Registered Phone"), chk("enabled", "Enabled")] },
  email: { title: "Email Setting", fields: [sel("engine", "Email Engine", ["SendMail", "SMTP"]), t("smtpServer", "SMTP Server"), num("smtpPort", "SMTP Port"), t("smtpUsername", "SMTP Username"), sel("smtpSecurity", "SMTP Security", ["None", "SSL", "TLS"]), t("fromEmail", "From Email"), t("fromName", "From Name"), chk("enabled", "Enabled")] },
  payment_methods: { title: "Payment Methods", fields: [sel("activeGateway", "Active Gateway", ["None", "PayPal", "Stripe", "PayU", "CCAvenue", "Instamojo", "Paystack", "Razorpay", "Paytm", "Midtrans", "Pesapal", "Flutterwave", "iPay Africa", "JazzCash", "Billplz", "SSLCommerz", "Walkingm", "Mollie", "Cashfree", "Payfast", "Toyyibpay", "Twocheckout", "Skrill", "Payhere", "Onepay", "Bank Transfer"]), t("accountName", "Bank / Account Name"), t("iban", "IBAN"), t("swift", "SWIFT"), ta("instructions", "Payment Instructions"), chk("offlinePayment", "Offline Bank Payment Enabled")] },
  front_cms: { title: "Front CMS Setting", fields: [chk("enabled", "Front CMS"), t("theme", "Current Theme"), sel("sidebar", "Sidebar", ["Enabled", "Disabled"]), t("sidebarOptions", "Sidebar Option"), chk("languageRtl", "Language RTL Text Mode"), image("logo", "Logo"), image("favicon", "Favicon"), html("footerText", "Footer Text"), t("cookieConsent", "Cookie Consent"), t("whatsappUrl", "WhatsApp URL"), t("facebookUrl", "Facebook URL"), t("twitterUrl", "Twitter URL"), t("youtubeUrl", "Youtube URL"), t("googlePlusUrl", "Google Plus"), t("linkedinUrl", "Linkedin URL"), t("instagramUrl", "Instagram URL"), t("pinterestUrl", "Pinterest URL"), ta("googleAnalytics", "Google Analytics")] },
  captcha: { title: "Captcha Setting", fields: [chk("userLogin", "User Login"), chk("adminLogin", "Admin Login"), chk("onlineAdmission", "Online Admission"), chk("contactUs", "Contact Us"), chk("complain", "Complain")] },
  system_fields: { title: "System Fields", fields: ["admissionNo", "rollNo", "firstName", "middleName", "lastName", "class", "section", "gender", "dob", "category", "religion", "caste", "mobile", "email", "admissionDate", "photo", "bloodGroup", "house", "height", "weight", "measurementDate", "fatherName", "fatherPhone", "fatherOccupation", "motherName", "motherPhone", "motherOccupation", "guardianName", "currentAddress", "permanentAddress", "bankAccountNo", "bankName", "ifsc", "nationalId", "localId", "rte", "previousSchool", "note", "passportNo", "nationality"].map(k => chk(k, k)) },
  student_profile_update: { title: "Student Profile Update", fields: [chk("allowEdit", "Allow Student/Parent To Edit Profile"), ...["firstName", "lastName", "gender", "dob", "mobile", "email", "photo", "fatherName", "fatherPhone", "motherName", "currentAddress", "permanentAddress", "nationality", "passportNo"].map(k => chk(`edit_${k}`, `Editable: ${k}`))] },
  online_admission: { title: "Online Admission Setting", fields: [chk("enabled", "Online Admission"), chk("paymentRequired", "Online Admission Payment"), money("fee", "Online Admission Form Fees"), html("instructions", "Online Admission Instructions"), html("terms", "Terms & Conditions"), file("formFile", "Admission Form (download)"), ...["passportNo", "nationality", "fatherName", "motherName", "address", "document", "photo"].map(k => chk(`field_${k}`, `Field: ${k}`))] },
  fees_reminder: { title: "Fees Reminder", fields: [chk("before1", "Before 1 Day"), num("before1Days", "Days"), chk("before2", "Before 2nd Reminder"), num("before2Days", "Days"), chk("after1", "After 1 Day"), num("after1Days", "Days"), chk("after2", "After 2nd Reminder"), num("after2Days", "Days")] },
  live_class_setting: { title: "Live Class Setting", fields: [sel("provider", "Provider", ["Zoom", "Google Meet", "Jitsi", "Other"]), t("apiKey", "API Key"), chk("parentLiveClass", "Parent Live Class"), chk("useTeacherAccount", "Use Teacher API Credential")] },
  online_course_setting: { title: "Online Course Setting", fields: [chk("guestLogin", "Guest User Login"), chk("guestPurchase", "Guest User Purchase"), html("aboutText", "About Text")] },
};

// ── Sidebar sections → tabs (mirrors the legacy menu, in the same order) ─────────
export const SECTIONS = [
  { id: "student_info", icon: "👥", label: "Student Information", tabs: [
    { id: "details", label: "Student Details", custom: "students" },
    { id: "admission", label: "Student Admission", custom: "studentAdmission" },
    { id: "online_admission", label: "Online Admission", entity: "online_admissions" },
    { id: "disabled", label: "Disabled Students", custom: "disabledStudents" },
    { id: "multiclass", label: "Multi Class Student", custom: "multiClass" },
    { id: "bulk_delete", label: "Bulk Delete", custom: "bulkDelete" },
    { id: "categories", label: "Student Categories", entity: "categories" },
    { id: "houses", label: "Student House", entity: "houses" },
    { id: "disable_reasons", label: "Disable Reason", entity: "disable_reasons" },
  ] },
  { id: "documents", icon: "🔏", label: "Documents & QR", tabs: [
    { id: "issued", label: "Issued Documents", custom: "documents" },
    { id: "requests", label: "Document Requests", entity: "document_requests" },
    { id: "form_services", label: "Form Services", entity: "form_services" },
  ] },
  { id: "fees", icon: "💰", label: "Fees Collection", tabs: [
    { id: "collect", label: "Collect Fees", custom: "feesCollect" },
    { id: "search_payment", label: "Search Fees Payment", custom: "feesSearchPayment" },
    { id: "search_due", label: "Search Due Fees", custom: "feesDue" },
    { id: "master", label: "Fees Master", entity: "fee_masters" },
    { id: "group", label: "Fees Group", entity: "fee_groups" },
    { id: "type", label: "Fees Type", entity: "fee_types" },
    { id: "discount", label: "Fees Discount", entity: "fee_discounts" },
    { id: "carry_forward", label: "Fees Carry Forward", custom: "feesCarryForward" },
    { id: "reminder", label: "Fees Reminder", singleton: "fees_reminder" },
  ] },
  { id: "income", icon: "📈", label: "Income", tabs: [
    { id: "income", label: "Add Income", entity: "income" },
    { id: "heads", label: "Income Head", entity: "income_heads" },
  ] },
  { id: "expenses", icon: "📉", label: "Expenses", tabs: [
    { id: "expenses", label: "Add Expense", entity: "expenses" },
    { id: "heads", label: "Expense Head", entity: "expense_heads" },
  ] },
  { id: "front_office", icon: "🏢", label: "Front Office", tabs: [
    { id: "enquiry", label: "Admission Enquiry", entity: "enquiries" },
    { id: "visitors", label: "Visitor Book", entity: "visitors" },
    { id: "calls", label: "Phone Call Log", entity: "phone_calls" },
    { id: "dispatch", label: "Postal Dispatch", entity: "postal_dispatch" },
    { id: "receive", label: "Postal Receive", entity: "postal_receive" },
    { id: "complaints", label: "Complain", entity: "complaints" },
    { id: "purpose", label: "Setup: Purpose", entity: "visitor_purposes" },
    { id: "complaint_type", label: "Setup: Complaint Type", entity: "complaint_types" },
    { id: "source", label: "Setup: Source", entity: "sources" },
    { id: "reference", label: "Setup: Reference", entity: "references" },
  ] },
  { id: "attendance", icon: "🗓️", label: "Attendance", tabs: [
    { id: "student", label: "Student Attendance", custom: "studentAttendance" },
    { id: "staff", label: "Staff Attendance", entity: "staff_attendance" },
  ] },
  { id: "exams", icon: "📝", label: "Examinations", tabs: [
    { id: "groups", label: "Exam Group", entity: "exam_groups" },
    { id: "schedule", label: "Exam Schedule", entity: "exam_schedules" },
    { id: "result", label: "Exam Result", entity: "exam_results" },
    { id: "admit_design", label: "Design Admit Card", entity: "admit_cards" },
    { id: "admit_print", label: "Print Admit Card", custom: "printAdmitCard" },
    { id: "marksheet_design", label: "Design Marksheet", entity: "marksheets" },
    { id: "marksheet_print", label: "Print Marksheet", custom: "printMarksheet" },
    { id: "grades", label: "Marks Grade", entity: "grades" },
  ] },
  { id: "online_exams", icon: "💻", label: "Online Examinations", tabs: [
    { id: "exams", label: "Online Exam", entity: "online_exams" },
    { id: "questions", label: "Question Bank", entity: "questions" },
  ] },
  { id: "lesson_plan", icon: "📚", label: "Lesson Plan", tabs: [
    { id: "manage", label: "Manage Lesson Plan", entity: "syllabus" },
    { id: "lessons", label: "Lesson", entity: "lessons" },
    { id: "topics", label: "Topic", entity: "topics" },
  ] },
  { id: "academics", icon: "🎓", label: "Academics", tabs: [
    { id: "timetable", label: "Class Timetable", entity: "timetables" },
    { id: "class_teacher", label: "Assign Class Teacher", entity: "class_teachers" },
    { id: "promote", label: "Promote Students", custom: "promoteStudents" },
    { id: "subject_groups", label: "Subject Group", entity: "subject_groups" },
    { id: "subjects", label: "Subjects", entity: "subjects" },
    { id: "classes", label: "Class", entity: "classes" },
    { id: "sections", label: "Sections", entity: "sections" },
  ] },
  { id: "hr", icon: "🤝", label: "Human Resource", tabs: [
    { id: "staff", label: "Staff Directory", entity: "staff" },
    { id: "payroll", label: "Payroll", entity: "payroll" },
    { id: "leave_requests", label: "Leave Requests", entity: "leave_requests" },
    { id: "leave_types", label: "Leave Type", entity: "leave_types" },
    { id: "rating", label: "Teachers Rating", entity: "staff_ratings" },
    { id: "departments", label: "Department", entity: "departments" },
    { id: "designations", label: "Designation", entity: "designations" },
  ] },
  { id: "communicate", icon: "📣", label: "Communicate", tabs: [
    { id: "notices", label: "Notice Board", entity: "notices" },
    { id: "messages", label: "Send Email / SMS", entity: "messages" },
  ] },
  { id: "downloads", icon: "⬇️", label: "Download Center", tabs: [
    { id: "contents", label: "Upload Content", entity: "contents" },
    { id: "homework", label: "Homework", entity: "homework" },
  ] },
  { id: "inventory", icon: "📦", label: "Inventory", tabs: [
    { id: "stock", label: "Add Item Stock", entity: "item_stock" },
    { id: "issue", label: "Issue Item", entity: "item_issues" },
    { id: "items", label: "Add Item", entity: "items" },
    { id: "categories", label: "Item Category", entity: "item_categories" },
    { id: "stores", label: "Item Store", entity: "item_stores" },
    { id: "suppliers", label: "Item Supplier", entity: "item_suppliers" },
  ] },
  { id: "online_course", icon: "▶️", label: "Online Course", tabs: [
    { id: "courses", label: "Online Course", entity: "courses" },
    { id: "lessons", label: "Course Lessons", entity: "course_lessons" },
    { id: "offline_payment", label: "Offline Payment", entity: "course_payments" },
    { id: "setting", label: "Setting", singleton: "online_course_setting" },
  ] },
  { id: "live_classes", icon: "📹", label: "Live Classes", tabs: [
    { id: "classes", label: "Live Classes", entity: "live_classes" },
    { id: "meetings", label: "Live Meeting", entity: "live_meetings" },
    { id: "setting", label: "Setting", singleton: "live_class_setting" },
  ] },
  { id: "certificate", icon: "📜", label: "Certificate", tabs: [
    { id: "templates", label: "Student Certificate", custom: "certTemplates" },
    { id: "generate", label: "Generate Certificate", custom: "certGenerate" },
    { id: "idcards", label: "Student ID Card", custom: "idCardTemplates" },
    { id: "generate_idcard", label: "Generate ID Card", custom: "idCardGenerate" },
    { id: "staff_idcards", label: "Staff ID Card", custom: "staffIdCardTemplates" },
    { id: "generate_staff_idcard", label: "Generate Staff ID Card", custom: "staffIdCardGenerate" },
  ] },
  { id: "front_cms", icon: "🖥️", label: "Front CMS", tabs: [
    { id: "events", label: "Event", entity: "cms_events" },
    { id: "gallery", label: "Gallery", entity: "cms_gallery" },
    { id: "notice", label: "News / Notice", entity: "cms_notices" },
    { id: "media", label: "Media Manager", entity: "cms_media" },
    { id: "pages", label: "Pages", entity: "cms_pages" },
    { id: "menus", label: "Menus", entity: "cms_menus" },
    { id: "banners", label: "Banner Images", entity: "cms_banners" },
  ] },
  { id: "alumni", icon: "🎓", label: "Alumni", tabs: [
    { id: "list", label: "Manage Alumni", entity: "alumni" },
    { id: "events", label: "Events", entity: "alumni_events" },
  ] },
  { id: "erp_reports", icon: "📊", label: "Reports", tabs: [
    { id: "student", label: "Student Information", custom: "reportStudents" },
    { id: "finance", label: "Finance", custom: "reportFinance" },
    { id: "attendance", label: "Attendance", custom: "reportAttendance" },
    { id: "exams", label: "Examinations", custom: "reportExams" },
    { id: "documents", label: "Documents", custom: "reportDocuments" },
    { id: "hr", label: "Human Resource", custom: "reportHr" },
    { id: "user_log", label: "User Log", entity: "user_log" },
    { id: "audit", label: "Audit Trail Report", entity: "audit_log" },
  ] },
  { id: "system_settings", icon: "⚙️", label: "System Settings", tabs: [
    { id: "general", label: "General Setting", singleton: "general" },
    { id: "sessions", label: "Session Setting", entity: "sessions" },
    { id: "notification", label: "Notification Setting", singleton: "notification" },
    { id: "sms", label: "SMS Setting", singleton: "sms" },
    { id: "email", label: "Email Setting", singleton: "email" },
    { id: "payment", label: "Payment Methods", singleton: "payment_methods" },
    { id: "print", label: "Print Header Footer", singleton: "print_header_footer" },
    { id: "front_cms", label: "Front CMS Setting", singleton: "front_cms" },
    { id: "roles", label: "Roles Permissions", entity: "roles" },
    { id: "backup", label: "Backup / Restore", custom: "backup" },
    { id: "import", label: "Legacy Data Import", custom: "legacyImport" },
    { id: "users", label: "Users", entity: "portal_users" },
    { id: "modules", label: "Modules", entity: "modules" },
    { id: "custom_fields", label: "Custom Fields", entity: "custom_fields" },
    { id: "captcha", label: "Captcha Setting", singleton: "captcha" },
    { id: "system_fields", label: "System Fields", singleton: "system_fields" },
    { id: "profile_update", label: "Student Profile Update", singleton: "student_profile_update" },
    { id: "online_admission", label: "Online Admission", singleton: "online_admission" },
    { id: "file_types", label: "File Types", entity: "file_types" },
  ] },
];

export const SECTION_IDS = new Set(SECTIONS.map(s => s.id));

// Legacy document types (custom "belge_dogrulama" add-on). The numeric ids are part of
// every issued document's verification URL /belge_dogrulama/{code}/{type} and of the
// QR codes already printed on them — never renumber.
export const DOCUMENT_TYPES = {
  "1": { tr: "Öğrenci Belgesi", en: "Student Document" },
  "2": { tr: "Üniversite Kabul Teklif Mektubu", en: "University Admission Offer Letter" },
  "3": { tr: "Dil Okulu Kabul Mektubu", en: "Language School Acceptance Letter" },
  "4": { tr: "Üst Yazı", en: "Top Text Document" },
  "5": { tr: "Turizm Kabul Mektubu", en: "Tourism Acceptance Letter" },
  "6": { tr: "İş-Ticaret Kabul Mektubu", en: "Business-Trade Acceptance Letter" },
  "9999": { tr: "Sertifika", en: "Certificate" },
};

// Student record (erp_students) — the legacy admission/edit form plus Smart School's
// optional system fields. Grouped the way the legacy form groups them.
export const STUDENT_FIELD_GROUPS = [
  { title: "Student Details", fields: [
    t("admissionNo", "Admission No", { required: true }), t("rollNo", "Roll Number"),
    ref("classId", "Class", "classes", "name", { required: true }), ref("sectionId", "Section", "sections"),
    ref("sessionId", "Session", "sessions"),
    t("firstName", "First Name", { required: true }), t("lastName", "Last Name"),
    sel("gender", "Gender", GENDER, { required: true }), date("dob", "Date Of Birth", { required: true }),
    ref("categoryId", "Category", "categories"), t("religion", "Religion"), t("caste", "Caste"),
    t("mobile", "Mobile Number"), t("email", "Email"), t("passportNo", "Passport / ID No (TC)"),
    t("nationality", "Nationality"), date("admissionDate", "Admission Date"), image("photo", "Student Photo"),
    sel("bloodGroup", "Blood Group", ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"]), ref("houseId", "House", "houses"),
    t("height", "Height"), t("weight", "Weight"), date("measurementDate", "Measurement Date"),
  ] },
  { title: "Parent Guardian Detail", fields: [
    t("fatherName", "Father Name"), t("fatherPhone", "Father Phone"), t("fatherOccupation", "Father Occupation"),
    t("motherName", "Mother Name"), t("motherPhone", "Mother Phone"), t("motherOccupation", "Mother Occupation"),
    sel("guardianIs", "If Guardian Is", ["Father", "Mother", "Other"]), t("guardianName", "Guardian Name"),
    t("guardianRelation", "Guardian Relation"), t("guardianPhone", "Guardian Phone"), t("guardianEmail", "Guardian Email"),
    ta("guardianAddress", "Guardian Address"),
  ] },
  { title: "Student Address Details", fields: [ta("currentAddress", "Current Address"), ta("permanentAddress", "Permanent Address")] },
  { title: "Miscellaneous Details", fields: [
    t("bankAccountNo", "Bank Account Number"), t("bankName", "Bank Name"), t("ifsc", "IFSC Code"),
    t("nationalId", "National Identification Number"), t("localId", "Local Identification Number"),
    sel("rte", "RTE", ["Yes", "No"]), t("previousSchool", "Previous School Details"), ta("note", "Note"),
  ] },
];
export const STUDENT_FIELDS = STUDENT_FIELD_GROUPS.flatMap(g => g.fields);

// Placeholders supported in certificate / ID card / document body templates (legacy set).
export const TEMPLATE_PLACEHOLDERS = ["name", "dob", "present_address", "guardian", "created_at", "admission_no", "roll_no", "class", "section", "gender", "admission_date", "category", "cast", "father_name", "mother_name", "religion", "email", "phone", "passport_no", "nationality", "session"];
