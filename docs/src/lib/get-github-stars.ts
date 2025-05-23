export async function getGitHubStars() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/forrestdevs/payload-better-auth",
      {
        next: {
          revalidate: 60,
        },
      }
    );
    if (!response?.ok) {
      return null;
    }
    const json = await response.json();
    const stars = parseInt(json.stargazers_count).toLocaleString();
    return stars;
  } catch {
    return null;
  }
}
