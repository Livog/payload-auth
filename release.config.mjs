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
          finalizeContext: async function (context) {
            if (!context.commitGroups) return context

            console.log("Before transformation:", JSON.stringify(context, null, 2))
            console.log("Commit groups:", JSON.stringify(context.commitGroups, null, 2))

            // Update commit group titles based on raw commit type.
            context.commitGroups.forEach(group => {
              if (group.commits && group.commits.length > 0) {
                const rawType =
                  group.commits[0].raw && group.commits[0].raw.type
                    ? group.commits[0].raw.type.toLowerCase()
                    : group.commits[0].type.toLowerCase()
                if (typeMapping[rawType]) {
                  group.title = typeMapping[rawType]
                }
              }
            })

            // Enrich commit author data using GitHub API.
            const { host, owner, repository } = context
            const headers = { "Accept": "application/vnd.github.v3+json" }
            if (process.env.GITHUB_TOKEN) {
              headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`
            }

            const commitCache = new Map()
            await Promise.all(
              context.commitGroups.map(async group => {
                await Promise.all(
                  group.commits.map(async commit => {
                    if (!commit.author || !commit.raw || !commit.raw.hash) return
                    // Only fetch if author is a plain string not already enriched.
                    if (typeof commit.author === "string" && !commit.author.includes("(@")) {
                      const hash = commit.raw.hash
                      if (commitCache.has(hash)) {
                        const login = commitCache.get(hash)
                        if (login) commit.author = `${commit.author} (@${login})`
                      } else {
                        try {
                          const res = await fetch(
                            `${host}/repos/${owner}/${repository}/commits/${hash}`,
                            { headers }
                          )
                          if (res.ok) {
                            const data = await res.json()
                            const login = data.author && data.author.login ? data.author.login : null
                            commitCache.set(hash, login)
                            if (login) commit.author = `${commit.author} (@${login})`
                          } else {
                            commitCache.set(hash, null)
                          }
                        } catch (error) {
                          console.error(`Error fetching commit ${hash}:`, error)
                          commitCache.set(hash, null)
                        }
                      }
                    }
                  })
                )
              })
            )

            // Gather unique contributors.
            const contributors = new Set()
            context.commitGroups.forEach(group => {
              group.commits.forEach(commit => {
                if (commit.author) contributors.add(commit.author)
              })
            })
            console.log("Contributors found:", Array.from(contributors))

            // Append the contributors section.
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
        assets: [{ path: "payload-auth-distribution.zip", label: "Distribution (zip)" }],
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
      { pkgRoot: "./packages/payload-auth" }
    ]
  ]
}

export default config
