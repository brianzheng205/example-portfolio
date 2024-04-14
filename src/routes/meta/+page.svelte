<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { computePosition, autoPlacement, offset } from "@floating-ui/dom";

  import Stats from "$lib/Stats.svelte";
  import Pie from "$lib/Pie.svelte";

  let data = [],
    commits = [],
    portfolio_stats = new Map();
  let width = 1000,
    height = 600;
  let xScale, yScale, rScale;
  let margin = { top: 10, right: 10, bottom: 30, left: 20 },
    usableArea = {
      top: margin.top,
      right: width - margin.right,
      bottom: height - margin.bottom,
      left: margin.left,
    };
  usableArea.width = usableArea.right - usableArea.left;
  usableArea.height = usableArea.bottom - usableArea.top;
  let xAxis, yAxis, yAxisGridlines;

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
    // COMMITS SCATTERPLOT
    xScale = d3
      .scaleTime()
      .domain(d3.extent(commits, (c) => c.datetime))
      .range([usableArea.left, usableArea.right])
      .nice();
    yScale = d3
      .scaleLinear()
      .domain([0, 24])
      .range([usableArea.bottom, usableArea.top]);
    rScale = d3
      .scaleSqrt()
      .domain(d3.extent(commits, (c) => c.totalLines))
      .range([4, 20]);
  });

  $: {
    if (xScale && yScale) {
      d3.select(xAxis).call(d3.axisBottom(xScale));
      d3.select(yAxis).call(
        d3
          .axisLeft(yScale)
          .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00")
      );
    }

    if (yAxisGridlines && yScale) {
      d3.select(yAxisGridlines).call(
        d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width)
      );
    }
  }

  let hoveredIndex = -1,
    hoveredCommit = {};
  $: {
    if (commits[hoveredIndex] !== undefined) {
      hoveredCommit = commits[hoveredIndex];
    }
  }

  let commitTooltip,
    tooltipPosition = { x: 0, y: 0 };

  async function dotInteraction(index, evt) {
    let hoveredDot = evt.target;

    if (evt.type === "mouseenter" || evt.type === "focus") {
      hoveredIndex = index;
      tooltipPosition = await computePosition(hoveredDot, commitTooltip, {
        strategy: "fixed",
        middleware: [offset(30), autoPlacement()],
      });
    } else if (evt.type === "mouseleave" || evt.type === "blur") {
      hoveredIndex = -1;
    } else if (
      evt.type === "click" ||
      (evt.type === "keyup" && evt.key === "Enter")
    ) {
      selectedCommits = [commits[index]];
    }
  }

  let svg,
    selectedCommits = [],
    hasSelection,
    selectedLines,
    languageBreakdown = [];
  $: {
    d3.select(svg).call(d3.brush().on("start brush end", brushed));
    d3.select(svg).selectAll(".dots, .overlay ~ *").raise();
  }
  $: {
    hasSelection = selectedCommits.length > 0;
    selectedLines = (hasSelection ? selectedCommits : commits).flatMap(
      (d) => d.lines
    );
    const f = d3.format(".2f");
    languageBreakdown = d3.rollup(
      selectedLines,
      (D) => f(D.length / selectedLines.length),
      (line) => line.type
    );
    languageBreakdown = Array.from(languageBreakdown.entries());
    for (let i = 0; i < languageBreakdown.length; i++) {
      languageBreakdown[i] = {
        label: languageBreakdown[i][0].toUpperCase(),
        value: languageBreakdown[i][1],
      };
    }
  }

  function brushed(evt) {
    let brushSelection = evt.selection;
    selectedCommits = !brushSelection
      ? []
      : commits.filter((commit) => {
          let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
          let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
          let x = xScale(commit.date);
          let y = yScale(commit.hourFrac);

          return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
        });
  }

  function isCommitSelected(commit) {
    return selectedCommits.includes(commit);
  }
</script>

<svelte:head>
  <title>Meta</title>
</svelte:head>
<h1>Meta</h1>
<p>This page contains data stats about the code of this website.</p>
<Stats stats={portfolio_stats} />
<h2>Commits by time of day</h2>
<svg viewBox="0 0 {width} {height}" bind:this={svg}>
  <g
    class="gridlines"
    transform="translate({usableArea.left}, 0)"
    bind:this={yAxisGridlines}
  />
  <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
  <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
  <g class="dots">
    {#each commits as commit, index}
      <circle
        cx={xScale(commit.datetime)}
        cy={yScale(commit.hourFrac)}
        r={rScale(commit.totalLines)}
        fill={isCommitSelected(commit) ? "orange" : "steelblue"}
        tabindex="0"
        aria-describedby="commit-tooltip"
        aria-haspopup="true"
        role="button"
        on:mouseenter={(evt) => dotInteraction(index, evt)}
        on:mouseleave={(evt) => dotInteraction(index, evt)}
        on:click={(evt) => dotInteraction(index, evt)}
        on:keyup={(evt) => dotInteraction(index, evt)}
        on:focus={(evt) => dotInteraction(index, evt)}
        on:blur={(evt) => dotInteraction(index, evt)}
      />
    {/each}
  </g>
</svg>

<dl
  id="commit-tooltip"
  class="info tooltip"
  hidden={hoveredIndex === -1}
  style="
    top: {tooltipPosition.y}px;
    left: {tooltipPosition.x}px;
    transition-delay: {hoveredIndex === -1 ? 200 : 0}ms;
  "
  bind:this={commitTooltip}
  role="tooltip"
>
  <dt>COMMIT</dt>
  <dd>
    <a href={hoveredCommit.url} target="_blank">{hoveredCommit.id}</a>
  </dd>

  <dt>DATE</dt>
  <dd>
    {hoveredCommit.datetime?.toLocaleString("en", { date: "full" })}
  </dd>

  <dt>TIME</dt>
  <dd>{hoveredCommit.datetime?.toLocaleString("en", { time: "short" })}</dd>

  <dt>AUTHOR</dt>
  <dd>{hoveredCommit.author}</dd>

  <dt>LINES EDITED</dt>
  <dd>{hoveredCommit.totalLines}</dd>
</dl>
<p>
  {hasSelection ? selectedCommits.length : "No"} commits selected
</p>
<Pie data={hasSelection ? languageBreakdown : []} />

<style>
  svg {
    overflow: visible;
  }

  circle {
    transition: 200ms;
    transform-origin: center;
    transform-box: fill-box;

    &:hover {
      transform: scale(1.5);
    }

    &:not(:hover) {
      opacity: 0.7;
    }
  }

  .gridlines {
    stroke-opacity: 0.2;
  }

  dl.info {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0em 0.5em;
    transition-duration: 500ms;
    transition-property: opacity, visibility;

    &[hidden]:not(:hover, :focus-within) {
      opacity: 0;
      visibility: hidden;
    }

    dt {
      margin: 0;
      text-align: right;
      font-weight: bold;
    }

    dd {
      margin: 0;
    }
  }

  .tooltip {
    position: fixed;
    top: 1em;
    left: 2em;
    background-color: oklch(70% 0% 0 / 90%);
    padding: 0.5em;
    box-shadow: 5px 5px 5px rgb(157, 138, 138);
    backdrop-filter: blur(5px);
    border-radius: 0.5em;
  }
</style>
