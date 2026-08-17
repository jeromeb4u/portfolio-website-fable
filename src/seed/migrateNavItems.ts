import { DatabaseSync } from 'node:sqlite'

/**
 * Hand-migrate `navigation_items` to the shape the updated Navigation global
 * declares: `anchor` becomes nullable and `kind` / `href` are added.
 *
 * Payload's sqlite dev-push tries to do this itself but generates an
 * INSERT…SELECT that names the new columns in the OLD table, so it fails with
 * "no such column: kind". Running this first leaves the push with nothing to
 * do. Existing rows are anchors, so they get kind='section'.
 *
 * Run: node --experimental-strip-types src/seed/migrateNavItems.ts
 * Idempotent — exits early once `kind` exists.
 */
const db = new DatabaseSync('dev.db')

const columns = db.prepare('PRAGMA table_info(navigation_items)').all() as { name: string }[]
if (columns.some((c) => c.name === 'kind')) {
  console.log('navigation_items already migrated — nothing to do')
  process.exit(0)
}

db.exec('PRAGMA foreign_keys=OFF')
db.exec('BEGIN')
try {
  db.exec(`CREATE TABLE \`navigation_items_new\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`kind\` text,
    \`anchor\` text,
    \`href\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  )`)
  db.exec(
    "INSERT INTO `navigation_items_new` (`_order`, `_parent_id`, `id`, `kind`, `anchor`, `href`) " +
      "SELECT `_order`, `_parent_id`, `id`, 'section', `anchor`, NULL FROM `navigation_items`",
  )
  db.exec('DROP TABLE `navigation_items`')
  db.exec('ALTER TABLE `navigation_items_new` RENAME TO `navigation_items`')
  db.exec('CREATE INDEX `navigation_items_order_idx` ON `navigation_items` (`_order`)')
  db.exec('CREATE INDEX `navigation_items_parent_id_idx` ON `navigation_items` (`_parent_id`)')
  db.exec('COMMIT')
} catch (error) {
  db.exec('ROLLBACK')
  throw error
}
db.exec('PRAGMA foreign_keys=ON')

console.log(JSON.stringify(db.prepare('SELECT * FROM navigation_items').all(), null, 2))
