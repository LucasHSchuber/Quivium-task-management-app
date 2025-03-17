// Creating app-update.yml and publishing to latest release in github

const fs = require('fs');
const path = require('path');

require('dotenv').config();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;



async function main() {

  const packageJson = JSON.parse(await fs.promises.readFile(path.join(__dirname, 'package.json'), 'utf8'));
  const { Octokit } = await import('@octokit/rest');

  const version = packageJson.version;
  console.log("package.json version", version);

  const config = {
    owner: 'LucasHSchuber',
    repo: 'Quivium-task-management-app',
    provider: 'github',
    releaseType: 'release',
    updateCacheDirName: 'quivium-update',
    version: version
  };

  const filePath = path.join(__dirname, 'dist', 'app-update.yml');
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  // Method to create the app-update.yml 
  function createAppupdateYml() {
    const yamlContent = 
    `
        owner: ${config.owner}
        repo: ${config.repo}
        provider: ${config.provider}
        releaseType: ${config.releaseType}
        updateCacheDirName: ${config.updateCacheDirName}
        version: ${config.version}
    `;

    fs.writeFileSync(filePath, yamlContent, 'utf8');
    console.log('app-update.yml file created successfully!');
  }

  // Method to upload file to the latest github release
  async function uploadToGitHubRelease() {
    try {
      const { data: releases } = await octokit.rest.repos.listReleases({
        owner: config.owner,
        repo: config.repo,
      });

      const latestRelease = releases[0];

      if (!latestRelease) {
        console.log('No releases found.');
        return;
      }

      const latestReleaseVersion = latestRelease.tag_name;
      console.log(`Latest release version: ${latestReleaseVersion}`);
      console.log("Latest package.json version:", "v"+version);

      if (latestReleaseVersion !== `v${version}`) {
        console.log(
          'The current package version does not match the latest release version. Skipping upload of app-update.yml file.'
        );
        return;
      }

      console.log(`Uploading app-update.yml to release: ${latestRelease.name}`);

      const releaseId = latestRelease.id;

      const uploadResponse = await octokit.rest.repos.uploadReleaseAsset({
        owner: config.owner,
        repo: config.repo,
        release_id: releaseId,
        name: 'app-update.yml',
        data: fs.readFileSync(filePath),
        headers: {
          'content-type': 'application/octet-stream',
        },
      });
      console.log("uploadResponse", uploadResponse);

      console.log(`app-update.yml uploaded successfully to release ID: ${releaseId}`);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }

  createAppupdateYml();
  await uploadToGitHubRelease();
}

main().catch(console.error);
