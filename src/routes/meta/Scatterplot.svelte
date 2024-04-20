<script>
  import * as d3 from "d3";
  import { computePosition, autoPlacement, offset } from "@floating-ui/dom";

  export let commits = [],
    selectedCommits = [];

  function isCommitSelected(commit) {
    return selectedCommits.includes(commit);
  }

  // MARGINS
  let width = 1000,
    height = 600;
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

  // SCALES
  let xScale, yScale, rScale;
  $: {
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

  /**
   * Wrapper function to ensure that `commits` used in DOM is always up-to-date
   * because before, rScale was being called on commits that were not in `commits`.
   * @param totalLines
   */
  function rScaleWrapper(totalLines, commits) {
    return rScale(totalLines);
  }

  // TOOLTIP
  let hoveredIndex = -1,
    hoveredCommit = {},
    commitTooltip,
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

  $: {
    if (commits[hoveredIndex] !== undefined) {
      hoveredCommit = commits[hoveredIndex];
    }
  }

  // BRUSH
  function brushed(evt) {
    let brushSelection = evt.selection;
    selectedCommits = !brushSelection
      ? []
      : commits.filter((commit) => {
          let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
          let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
          let x = xScale(commit.datetime);
          let y = yScale(commit.hourFrac);

          return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
        });
  }

  let svg;
  $: {
    d3.select(svg).call(d3.brush().on("start brush end", brushed));
    d3.select(svg).selectAll(".dots, .overlay ~ *").raise();
  }

  // SELECTION
  let hasSelection;
  $: hasSelection = selectedCommits.length > 0;
</script>

<svg viewBox="0 0 {width} {height}" bind:this={svg}>
  <g
    class="gridlines"
    transform="translate({usableArea.left}, 0)"
    bind:this={yAxisGridlines}
  />
  <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
  <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
  <g class="dots">
    {#each commits as commit, index (commit.id)}
      <circle
        cx={xScale(commit.datetime)}
        cy={yScale(commit.hourFrac)}
        r={rScaleWrapper(commit.totalLines, commits)}
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
    transition-delay: {hoveredIndex === -1 ? 50 : 0}ms;
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
  {hasSelection ? selectedCommits.length : "All"} commits selected
</p>

<style>
  svg {
    overflow: visible;
  }

  circle {
    transition: 200ms;
    transform-origin: center;
    transform-box: fill-box;

    @starting-style {
      r: 0;
    }

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
    transition-duration: 200ms;
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
