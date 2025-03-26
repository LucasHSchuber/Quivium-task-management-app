export default function alterTable(db, currentVersion) {
  console.log("alterTable currentVersion", currentVersion)
  const updates = [
      { version: 10201, table: "tasks", column: "sticky", query: `ALTER TABLE tasks ADD COLUMN sticky INTEGER DEFAULT 0;` },
  ];

  const updatesToApply = updates.filter(update => update.version > currentVersion);

  if (updatesToApply.length === 0) {
      console.log("No tables need updating (alterTable).");
      return Promise.resolve();
  }

  const updatePromises = updatesToApply.map(update => {
      return new Promise((resolve, reject) => {
          db.all(`PRAGMA table_info(${update.table});`, (err, rows) => {
              if (err) {
                  console.error(`Error fetching table info for ${update.table}:`, err.message);
                  return reject(err);
              }

              const columnExists = rows.some(row => row.name === update.column);
              if (columnExists) {
                  console.log(`Column '${update.column}' already exists in '${update.table}', skipping.`);
                  return resolve();
              }

              db.run(update.query, err => {
                  if (err) {
                      console.error(`Error applying update to version ${update.version}:`, err.message);
                      return reject(err);
                  }

                  console.log(`Successfully applied schema update to version ${update.version}`);
                  db.run(`INSERT INTO schema_version (version) VALUES (?)`, [update.version], insertErr => {
                      if (insertErr) {
                          console.error("Error updating schema version:", insertErr.message);
                          return reject(insertErr);
                      }
                      console.log(`Schema version updated to ${update.version}`);
                      resolve();
                  });
              });
          });
      });
  });

  return Promise.all(updatePromises)
      .then(() => console.log("All schema updates have been applied successfully."))
      .catch(err => console.error("One or more schema updates failed:", err.message));
}
