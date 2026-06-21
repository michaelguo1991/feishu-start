CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"feishu_open_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "notes_open_id_idx" ON "notes" USING btree ("feishu_open_id");