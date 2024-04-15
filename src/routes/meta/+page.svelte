<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import Scrolly from "svelte-scrolly";

  import Stats from "$lib/Stats.svelte";
  import Pie from "$lib/Pie.svelte";
  import CommitScatterplot from "./Scatterplot.svelte";
  import FileLines from "./FileLines.svelte";

  let data = [],
    commits = [],
    selectedCommits = [],
    portfolio_stats = new Map(),
    timeScale;

  onMount(async () => {
    data = await d3.csv("loc.csv", (row) => ({
      ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + "T00:00" + row.timezone),
      datetime: new Date(row.datetime),
    }));
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: "https://github.com/vis-society/lab-7/commit/" + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };

        Object.defineProperty(ret, "lines", {
          value: lines,
          configurable: true,
          writable: true,
          enumerable: false,
        });

        return ret;
      });
    commits = d3.sort(commits, (d) => -d.totalLines);
    portfolio_stats = new Map([
      ["TOTAL LINES", data.length],
      ["TOTAL COMMITS", commits.length],
      ["NUMBER OF FILES", d3.group(data, (d) => d.file).size],
      ["LONGEST FILE LENGTH", d3.max(data, (d) => d.length)],
      ["LONGEST LINE LENGTH", d3.max(data, (d) => d.line)],
      ["DEEPEST LINE DEPTH", d3.max(data, (d) => d.depth)],
    ]);
    timeScale = d3
      .scaleTime()
      .domain(d3.extent(commits, (c) => c.datetime))
      .range([0, 100]);
  });

  // STATS
  $: portfolio_stats = new Map([
    ["TOTAL LINES", data.length],
    ["TOTAL COMMITS", commits.length],
    ["NUMBER OF FILES", d3.group(data, (d) => d.file).size],
    ["LONGEST FILE LENGTH", d3.max(data, (d) => d.length)],
    ["LONGEST LINE LENGTH", d3.max(data, (d) => d.line)],
    ["DEEPEST LINE DEPTH", d3.max(data, (d) => d.depth)],
  ]);

  // SELECTION
  let hasSelection,
    selectedLines,
    languageBreakdown = [];
  $: hasSelection = selectedCommits.length > 0;
  $: {
    selectedLines = (
      selectedCommits.length > 0 ? selectedCommits : filteredCommits
    ).flatMap((d) => d.lines);
    const f = d3.format(".2f");
    const languageBreakdownDict = d3.rollup(
      selectedLines,
      (D) => f(D.length / selectedLines.length),
      (line) => line.type
    );
    languageBreakdown = Array.from(languageBreakdownDict.entries());
    for (let i = 0; i < languageBreakdown.length; i++) {
      languageBreakdown[i] = {
        label: languageBreakdown[i][0],
        value: languageBreakdown[i][1],
      };
    }
  }

  // FILTERING
  let commitProgressP = 100;
  let commitMaxTimeP,
    filteredCommits = []; // filtering for scatterplot
  $: {
    if (timeScale) {
      commitMaxTimeP = timeScale.invert(commitProgressP);
      filteredCommits = commits.filter((c) => c.datetime <= commitMaxTimeP);
    }
  }

  let commitProgressL = 100;
  let commitMaxTimeL,
    filteredLines = []; // filtering for file lines
  $: {
    if (timeScale) {
      commitMaxTimeL = timeScale.invert(commitProgressL);
      filteredLines = data.filter((d) => d.datetime <= commitMaxTimeL);
    }
  }

  // COLORS
  const colors = d3.scaleOrdinal(d3.schemeTableau10);
</script>

<svelte:head>
  <title>Meta</title>
</svelte:head>
<h1>Meta</h1>
<p>This page contains data stats about the code of this website.</p>

<Stats stats={portfolio_stats} />

<Scrolly bind:progress={commitProgressP}>
  {#each commits as commit, index}
    <p>
      On {commit.datetime.toLocaleString("en", {
        dateStyle: "full",
        timeStyle: "short",
      })}, I made
      <a href={commit.url} target="_blank"
        >{index > 0
          ? "another glorious commit"
          : "my first commit, and it was glorious"}</a
      >. I edited {commit.totalLines} lines across {d3.rollups(
        commit.lines,
        (D) => D.length,
        (d) => d.file
      ).length} files. Then I looked over all I had made, and I saw that it was very
      good.
    </p>
  {/each}

  <svelte:fragment slot="viz">
    <h2>Commits by time of day</h2>
    <CommitScatterplot commits={filteredCommits} bind:selectedCommits />
    <Pie data={languageBreakdown} {colors} />
  </svelte:fragment>
</Scrolly>

<Scrolly
  bind:progress={commitProgressL}
  --scrolly-layout="viz-first"
  throttle={200}
>
  {#each commits as commit, index}
    <p>
      On {commit.datetime.toLocaleString("en", {
        dateStyle: "full",
        timeStyle: "short",
      })}, I made
      <a href={commit.url} target="_blank"
        >{index > 0
          ? "another glorious commit"
          : "my first commit, and it was glorious"}</a
      >. I edited {commit.totalLines} lines across {d3.rollups(
        commit.lines,
        (D) => D.length,
        (d) => d.file
      ).length} files. Then I looked over all I had made, and I saw that it was very
      good.
    </p>
  {/each}

  <svelte:fragment slot="viz">
    <FileLines lines={filteredLines} {colors} />
  </svelte:fragment>
</Scrolly>

<style>
  :global(body) {
    max-width: min(120ch, 80vw);
  }
</style>
