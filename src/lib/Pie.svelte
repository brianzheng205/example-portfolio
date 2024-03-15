<script>
  import * as d3 from 'd3';

  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  export let data = [];
  export let selectedIndex = -1;
  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  let sliceGenerator = d3.pie().value(d => d.value);
  let arcData;
  let arcs;
  $: {
    arcData = sliceGenerator(data);
    arcs = arcData.map(d => arcGenerator(d));
  }
</script>

<div class="container">
  <svg viewBox="-50 -50 100 100">
    {#each arcs as arc, index}
      <path d={arc} fill={ colors(index) }
            class:selected={selectedIndex === index}
            on:click={e => selectedIndex = selectedIndex === index ? -1 : index} />
    {/each}
  </svg>

  <ul class="legend">
    {#each data as d, index}
      <li style="--color: { colors(index) }" class:selected={selectedIndex === index}>
        <span class="swatch"></span>
        {d.label} <em>({d.value})</em>
      </li>
    {/each}
  </ul>
</div>

<style>
  .container {
    display: flex;
    gap: 2em;
    align-items: center;
  }

  svg {
    max-width: 20em;
    margin-block: 2em;
    overflow: visible;
  }

  svg:has(path:hover) {
    path:not(:hover) {
      opacity: 50%;
    }
  }

  path {
    transition: 300ms;
    cursor: pointer;
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