-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_date" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Student" (
    "student_id" TEXT NOT NULL,
    "admission_year" INTEGER NOT NULL,
    "current_gpa" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "academic_class" TEXT,
    "degree_path_id" TEXT NOT NULL,
    "specialization_id" TEXT,
    "advisor_id" TEXT,
    "current_level" TEXT,
    "enrollment_status" TEXT NOT NULL DEFAULT 'ENROLLED',

    CONSTRAINT "Student_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "staff_id" TEXT NOT NULL,
    "staff_number" TEXT NOT NULL,
    "staff_type" TEXT NOT NULL,
    "department" TEXT NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("staff_id")
);

-- CreateTable
CREATE TABLE "Advisor" (
    "advisor_id" TEXT NOT NULL,
    "assigned_degree_path_id" TEXT,

    CONSTRAINT "Advisor_pkey" PRIMARY KEY ("advisor_id")
);

-- CreateTable
CREATE TABLE "HOD" (
    "hod_id" TEXT NOT NULL,
    "department" TEXT NOT NULL,

    CONSTRAINT "HOD_pkey" PRIMARY KEY ("hod_id")
);

-- CreateTable
CREATE TABLE "DegreePath" (
    "degree_path_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DegreePath_pkey" PRIMARY KEY ("degree_path_id")
);

-- CreateTable
CREATE TABLE "Specialization" (
    "specialization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "degree_path_id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Specialization_pkey" PRIMARY KEY ("specialization_id")
);

-- CreateTable
CREATE TABLE "Module" (
    "module_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("module_id")
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "academic_year_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("academic_year_id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "semester_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("semester_id")
);

-- CreateTable
CREATE TABLE "ModuleRegistration" (
    "reg_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "semester_id" TEXT NOT NULL,
    "term" TEXT,
    "registration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',

    CONSTRAINT "ModuleRegistration_pkey" PRIMARY KEY ("reg_id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "grade_id" TEXT NOT NULL,
    "reg_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "semester_id" TEXT NOT NULL,
    "marks" DOUBLE PRECISION NOT NULL,
    "grade_point" DOUBLE PRECISION NOT NULL,
    "letter_grade" TEXT NOT NULL,
    "attempt_no" INTEGER NOT NULL DEFAULT 1,
    "released_at" TIMESTAMP(3),

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("grade_id")
);

-- CreateTable
CREATE TABLE "GradingScheme" (
    "scheme_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GradingScheme_pkey" PRIMARY KEY ("scheme_id")
);

-- CreateTable
CREATE TABLE "GradingBand" (
    "band_id" TEXT NOT NULL,
    "scheme_id" TEXT NOT NULL,
    "min_marks" DOUBLE PRECISION NOT NULL,
    "max_marks" DOUBLE PRECISION NOT NULL,
    "grade_point" DOUBLE PRECISION NOT NULL,
    "letter_grade" TEXT NOT NULL,

    CONSTRAINT "GradingBand_pkey" PRIMARY KEY ("band_id")
);

-- CreateTable
CREATE TABLE "GPAHistory" (
    "gpa_history_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "calculation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gpa" DOUBLE PRECISION NOT NULL,
    "academic_class" TEXT,

    CONSTRAINT "GPAHistory_pkey" PRIMARY KEY ("gpa_history_id")
);

-- CreateTable
CREATE TABLE "AcademicGoal" (
    "goal_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "target_gpa" DOUBLE PRECISION NOT NULL,
    "target_class" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "achieved_at" TIMESTAMP(3),

    CONSTRAINT "AcademicGoal_pkey" PRIMARY KEY ("goal_id")
);

-- CreateTable
CREATE TABLE "Ranking" (
    "ranking_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "degree_path_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "weighted_average" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("ranking_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "message_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "AnonymousReport" (
    "report_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnonymousReport_pkey" PRIMARY KEY ("report_id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "setting_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("setting_id")
);

-- CreateTable
CREATE TABLE "LectureSchedule" (
    "schedule_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "location" TEXT,

    CONSTRAINT "LectureSchedule_pkey" PRIMARY KEY ("schedule_id")
);

-- CreateTable
CREATE TABLE "_ModulePrerequisites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ModulePrerequisites_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_staff_number_key" ON "Staff"("staff_number");

-- CreateIndex
CREATE UNIQUE INDEX "DegreePath_code_key" ON "DegreePath"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Specialization_code_key" ON "Specialization"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Module_code_key" ON "Module"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_label_key" ON "AcademicYear"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_reg_id_key" ON "Grade"("reg_id");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "_ModulePrerequisites_B_index" ON "_ModulePrerequisites"("B");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_degree_path_id_fkey" FOREIGN KEY ("degree_path_id") REFERENCES "DegreePath"("degree_path_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_specialization_id_fkey" FOREIGN KEY ("specialization_id") REFERENCES "Specialization"("specialization_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_advisor_id_fkey" FOREIGN KEY ("advisor_id") REFERENCES "Advisor"("advisor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advisor" ADD CONSTRAINT "Advisor_advisor_id_fkey" FOREIGN KEY ("advisor_id") REFERENCES "Staff"("staff_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HOD" ADD CONSTRAINT "HOD_hod_id_fkey" FOREIGN KEY ("hod_id") REFERENCES "Staff"("staff_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialization" ADD CONSTRAINT "Specialization_degree_path_id_fkey" FOREIGN KEY ("degree_path_id") REFERENCES "DegreePath"("degree_path_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("academic_year_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleRegistration" ADD CONSTRAINT "ModuleRegistration_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleRegistration" ADD CONSTRAINT "ModuleRegistration_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleRegistration" ADD CONSTRAINT "ModuleRegistration_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "Semester"("semester_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_reg_id_fkey" FOREIGN KEY ("reg_id") REFERENCES "ModuleRegistration"("reg_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "Semester"("semester_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradingBand" ADD CONSTRAINT "GradingBand_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "GradingScheme"("scheme_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GPAHistory" ADD CONSTRAINT "GPAHistory_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicGoal" ADD CONSTRAINT "AcademicGoal_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnonymousReport" ADD CONSTRAINT "AnonymousReport_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureSchedule" ADD CONSTRAINT "LectureSchedule_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Module"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureSchedule" ADD CONSTRAINT "LectureSchedule_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "Staff"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModulePrerequisites" ADD CONSTRAINT "_ModulePrerequisites_A_fkey" FOREIGN KEY ("A") REFERENCES "Module"("module_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModulePrerequisites" ADD CONSTRAINT "_ModulePrerequisites_B_fkey" FOREIGN KEY ("B") REFERENCES "Module"("module_id") ON DELETE CASCADE ON UPDATE CASCADE;
