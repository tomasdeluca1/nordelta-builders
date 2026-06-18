import { pgTable, serial, text, varchar, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';

export const members = pgTable(
  'members',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 200 }).notNull(),
    email: varchar('email', { length: 320 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    mustChangePassword: boolean('must_change_password').notNull().default(true),
    initials: varchar('initials', { length: 8 }).notNull(),
    role: varchar('role', { length: 60 }).notNull(),
    jobTitle: varchar('job_title', { length: 80 }),
    company: varchar('company', { length: 200 }),
    companyUrl: varchar('company_url', { length: 500 }),
    tags: text('tags').array().notNull().default([] as string[]),
    colorIndex: integer('color_index').notNull().default(0),
    // 'pending' (awaiting review) → 'active' | 'rejected' | 'inactive' | 'lapsed'
    status: varchar('status', { length: 20 }).notNull().default('active'),
    isAdmin: boolean('is_admin').notNull().default(false),
    huevsiteUsername: varchar('huevsite_username', { length: 80 }),
    huevsiteApproved: boolean('huevsite_approved').notNull().default(false),
    huevsiteFeatured: boolean('huevsite_featured').notNull().default(false),
    // Presentación rica (completada antes de la revisión del admin).
    neighborhood: varchar('neighborhood', { length: 100 }),
    bio: text('bio'),
    building: varchar('building', { length: 280 }),
    linkedinUrl: varchar('linkedin_url', { length: 500 }),
    twitterUrl: varchar('twitter_url', { length: 500 }),
    instagramUrl: varchar('instagram_url', { length: 500 }),
    lookingFor: text('looking_for').array().notNull().default([] as string[]),
    canHelpWith: varchar('can_help_with', { length: 280 }),
    // null hasta que el builder envía su presentación; separa "incompleta" de "lista para revisar".
    profileSubmittedAt: timestamp('profile_submitted_at', { withTimezone: true }),
    // cuándo se le mandó el link mágico de la campaña (para reminders y prune).
    reengagedAt: timestamp('reengaged_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusCreatedIdx: index('members_status_created_idx').on(t.status, t.createdAt),
  }),
);

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;

// Key/value config editable from the admin panel (WhatsApp invite, notification
// email, huevsite base URL, …). Read with a fallback in lib/settings.ts.
export const appSettings = pgTable('app_settings', {
  key: varchar('key', { length: 80 }).primaryKey(),
  value: text('value'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AppSetting = typeof appSettings.$inferSelect;
