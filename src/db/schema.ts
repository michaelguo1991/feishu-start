import { env } from '#/lib/env'

import * as pgSchema from './schema.pg'
import * as sqliteSchema from './schema.sqlite'

export const profileVersions = env.usePostgres
  ? pgSchema.profileVersions
  : sqliteSchema.profileVersions

export type ProfileVersion =
  | pgSchema.ProfileVersion
  | sqliteSchema.ProfileVersion
export type NewProfileVersion =
  | pgSchema.NewProfileVersion
  | sqliteSchema.NewProfileVersion

export const notes = env.usePostgres ? pgSchema.notes : sqliteSchema.notes

export type Note = pgSchema.Note | sqliteSchema.Note
export type NewNote = pgSchema.NewNote | sqliteSchema.NewNote
