import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull(),
});

export const quizResults = sqliteTable('quiz_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  answers: text('answers', { mode: 'json' }).notNull(),
  moodResult: text('mood_result').notNull(),
  balanceScore: integer('balance_score').notNull(),
  physicalScore: integer('physical_score').notNull(),
  cognitiveScore: integer('cognitive_score').notNull(),
  digitalScore: integer('digital_score').notNull(),
  createdAt: text('created_at').notNull(),
});

export const plans = sqliteTable('plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  goalId: text('goal_id').notNull(),
  goalTitle: text('goal_title').notNull(),
  planItems: text('plan_items', { mode: 'json' }).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const progressTracking = sqliteTable('progress_tracking', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  trackingDate: text('tracking_date').notNull(),
  sleepHours: real('sleep_hours'),
  screenTimeHours: real('screen_time_hours'),
  steps: integer('steps'),
  calories: integer('calories'),
  stressLevel: integer('stress_level'),
  createdAt: text('created_at').notNull(),
});

export const communityPosts = sqliteTable('community_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  likes: integer('likes').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  notificationType: text('notification_type').notNull(),
  message: text('message').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});

export const journalEntries = sqliteTable('journal_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  entryText: text('entry_text').notNull(),
  moodAnalysis: text('mood_analysis').notNull(),
  createdAt: text('created_at').notNull(),
});

export const meditationSessions = sqliteTable('meditation_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  sessionType: text('session_type').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  completedAt: text('completed_at').notNull(),
});

export const gamificationProgress = sqliteTable('gamification_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  level: integer('level').notNull().default(1),
  experiencePoints: integer('experience_points').notNull().default(0),
  streakDays: integer('streak_days').notNull().default(0),
  badges: text('badges', { mode: 'json' }).notNull(),
  lastActivityDate: text('last_activity_date').notNull(),
  createdAt: text('created_at').notNull(),
});

export const wakeUpCalls = sqliteTable('wake_up_calls', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  scheduledTime: text('scheduled_time').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const dailyStats = sqliteTable('daily_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  date: text('date').notNull(),
  steps: integer('steps'),
  caloriesBurned: integer('calories_burned'),
  workoutMinutes: integer('workout_minutes'),
  waterIntake: integer('water_intake'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const workoutGoals = sqliteTable('workout_goals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  goalType: text('goal_type').notNull(),
  targetValue: integer('target_value').notNull(),
  currentValue: integer('current_value').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const foodScans = sqliteTable('food_scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  foodName: text('food_name').notNull(),
  calories: integer('calories').notNull(),
  protein: integer('protein').notNull(),
  carbs: integer('carbs').notNull(),
  fat: integer('fat').notNull(),
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const healthScans = sqliteTable('health_scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  overallHealth: integer('overall_health').notNull(),
  deficiencies: text('deficiencies', { mode: 'json' }).notNull(),
  recommendations: text('recommendations', { mode: 'json' }).notNull(),
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const reminderPreferences = sqliteTable('reminder_preferences', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  reminderType: text('reminder_type').notNull(),
  notificationMethod: text('notification_method').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  scheduleTime: text('schedule_time').notNull(),
  daysOfWeek: text('days_of_week', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const notificationLogs = sqliteTable('notification_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  reminderType: text('reminder_type').notNull(),
  notificationMethod: text('notification_method').notNull(),
  message: text('message').notNull(),
  sentAt: integer('sent_at', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull(),
});


// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});