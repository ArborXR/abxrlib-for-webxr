#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Generate changelog from git commits between tags
 */
class ChangelogGenerator {
  constructor() {
    this.changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  }

  /**
   * Execute git command and return output
   */
  execGit(command) {
    try {
      return execSync(`git ${command}`, { encoding: 'utf8' }).trim();
    } catch (error) {
      console.error(`Error executing git command: ${command}`);
      console.error(error.message);
      return '';
    }
  }

  /**
   * Get all git tags sorted by version
   */
  getTags() {
    const tags = this.execGit('tag --list --sort=-version:refname');
    return tags ? tags.split('\n').filter(tag => tag.trim()) : [];
  }

  /**
   * Get commits between two references
   */
  getCommitsBetween(from, to) {
    const range = from ? `${from}..${to}` : to;
    const commits = this.execGit(`log ${range} --pretty=format:"%H|%s|%an|%ad" --date=short`);
    
    if (!commits) return [];
    
    return commits.split('\n').map(line => {
      const [hash, subject, author, date] = line.split('|');
      return { hash, subject, author, date };
    });
  }

  /**
   * Categorize commit based on conventional commit format
   */
  categorizeCommit(subject) {
    const conventionalPattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\(.+\))?\s*:\s*(.+)/i;
    const match = subject.match(conventionalPattern);
    
    if (match) {
      const [, type, scope, description] = match;
      return {
        type: type.toLowerCase(),
        scope: scope ? scope.slice(1, -1) : null, // Remove parentheses
        description,
        isConventional: true
      };
    }
    
    // Try to categorize non-conventional commits
    const lowerSubject = subject.toLowerCase();
    if (lowerSubject.includes('fix') || lowerSubject.includes('bug')) {
      return { type: 'fix', scope: null, description: subject, isConventional: false };
    }
    if (lowerSubject.includes('add') || lowerSubject.includes('feature')) {
      return { type: 'feat', scope: null, description: subject, isConventional: false };
    }
    if (lowerSubject.includes('update') || lowerSubject.includes('improve')) {
      return { type: 'refactor', scope: null, description: subject, isConventional: false };
    }
    
    return { type: 'other', scope: null, description: subject, isConventional: false };
  }

  /**
   * Format commit for changelog
   */
  formatCommit(commit, category) {
    const shortHash = commit.hash.substring(0, 7);
    const scope = category.scope ? `**${category.scope}**: ` : '';
    return `- ${scope}${category.description} ([${shortHash}](../../commit/${commit.hash}))`;
  }

  /**
   * Generate changelog section for a version
   */
  generateVersionSection(version, commits, date) {
    if (commits.length === 0) {
      return `## [${version}] - ${date}\n\n*No changes recorded*\n\n`;
    }

    const categorized = {
      feat: [],
      fix: [],
      refactor: [],
      docs: [],
      style: [],
      test: [],
      chore: [],
      perf: [],
      ci: [],
      build: [],
      other: []
    };

    commits.forEach(commit => {
      const category = this.categorizeCommit(commit.subject);
      categorized[category.type].push({ commit, category });
    });

    let section = `## [${version}] - ${date}\n\n`;

    // Features
    if (categorized.feat.length > 0) {
      section += '### ✨ Features\n\n';
      categorized.feat.forEach(({ commit, category }) => {
        section += this.formatCommit(commit, category) + '\n';
      });
      section += '\n';
    }

    // Bug Fixes
    if (categorized.fix.length > 0) {
      section += '### 🐛 Bug Fixes\n\n';
      categorized.fix.forEach(({ commit, category }) => {
        section += this.formatCommit(commit, category) + '\n';
      });
      section += '\n';
    }

    // Performance
    if (categorized.perf.length > 0) {
      section += '### ⚡ Performance\n\n';
      categorized.perf.forEach(({ commit, category }) => {
        section += this.formatCommit(commit, category) + '\n';
      });
      section += '\n';
    }

    // Refactoring
    if (categorized.refactor.length > 0) {
      section += '### ♻️ Refactoring\n\n';
      categorized.refactor.forEach(({ commit, category }) => {
        section += this.formatCommit(commit, category) + '\n';
      });
      section += '\n';
    }

    // Documentation
    if (categorized.docs.length > 0) {
      section += '### 📚 Documentation\n\n';
      categorized.docs.forEach(({ commit, category }) => {
        section += this.formatCommit(commit, category) + '\n';
      });
      section += '\n';
    }

    // Build/CI
    const buildAndCI = [...categorized.build, ...categorized.ci];
    if (buildAndCI.length > 0) {
      section += '### 🔧 Build & CI\n\n';
      buildAndCI.forEach(({ commit, category }) => {
        section += this.formatCommit(commit, category) + '\n';
      });
      section += '\n';
    }

    // Other changes
    const otherChanges = [...categorized.chore, ...categorized.style, ...categorized.test, ...categorized.other];
    if (otherChanges.length > 0) {
      section += '### 🔨 Other Changes\n\n';
      otherChanges.forEach(({ commit, category }) => {
        section += this.formatCommit(commit, category) + '\n';
      });
      section += '\n';
    }

    return section;
  }

  /**
   * Generate full changelog
   */
  generateChangelog() {
    console.log('Generating changelog...');
    
    const tags = this.getTags();
    const currentDate = new Date().toISOString().split('T')[0];
    
    let changelog = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n`;

    if (tags.length === 0) {
      // No tags yet, get all commits
      const allCommits = this.getCommitsBetween(null, 'HEAD');
      changelog += this.generateVersionSection('Unreleased', allCommits, currentDate);
    } else {
      // Get unreleased commits (since last tag)
      const unreleasedCommits = this.getCommitsBetween(tags[0], 'HEAD');
      if (unreleasedCommits.length > 0) {
        changelog += this.generateVersionSection('Unreleased', unreleasedCommits, currentDate);
      }

      // Generate sections for each tag
      for (let i = 0; i < tags.length; i++) {
        const currentTag = tags[i];
        const previousTag = tags[i + 1];
        
        const commits = this.getCommitsBetween(previousTag, currentTag);
        const tagDate = this.execGit(`log -1 --format=%ad --date=short ${currentTag}`);
        
        changelog += this.generateVersionSection(currentTag, commits, tagDate || currentDate);
      }
    }

    return changelog;
  }

  /**
   * Update changelog for a specific version
   */
  updateChangelogForVersion(version) {
    console.log(`Updating changelog for version ${version}...`);
    
    const tags = this.getTags();
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Find the previous tag
    const versionTag = `v${version}`;
    const tagIndex = tags.indexOf(versionTag);
    const previousTag = tagIndex < tags.length - 1 ? tags[tagIndex + 1] : null;
    
    // Get commits for this version
    const commits = this.getCommitsBetween(previousTag, 'HEAD');
    
    if (commits.length === 0) {
      console.log('No new commits found for changelog.');
      return;
    }
    
    const versionSection = this.generateVersionSection(version, commits, currentDate);
    
    // Read existing changelog or create header
    let existingChangelog = '';
    if (fs.existsSync(this.changelogPath)) {
      existingChangelog = fs.readFileSync(this.changelogPath, 'utf8');
    } else {
      existingChangelog = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n`;
    }
    
    // Insert new version section after the header
    const headerEndIndex = existingChangelog.indexOf('\n\n') + 2;
    const newChangelog = existingChangelog.slice(0, headerEndIndex) + versionSection + existingChangelog.slice(headerEndIndex);
    
    fs.writeFileSync(this.changelogPath, newChangelog);
    console.log(`Changelog updated for version ${version}`);
  }

  /**
   * Write full changelog to file
   */
  writeChangelog() {
    const changelog = this.generateChangelog();
    fs.writeFileSync(this.changelogPath, changelog);
    console.log(`Changelog written to ${this.changelogPath}`);
  }
}

// CLI usage
if (require.main === module) {
  const generator = new ChangelogGenerator();
  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] === '--version') {
    const version = args[1];
    if (!version) {
      console.error('Please provide a version number: --version 1.0.21');
      process.exit(1);
    }
    generator.updateChangelogForVersion(version);
  } else {
    generator.writeChangelog();
  }
}

module.exports = ChangelogGenerator;
