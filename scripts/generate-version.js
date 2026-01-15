#!/usr/bin/env node

/**
 * Generate version.json file with git commit info for PWA updates
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getGitCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch (error) {
    console.warn('Failed to get git commit hash:', error.message)
    return 'unknown'
  }
}

function getGitCommitMessage() {
  try {
    return execSync('git log -1 --pretty=%B').toString().trim()
  } catch (error) {
    console.warn('Failed to get git commit message:', error.message)
    return 'No commit message available'
  }
}

function getGitCommitDate() {
  try {
    return execSync('git log -1 --pretty=%cI').toString().trim()
  } catch (error) {
    console.warn('Failed to get git commit date:', error.message)
    return new Date().toISOString()
  }
}

function getPackageVersion() {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
    )
    return packageJson.version
  } catch (error) {
    console.warn('Failed to read package.json version:', error.message)
    return '0.0.0'
  }
}

function generateVersionFile() {
  const versionInfo = {
    version: getPackageVersion(),
    commitHash: getGitCommitHash(),
    commitMessage: getGitCommitMessage(),
    commitDate: getGitCommitDate(),
    buildDate: new Date().toISOString()
  }

  const outputPath = path.join(__dirname, '../public/version.json')

  fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2))

  console.log('✓ Generated version.json:')
  console.log(`  Version: ${versionInfo.version}`)
  console.log(`  Commit: ${versionInfo.commitHash}`)
  console.log(`  Message: ${versionInfo.commitMessage.split('\n')[0].substring(0, 60)}${versionInfo.commitMessage.length > 60 ? '...' : ''}`)
  console.log(`  Date: ${versionInfo.commitDate}`)
}

generateVersionFile()
