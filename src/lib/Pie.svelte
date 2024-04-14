<script>
  import * as d3 from "d3";

  export let data = [];
  let selectedIndex = -1;
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let pieData;
  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  let sliceGenerator = d3.pie().value((d) => d.value);
  $: {
    pieData = data.map((d) => ({ ...d }));
    let arcData = sliceGenerator(pieData);
    let arcs = arcData.map((d) => arcGenerator(d));
    pieData = pieData.map((d, i) => ({ ...d, ...arcData[i], arc: arcs[i] }));
  }

  function toggleWedge(index, event) {
    if (!event.key || event.key === "Enter") {
      selectedIndex = selectedIndex === index ? -1 : index;
    }
  }
</script>

<div class="container">
  <svg viewBox="-50 -50 100 100">
    {#each pieData as d, index}
      <path
        d={d.arc}
        style="
          --start-angle: {d.arc?.startAngle}rad;
          --end-angle: {d.arc?.endAngle}rad;
        "
        fill={colors(d.label)}
        class:selected={selectedIndex === index}
        on:click={(e) => toggleWedge(index, e)}
        on:keyup={(e) => toggleWedge(index, e)}
        tabindex="0"
        role="button"
        aria-label={d.label}
      />
    {/each}
  </svg>

  {#if pieData.length > 0}
    <ul class="legend">
      {#each pieData as d, index}
        <li
          style="--color: {colors(d.label)}"
          class:selected={selectedIndex === index}
        >
          <span class="swatch" />
          {d.label} <em>({d.value})</em>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .container {
    display: flex;
    gap: 3em;
    align-items: center;
  }

  svg {
    max-width: 20em;
    margin-block: 2em;
    overflow: visible;
  }

  svg:has(path:hover, path:focus-visible) {
    path:not(:hover, :focus-visible) {
      opacity: 50%;
    }
  }

  path {
    transition: 300ms;
    cursor: pointer;
    outline: none;
    --angle: calc(var(--end-angle) - var(--start-angle));
    --mid-angle: calc(var(--start-angle) + var(--angle) / 2);

    &.selected {
      transform: rotate(var(--mid-angle)) translateY(-6px) scale(1.1)
        rotate(calc(-1 * var(--mid-angle)));
    }

    transform: rotate(var(--mid-angle)) translateY(0)
      rotate(calc(-1 * var(--mid-angle)));
  }

  .legend {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5em 3em;
    border: 0.15em solid var(--color-accent);
    padding: 0.5em;
    margin: 1em 0;
    max-height: 10em;
    max-width: 50em;

    li {
      display: flex;
      align-items: center;
      gap: 0.2em;
      flex-basis: 1/3;
    }

    .swatch {
      width: 20px;
      height: 20px;
      background-color: var(--color);
      border-radius: 50%;
    }
  }

  .selected {
    --color: oklch(60% 45% 0) !important;

    &:is(path) {
      fill: var(--color);
    }
  }
</style>
