
// Drop tables
export default async function dropTables(db, currentVersion, fs, path, isDev, app) {

    // Only drop the tables specified in the drops array
    const drops = [
        // { version: 10101, query: `DROP TABLE IF EXISTS users;` },
    ];

    const dropsToQuery = drops.filter(d => d.version > currentVersion);
    // Create a db backup if running in prod mode 
    if (dropsToQuery.length > 0 && !isDev){
        try {
            await backupDatabase(fs, path, app);
            console.log("Backup completed. Proceeding with table drops...");
        } catch (error) {
            console.error("Backup failed. Aborting table drop process.");
            return Promise.reject(error);
        }
    }

    return new Promise((resolve, reject) => {
        if (dropsToQuery.length === 0) {
            console.log("No tables need to be dropped.");
            return resolve({ status: 400, message: "No tables need to be dropped" });
        }

        console.log(`Dropping selected tables: ${dropsToQuery.map(d => d.query).join(" ")}`);

        // Drop and update schema version
        const dropPromises = dropsToQuery.map((update) => {
            return new Promise((resolve, reject) => {
                db.run(update.query, (err) => {
                    if (err) {
                        console.error(`Error dropping table for version ${update.version}:`, err.message);
                        return reject(err);
                    }

                    console.log(`Successfully dropped table for version ${update.version}`);
                    db.run(
                        `INSERT INTO schema_version (version) VALUES (?)`,
                        [update.version],
                        (insertErr) => {
                            if (insertErr) {
                                console.error("Error updating schema version:", insertErr.message);
                                reject(insertErr);
                            } else {
                                console.log(`Schema version updated to ${update.version}`);
                                resolve();
                            }
                        }
                    );
                });
            });
        });

        Promise.all(dropPromises)
        .then(() => {
            resolve({ status: 200, message: "Tables dropped and schema updated successfully" });
        })
        .catch((err) => {
            console.error("One or more table drops failed:", err.message);
            reject(err);
        });
    });
}


async function backupDatabase(fs, path, app) {

    const dbPath = path.join(app.getPath("userData"), "fp.db");
    const backupFolder = path.join(app.getPath("userData"), 'database_backups');

    try {
        
        const fileExists = await fs.promises.access(dbPath).then(() => true).catch(() => false);
        if (!fileExists) {
            console.warn(`Database file not found at ${dbPath}, skipping backup.`);
            return { status: 404, message: "Database file not found, backup skipped" };
        }
        
        await fs.promises.mkdir(backupFolder, { recursive: true });

        const timestamp = new Date().toISOString().replace(/T/, '-').replace(/[:.]/g, '').split('.')[0];
        const backupPath = path.join(backupFolder, `fp_backup_${timestamp}.db`);

        await fs.promises.copyFile(dbPath, backupPath);
        console.log(`Database backed up successfully to ${backupPath}`);

        return { status: 200, message: "Backup created successfully" };
    } catch (err) {
        console.error("Error backing up the database:", err);
        throw err;
    }
}

