const { Octokit } = require("@octokit/rest");
const fs = require("fs");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const owner = "matheusbarquette"; // altere
const repo = "saia_do_loop"; // altere

(async () => {
  const issues = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "open"
  });

  let votos = [];

  for (const issue of issues.data) {
    const reactions = await octokit.rest.reactions.listForIssue({
      owner,
      repo,
      issue_number: issue.number
    });

    const total = reactions.data.length;
    votos.push({
      titulo: issue.title,
      numero: issue.number,
      votos: total
    });
  }

  votos.sort((a, b) => b.votos - a.votos);

  // Atualizar README
  let readme = fs.readFileSync("README.md", "utf8");
  const inicio = readme.indexOf("## 📊 Ranking Atual");
  if (inicio !== -1) {
    readme = readme.substring(0, inicio);
  }

  let rankingMD = "## 📊 Ranking Atual\n*(Atualizado automaticamente)*\n\n";
  votos.forEach((p, i) => {
    const barra = "█".repeat(p.votos) || "░";
    rankingMD += `${i + 1}. [${p.titulo}](https://github.com/${owner}/${repo}/issues/${p.numero}) — **${p.votos} votos**\n${barra}\n\n`;
  });

  fs.writeFileSync("README.md", readme + rankingMD);

  // Gerar JSON para GitHub Pages
  fs.writeFileSync("ranking.json", JSON.stringify(votos, null, 2));
})();
