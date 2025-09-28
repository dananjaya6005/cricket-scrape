import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET() {
  try {
    const url =
      "https://crex.com/scoreboard/WZ9/1UA/7th-Match/X/IM/bot-vs-zim-7th-match-mens-t20-world-cup-africa-regional-final-2025/live";

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const data = await page.evaluate(() => {
      const matchTitle =
        document.querySelector(".live-score-header .name-wrapper span")
          ?.textContent || "";

      // --- Team Info ---
      const team1 = document.querySelector(".team-inning .team-name.team-1")
        ?.textContent?.trim();
      const team1Flag = document
        .querySelector(".team-inning .team-img img")
        ?.getAttribute("src");
      const team1ScoreSpans = Array.from(
        document.querySelectorAll(".team-inning .team-score .runs.f-runs span")
      ).map((el) => el.textContent?.trim());
      const team1Score = team1ScoreSpans[0] || "";
      const team1Overs = team1ScoreSpans[1] || "";

      const team2 = document.querySelector(
        ".team-inning.second-inning .team-name.team-2"
      )?.textContent?.trim();
      const team2Flag = document
        .querySelector(".team-inning.second-inning .team-img img")
        ?.getAttribute("src");

      const runRates = Array.from(
        document.querySelectorAll(".team-run-rate .title")
      ).map((el) => el.textContent?.trim());

      const result =
        document.querySelector(".final-result.comment")?.textContent?.trim() ||
        document.querySelector(".final-result.des-none")?.textContent?.trim() ||
        "";

      // --- Live Players ---
      const batsmen: any[] = [];
      document
        .querySelectorAll(".playing-batsmen-wrapper .batsmen-partnership")
        .forEach((el) => {
          const name = el.querySelector(".batsmen-name p")?.textContent?.trim();
          const runs = el.querySelector(".batsmen-score p:nth-child(1)")
            ?.textContent?.trim();
          const balls = el.querySelector(".batsmen-score p:nth-child(2)")
            ?.textContent?.replace(/[()]/g, "")
            .trim();
          const stats = Array.from(
            el.querySelectorAll(".player-strike-wrapper span")
          ).map((s) => s.textContent?.trim());

          if (name) {
            batsmen.push({
              name,
              runs,
              balls,
              fours: stats.find((s) => s?.startsWith("0")) || "0",
              sixes: stats.find((s) => s?.includes("6s")) || "0",
              sr: stats.find((s) => s?.includes("SR")) || "",
            });
          }
        });

      // Bowler (usually last .batsmen-partnership with .bowler class)
      let bowler = null;
      const bowlerEl = document.querySelector(
        ".playing-batsmen-wrapper .batsmen-partnership .bowler"
      );
      if (bowlerEl) {
        const parent = bowlerEl.parentElement;
        const name = parent?.querySelector(".batsmen-name p")?.textContent?.trim();
        const figures = parent
          ?.querySelector(".batsmen-score p:nth-child(1)")
          ?.textContent?.trim();
        const overs = parent
          ?.querySelector(".batsmen-score p:nth-child(2)")
          ?.textContent?.replace(/[()]/g, "")
          .trim();
        const econ = parent
          ?.querySelector(".player-strike-wrapper span:last-child")
          ?.textContent?.replace("Econ:", "")
          .trim();

        bowler = { name, figures, overs, econ };
      }

      return {
        matchTitle,
        team1: { name: team1, flag: team1Flag, score: team1Score, overs: team1Overs },
        team2: { name: team2, flag: team2Flag },
        runRates,
        result,
        batsmen,
        bowler,
      };
    });

    await browser.close();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
