const typeMapping = {
  feat: "🚀 Features",
  fix: "🐛 Bugs",
  chore: "🏠 Chores",
  docs: "📚 Documentation",
  style: "💅 Styles",
  refactor: "♻️ Code Refactoring",
  perf: "⚡ Performance Improvements",
  test: "🧪 Tests",
  build: "📦 Build System",
  ci: "⚙️ CI",
  examples: "📝 Examples",
  ui: "🎨 UI Changes"
}

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
        parserOpts: { noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"] }
      }
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "angular",
        parserOpts: { noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"] },
        writerOpts: {
          commitsSort: ["subject", "scope"],
          types: Object.entries(typeMapping).map(([type, section]) => ({ type, section })),
          commitGroupsSort: "title",
          commitPartial:
            "*{{#if scope}} **{{scope}}:**{{/if}} {{subject}} {{#if hash}} · {{hash}}{{/if}}\n\n" +
            "{{#if references}}, closes{{#each references}} [{{this.issue}}]({{this.issueUrl}}){{/each}}{{/if}}\n\n",
          groupBy: "type",
          finalizeContext: function (context) {
            if (!context.commitGroups) return context

            console.log("Before transformation:", JSON.stringify(context, null, 2))
            console.log("Commit groups:", JSON.stringify(context.commitGroups, null, 2))

            // Update commit group titles and format commit authors.
            context.commitGroups.forEach(group => {
              console.log("Group:", group?.commits)
              if (group.commits && group.commits.length > 0 && group.commits[0].type) {
                const commitType = group.commits[0].type.toLowerCase()
                if (typeMapping[commitType]) {
                  group.title = typeMapping[commitType]
                }
              }
              group.commits.forEach(commit => {
                if (!commit.author) return
                if (typeof commit.author === "object") {
                  // Use the GitHub login if provided.
                  if (commit.author.login) {
                    commit.author = `${commit.author.name} (@${commit.author.login})`
                  } else {
                    commit.author = commit.author.name || commit.author.email || ""
                  }
                }
              })
            })

            // Gather unique contributors.
            const contributors = new Set()
            context.commitGroups.forEach(group => {
              group.commits.forEach(commit => {
                if (!commit.author) return
                contributors.add(commit.author)
              })
            })
            console.log("Contributors found:", Array.from(contributors))

            // Create and add the contributors section.
            const contributorSection = { title: "🤝 Contributors", commits: [] }
            contributors.forEach(contributor => {
              contributorSection.commits.push({ subject: contributor, hash: "" })
            })
            context.commitGroups.push(contributorSection)

            console.log("Final context:", JSON.stringify(context, null, 2))
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
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    [
      "@semantic-release/npm",
      { pkgRoot: "./packages/payload-auth" }
    ]
  ]
}

export default config
