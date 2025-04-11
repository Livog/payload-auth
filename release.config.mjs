/**
 * @type {import('semantic-release').GlobalConfig}
 */
const config = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: [
          { type: "docs", scope: "README", release: "patch" },
          { type: "docs", release: "patch" },
          { type: "chore", release: "patch" },
          { type: "examples", release: "patch" },
          { type: "perf", release: "patch" },
          { type: "ui", release: "patch" },
          { type: "feat", release: "minor" },
          { type: "fix", release: "patch" },
          { breaking: true, release: "major" }
        ],
        parserOpts: {
          noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"]
        }
      }
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "angular",
        parserOpts: {
          noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"]
        },
        writerOpts: {
          commitsSort: ["subject", "scope"],
          types: [
            { type: "feat", section: "🚀 Features" },
            { type: "fix", section: "🐛 Bug Fixes" },
            { type: "chore", section: "🏠 Chores" },
            { type: "docs", section: "📚 Documentation" },
            { type: "style", section: "💅 Styles" },
            { type: "refactor", section: "♻️ Code Refactoring" },
            { type: "perf", section: "⚡ Performance Improvements" },
            { type: "test", section: "🧪 Tests" },
            { type: "build", section: "📦 Build System" },
            { type: "ci", section: "⚙️ CI" },
            { type: "examples", section: "📝 Examples" },
            { type: "ui", section: "🎨 UI Changes" }
          ],
          commitGroupsSort: "title",
          commitPartial:
            "*{{#if scope}} **{{scope}}:**{{/if}} {{subject}} {{#if hash}} · {{hash}}{{/if}}\n\n" +
            "{{#if references}}, closes{{#each references}} [{{this.issue}}]({{this.issueUrl}}){{/each}}{{/if}}\n\n",
          groupBy: "type",
          finalizeContext: function (context) {
            if (!context.commitGroups) return context

            context.commitGroups.forEach(group => {
              if (group.title === "Bug Fixes") group.title = "🐛 Bugs"
              group.commits.forEach(commit => {
                if (!commit.author) return
                if (typeof commit.author === "object") {
                  commit.author = commit.author.login
                    ? `${commit.author.name} (@${commit.author.login})`
                    : commit.author.name || commit.author.email || ""
                }
              })
            })

            const contributorSection = { title: "🤝 Contributors", commits: [] }
            const contributors = new Set()
            context.commitGroups.forEach(group => {
              group.commits.forEach(commit => {
                if (!commit.author) return
                contributors.add(commit.author)
              })
            })

            if (!contributors.size) return context
            contributors.forEach(contributor => {
              contributorSection.commits.push({ subject: contributor, hash: "" })
            })
            context.commitGroups.push(contributorSection)
            return context
          }
        }
      }
    ],
    [
      "@semantic-release/github",
      {
        assets: [
          { path: "payload-auth-distribution.zip", label: "Distribution (zip)" }
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
}

export default config
