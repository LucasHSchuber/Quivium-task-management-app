
export default function miscUpdates(db, currentVersion) {

  const updates = [
    //   { version: 10103, table: "_projects", index: "idx_unique_project_uuid", query: `CREATE UNIQUE INDEX idx_unique_project_uuid ON _projects (project_uuid);` },
  ];

  const updatesToApply = updates.filter(update => update.version > currentVersion);

  if (updatesToApply.length === 0) {
      console.log("No tables need updating (miscUpdates).");
      return Promise.resolve();
  }

  const updatePromises = updatesToApply.map(update => {
      return new Promise((resolve, reject) => {
          if (update.index) {
              db.all(`PRAGMA index_list(${update.table});`, (err, rows) => {
                  if (err) {
                      console.error(`Error fetching index info for ${update.table}:`, err.message);
                      return reject(err);
                  }

                  const indexExists = rows.some(row => row.name === update.index);
                  if (indexExists) {
                      console.log(`Index '${update.index}' already exists on '${update.table}', skipping.`);
                      return resolve();
                  }

                  runUpdate();
              });
          } else {
              runUpdate();
          }

          function runUpdate() {
              db.run(update.query, err => {
                  if (err) {
                      console.error(`Error applying update to version ${update.version}:`, err.message);
                      return reject(err);
                  }

                  console.log(`Applied schema update to version ${update.version}`);
                  db.run(`INSERT INTO schema_version (version) VALUES (?)`, [update.version], insertErr => {
                      if (insertErr) {
                          console.error("Error updating schema version:", insertErr.message);
                          return reject(insertErr);
                      }
                      console.log(`Schema version updated to ${update.version}`);
                      resolve();
                  });
              });
          }
      });
  });

  return Promise.all(updatePromises)
      .then(() => console.log("All misc updates have been successfully applied."))
      .catch(err => console.error("One or more misc updates failed:", err.message));
}


