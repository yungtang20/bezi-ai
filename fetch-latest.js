const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const zipUrl = 'https://github.com/yungtang20/bezi/archive/refs/heads/main.zip';
const zipPath = path.join(process.cwd(), 'latest.zip');
const extractDir = path.join(process.cwd(), 'latest-extract');

console.log('Downloading latest zip from:', zipUrl);
const file = fs.createWriteStream(zipPath);

https.get(zipUrl, (response) => {
  if (response.statusCode === 302 || response.statusCode === 301) {
    const redirectUrl = response.headers.location;
    if (!redirectUrl) {
      console.error('Redirect location header missing');
      process.exit(1);
    }
    https.get(redirectUrl, handleResponse).on('error', handleError);
  } else {
    handleResponse(response);
  }
}).on('error', handleError);

function handleError(e) {
  console.error('Error downloading:', e);
  process.exit(1);
}

function handleResponse(res) {
  if (res.statusCode !== 200) {
    console.error('Failed to get 200 status code, got', res.statusCode);
    process.exit(1);
  }
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Downloaded zip. Extracting to', extractDir);
    try {
      if (fs.existsSync(extractDir)) {
        fs.rmSync(extractDir, { recursive: true, force: true });
      }
      fs.mkdirSync(extractDir, { recursive: true });

      // Let's use standard unzip if available, otherwise java or tar or python or node decompress-cli
      let extracted = false;
      try {
        console.log('Trying unzip command...');
        execSync(`unzip -o "${zipPath}" -d "${extractDir}"`, { stdio: 'inherit' });
        extracted = true;
      } catch (err) {
        console.log('Standard unzip command failed or not found, trying decompress-cli...');
      }

      if (!extracted) {
        try {
          execSync(`npx -y decompress-cli "${zipPath}" --out-dir "${extractDir}"`, { stdio: 'inherit' });
          extracted = true;
        } catch (err) {
          console.error('decompress-cli failed:', err);
        }
      }

      if (!extracted) {
        throw new Error('All extraction methods failed.');
      }

      console.log('Extraction complete.');

      // Let's find the subdirectory
      const items = fs.readdirSync(extractDir);
      console.log('Extracted root contains:', items);
      const innerDirName = items.find(name => name.startsWith('bezi'));
      if (!innerDirName) {
        throw new Error('Could not find bezi directory in the archive');
      }

      const srcDir = path.join(extractDir, innerDirName);
      const destDir = process.cwd();

      console.log(`Copying contents from ${srcDir} to ${destDir}...`);
      copyRecursiveSync(srcDir, destDir);

      console.log('Cleaning up temporary files...');
      fs.rmSync(zipPath, { force: true });
      fs.rmSync(extractDir, { recursive: true, force: true });

      console.log('All done! Checking files...');
      console.log(fs.readdirSync(destDir));
    } catch (e) {
      console.error('Error extracting/moving:', e);
      process.exit(1);
    }
  });
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      // 排除 .env*, node_modules, dist, .git 等不應被覆蓋或備份之目錄/檔案
      if (
        childItemName === 'node_modules' ||
        childItemName === 'dist' ||
        childItemName === '.git' ||
        childItemName.startsWith('.env')
      ) {
        return;
      }
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { force: true });
    }
    fs.copyFileSync(src, dest);
  }
}
