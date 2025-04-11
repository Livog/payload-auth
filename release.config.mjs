/**
 * @type {import('semantic-release').GlobalConfig}
 */
const config = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        "preset": "angular",
        "releaseRules": [
          {"type": "docs", "scope": "README", "release": "patch"},
          {"type": "docs", "release": "patch"},
          {"type": "chore", "release": "patch"},
          {"type": "examples", "release": "patch"},
          {"type": "perf", "release": "patch"},
          {"type": "ui", "release": "patch"},
          {"type": "feat", "release": "minor"},
          {"type": "fix", "release": "patch"},
          {"breaking": true, "release": "major"}
        ],
        "parserOpts": {
          "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES"]
        }
      }
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        "preset": "angular",
        "parserOpts": {
          "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES"]
        },
        "writerOpts": {
          "commitsSort": ["subject", "scope"],
          "types": [
            {"type": "feat", "section": ":rocket: Features"},
            {"type": "fix", "section": ":bug: Bug Fixes"},
            {"type": "chore", "section": ":house: Chores"},
            {"type": "docs", "section": ":books: Documentation"},
            {"type": "style", "section": ":nail_care: Styles"},
            {"type": "refactor", "section": ":recycle: Code Refactoring"},
            {"type": "perf", "section": ":zap: Performance Improvements"},
            {"type": "test", "section": ":test_tube: Tests"},
            {"type": "build", "section": ":package: Build System"},
            {"type": "ci", "section": ":gear: CI"},
            {"type": "examples", "section": ":memo: Examples"},
            {"type": "ui", "section": ":art: UI Changes"}
          ],
          "commitGroupsSort": "title",
          "commitPartial": "*{{#if scope}} **{{scope}}:**{{/if}} {{subject}} {{#if hash}} · {{hash}}{{/if}}\n\n{{~!-- commit link --}} {{#if hash}}[{{shortHash}}]({{commitUrl}}){{/if}} {{~!-- commit references --}}{{#if references}}, closes{{~#each references}} [{{this.issue}}]({{this.issueUrl}}){{/each}}{{/if}}\n\n{{~!-- author --}}{{#if author}}*{{author}}*{{/if}}",
          "groupBy": "type",
          "finalizeContext": function(context) {
            if (context.commitGroups) {
              const contributorSection = {
                title: ":busts_in_silhouette: Contributors",
                commits: []
              };
              
              // Get unique contributors from all commits
              const contributors = new Set();
              context.commitGroups.forEach(group => {
                group.commits.forEach(commit => {
                  if (commit.author) {
                    contributors.add(commit.author);
                  }
                });
              });
              
              // Add contributor list to the section
              contributors.forEach(contributor => {
                contributorSection.commits.push({
                  subject: contributor,
                  hash: ""
                });
              });
              
              // Add contributor section if there are contributors
              if (contributors.size > 0) {
                context.commitGroups.push(contributorSection);
              }
            }
            return context;
          }
        }
      }
    ],
    [
      "@semantic-release/github",
      {
        assets: [
          {
            path: "payload-auth-distribution.zip",
            label: "Distribution (zip)"
          }
        ],
        addReleases: "bottom",
        successComment: ":tada: This release is now available as `${nextRelease.version}` :tada:",
        failTitle: "The release workflow has failed",
        failComment: "The release workflow has failed. Please check the logs for more information.",
        releaseNameTemplate: "v${nextRelease.version}",
        releasedLabels: ["released"],
        addBranchProtectionRules: false,
        githubAssets: false
      }
    ],
    [
      "@semantic-release/git",
      {
        assets: ["package.json"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    [
      "@semantic-release/npm",
      {
        pkgRoot: "./packages/payload-auth"
      }
    ]
  ]
};

export default config; 