<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  import Stats from "$lib/Stats.svelte";
  import Pie from "$lib/Pie.svelte";
  import CommitScatterplot from "./Scatterplot.svelte";
  import FileLines from "./FileLines.svelte";

  let data = [],
    commits = [],
    selectedCommits = [],
    portfolio_stats = new Map();

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
  });

  // STATS
  $: portfolio_stats = new Map([
    ["TOTAL LINES", filteredLines.length],
    ["TOTAL COMMITS", filteredCommits.length],
    ["NUMBER OF FILES", d3.group(filteredLines, (d) => d.file).size],
    ["LONGEST FILE LENGTH", d3.max(filteredLines, (d) => d.length)],
    ["LONGEST LINE LENGTH", d3.max(filteredLines, (d) => d.line)],
    ["DEEPEST LINE DEPTH", d3.max(filteredLines, (d) => d.depth)],
  ]);

  // SELECTION
  let hasSelection,
    selectedLines,
    languageBreakdown = [];
  $: hasSelection = selectedCommits.length > 0;
  $: {
    selectedLines = (
      selectedCommits.length > 0 ? selectedCommits : commits
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
  let commitProgress = 100;
  let timeScale,
    commitMaxTime,
    filteredCommits = [],
    filteredLines = [];
  $: {
    timeScale = d3
      .scaleTime()
      .domain(d3.extent(commits, (c) => c.datetime))
      .range([0, 100]);
    commitMaxTime = timeScale.invert(commitProgress);
    filteredCommits = commits.filter((c) => c.datetime <= commitMaxTime);
    filteredLines = data.filter((d) => d.datetime <= commitMaxTime);
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

<h2>Commits by time of day</h2>
<div class="slider">
  <div class="bar">
    <label for="time-scale">Show commits until:</label>
    <input
      type="range"
      id="time-scale"
      min="0"
      max="100"
      step="1"
      bind:value={commitProgress}
    />
  </div>
  <time>{commitMaxTime.toLocaleString()}</time>
</div>

<FileLines lines={filteredLines} {colors} />
<CommitScatterplot commits={filteredCommits} bind:selectedCommits />
<Pie data={hasSelection ? languageBreakdown : []} {colors} />

<style>
  .slider {
    display: flex;
    flex-direction: column;
    margin-bottom: 1em;

    .bar {
      display: flex;
      gap: 0.5em;

      label {
        flex: 1;
      }

      input {
        flex: 5;
      }
    }

    time {
      text-align: right;
    }
  }
</style>
