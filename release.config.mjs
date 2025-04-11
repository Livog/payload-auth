/**
 * @type {import('semantic-release').GlobalConfig}
 */
const config = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/github",
      {
        assets: [
          {
            path: "payload-auth-distribution.zip",
            label: "Distribution (zip)"
          }
        ]
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