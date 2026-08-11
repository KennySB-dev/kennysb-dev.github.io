const DISCORD_ID = "681811851428102145";

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function updatePresence() {
  const dot = document.getElementById("status-dot");
  const avatar = document.getElementById("profile-avatar");
  const listening = document.getElementById("act-listening");
  const coding = document.getElementById("act-coding");
  const playing = document.getElementById("act-playing");

  if (!listening) return;

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
    const json = await res.json();
    if (!json.success) throw new Error("fail");

    const data = json.data;
    const status = data.discord_status || "offline";
    const activities = data.activities || [];
    const spotify = data.spotify;

    if (dot) {
      dot.className = "status-dot " + status;
      dot.title = { online: "Online", idle: "Idle", dnd: "Do Not Disturb", offline: "Offline" }[status] || "Offline";
    }

    if (avatar && data.discord_user?.avatar) {
      avatar.src = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${data.discord_user.avatar}.png?size=128`;
    }

    if (spotify) {
      listening.classList.add("active");
      listening.innerHTML = `
        <img class="activity-art" src="${spotify.album_art_url}" alt="" width="36" height="36" />
        <div class="activity-detail">
          <strong>${escapeHtml(spotify.song)}</strong>
          <span>by ${escapeHtml(spotify.artist)}</span>
        </div>`;
    } else {
      listening.classList.remove("active");
      listening.innerHTML = `<i class="bx bx-music"></i><span>Not listening to anything</span>`;
    }

    const codeApps = /visual studio code|vs code|vscode|cursor|intellij|webstorm|pycharm|code|neovim|vim|sublime|atom/i;
    const codeAct = activities.find(
      (a) => a.type === 0 && codeApps.test(a.name || "")
    );
    if (codeAct) {
      coding.classList.add("active");
      const detail = codeAct.details + " in " + codeAct.state || codeAct.details || codeAct.state || "";
      coding.innerHTML = `
        <i class="bx bx-code-alt"></i>
        <div class="activity-detail">
          <strong>${escapeHtml(codeAct.name)}</strong>
          ${detail ? `<span>${escapeHtml(detail)}</span>` : ""}
        </div>`;
    } else {
      coding.classList.remove("active");
      coding.innerHTML = `<i class="bx bx-code-alt"></i><span>Not coding anything</span>`;
    }

    const gameAct = activities.find(
      (a) => a.type === 0 && !codeApps.test(a.name || "")
    );
    if (gameAct) {
      playing.classList.add("active");
      const detail = gameAct.details || gameAct.state || "";
      playing.innerHTML = `
        <i class="bx bx-joystick"></i>
        <div class="activity-detail">
          <strong>${escapeHtml(gameAct.name)}</strong>
          ${detail ? `<span>${escapeHtml(detail)}</span>` : ""}
        </div>`;
    } else {
      playing.classList.remove("active");
      playing.innerHTML = `<i class="bx bx-joystick"></i><span>Not playing anything</span>`;
    }
  } catch (e) {
    console.warn("Presence unavailable", e);
  }
}

updatePresence();
setInterval(updatePresence, 30000);

/* ---- GitHub projects (projects.html) ---- */
const GITHUB_USER = "KennySB-dev";
const HIDDEN_REPOS = new Set([
]);

function readmeToDescription(markdown) {
  if (!markdown) return "";
  let text = markdown
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/^[-*_]{3,}\s*$/gm, "")
    .replace(/^\[!\[.*$/gm, "");

  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 20);

  if (!lines.length) return "";
  let desc = lines[0];
  if (desc.length > 220) desc = desc.slice(0, 217).trim() + "…";
  return desc;
}

async function fetchReadmeSnippet(owner, repo) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers: { Accept: "application/vnd.github.raw+json" } }
    );
    if (!res.ok) return "";
    const md = await res.text();
    return readmeToDescription(md);
  } catch {
    return "";
  }
}

async function loadProjects() {
  const list = document.getElementById("project-list");
  if (!list) return;

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100&type=owner`
    );
    if (!res.ok) throw new Error("GitHub API " + res.status);
    let repos = await res.json();

    repos = repos.filter(
      (r) => !r.private && !HIDDEN_REPOS.has(r.name)
    );

    if (!repos.length) {
      list.innerHTML = `<p class="projects-loading">No public projects found.</p>`;
      return;
    }

    const cards = await Promise.all(
      repos.map(async (repo) => {
        let description = (repo.description || "").trim();
        if (!description) {
          description =
            (await fetchReadmeSnippet(GITHUB_USER, repo.name)) ||
            "No description.";
        }

        const homepage = (repo.homepage || "").trim();
        const hasSite =
          homepage &&
          !/^https?:\/\/github\.com\//i.test(homepage);

        const siteLink = hasSite
          ? `<a href="${escapeHtml(homepage)}" target="_blank" rel="noopener noreferrer"><i class="bx bx-link-external"></i> Site</a>`
          : "";

        const lang = repo.language
          ? `<span class="project-lang">${escapeHtml(repo.language)}</span>`
          : "";

        return `
          <article class="project-card">
            <div class="project-body">
              <div class="project-header-row">
                <h2 class="project-title">${escapeHtml(repo.name)}</h2>
                ${lang}
              </div>
              <p class="project-desc">${escapeHtml(description)}</p>
              <div class="project-links">
                ${siteLink}
                <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer"><i class="bx bxl-github"></i> Repo</a>
              </div>
            </div>
          </article>`;
      })
    );

    list.innerHTML = cards.join("");
  } catch (err) {
    console.warn(err);
    list.innerHTML = `<p class="projects-loading">Couldn’t load projects from GitHub. Try again later.</p>`;
  }
}

loadProjects();
