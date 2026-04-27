-- CreateTable
CREATE TABLE "public"."rulesets" (
    "id" TEXT NOT NULL,
    "ruleset_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rules_json" TEXT NOT NULL,
    "fallback_json" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rulesets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reps" (
    "id" TEXT NOT NULL,
    "rep_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "timezone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ooo_until" TIMESTAMP(3),
    "overflow_to" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."round_robin_state" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "ruleset_id" TEXT NOT NULL,
    "rule_priority" INTEGER NOT NULL,
    "current_index" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "round_robin_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contacts" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "assigned_rep_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activities" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "activity_type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "rep_id" TEXT,
    "duration_minutes" INTEGER,
    "outcome" TEXT,
    "notes" TEXT,
    "subject" TEXT,
    "meeting_time" TIMESTAMP(3),
    "metadata_json" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."routing_logs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "ruleset_id" TEXT NOT NULL,
    "rule_matched" TEXT,
    "rule_priority" INTEGER,
    "assignment_method" TEXT,
    "assigned_rep_id" TEXT,
    "fallback_used" BOOLEAN NOT NULL DEFAULT false,
    "attributes_json" TEXT NOT NULL,
    "rep_state_json" TEXT NOT NULL,
    "routing_time_ms" INTEGER,
    "assigned_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routing_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stale_alerts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "ruleset_id" TEXT NOT NULL,
    "no_activity_hours" INTEGER NOT NULL,
    "alert_type" TEXT NOT NULL DEFAULT 'webhook',
    "webhook_url" TEXT NOT NULL,
    "cooldown_hours" INTEGER NOT NULL DEFAULT 24,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stale_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rep_slas" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "ruleset_id" TEXT NOT NULL,
    "first_response_target_minutes" INTEGER NOT NULL,
    "alert_on_breach" BOOLEAN NOT NULL DEFAULT true,
    "alert_webhook" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rep_slas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rulesets_organization_id_idx" ON "public"."rulesets"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "rulesets_organization_id_ruleset_id_key" ON "public"."rulesets"("organization_id", "ruleset_id");

-- CreateIndex
CREATE INDEX "reps_organization_id_idx" ON "public"."reps"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "reps_organization_id_rep_id_key" ON "public"."reps"("organization_id", "rep_id");

-- CreateIndex
CREATE UNIQUE INDEX "round_robin_state_organization_id_ruleset_id_rule_priority_key" ON "public"."round_robin_state"("organization_id", "ruleset_id", "rule_priority");

-- CreateIndex
CREATE INDEX "contacts_organization_id_idx" ON "public"."contacts"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_organization_id_contact_id_key" ON "public"."contacts"("organization_id", "contact_id");

-- CreateIndex
CREATE INDEX "activities_contact_id_idx" ON "public"."activities"("contact_id");

-- CreateIndex
CREATE INDEX "activities_organization_id_idx" ON "public"."activities"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "activities_contact_id_activity_type_timestamp_key" ON "public"."activities"("contact_id", "activity_type", "timestamp");

-- CreateIndex
CREATE INDEX "routing_logs_organization_id_assigned_at_idx" ON "public"."routing_logs"("organization_id", "assigned_at");

-- CreateIndex
CREATE INDEX "routing_logs_ruleset_id_idx" ON "public"."routing_logs"("ruleset_id");

-- CreateIndex
CREATE UNIQUE INDEX "stale_alerts_organization_id_ruleset_id_key" ON "public"."stale_alerts"("organization_id", "ruleset_id");

-- CreateIndex
CREATE UNIQUE INDEX "rep_slas_organization_id_ruleset_id_key" ON "public"."rep_slas"("organization_id", "ruleset_id");

-- AddForeignKey
ALTER TABLE "public"."rulesets" ADD CONSTRAINT "rulesets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reps" ADD CONSTRAINT "reps_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_rep_id_fkey" FOREIGN KEY ("rep_id") REFERENCES "public"."reps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."routing_logs" ADD CONSTRAINT "routing_logs_ruleset_id_fkey" FOREIGN KEY ("ruleset_id") REFERENCES "public"."rulesets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."routing_logs" ADD CONSTRAINT "routing_logs_assigned_rep_id_fkey" FOREIGN KEY ("assigned_rep_id") REFERENCES "public"."reps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stale_alerts" ADD CONSTRAINT "stale_alerts_ruleset_id_fkey" FOREIGN KEY ("ruleset_id") REFERENCES "public"."rulesets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rep_slas" ADD CONSTRAINT "rep_slas_ruleset_id_fkey" FOREIGN KEY ("ruleset_id") REFERENCES "public"."rulesets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
