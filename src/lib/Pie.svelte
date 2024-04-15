<script>
  import * as d3 from "d3";

  export let data = [],
    colors = d3.scaleOrdinal(d3.schemeTableau10),
    transitionDuration = 300;
  let selectedIndex = -1;
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let pieData;
  let sliceGenerator = d3
    .pie()
    .value((d) => d.value)
    .sort(null);
  $: {
    oldData = pieData;
    const pieDataIR = d3.sort(
      data.map((d) => ({ ...d })),
      (d) => d.label
    );
    const arcData = sliceGenerator(pieDataIR);
    const arcs = arcData.map((d) => arcGenerator(d));
    pieData = pieDataIR.map((d, i) => ({ ...d, ...arcData[i], arc: arcs[i] }));
    transitionArcs();
  }

  function toggleWedge(index, event) {
    if (!event.key || event.key === "Enter") {
      selectedIndex = selectedIndex === index ? -1 : index;
      console.log(selectedIndex);
    }
  }

  // TRANSITION
  let oldData = [],
    wedges = {};

  /**
   * Transition-in function for arcs
   * @param wedge
   */
  function arc(wedge) {
    let transition = transitionArc(wedge);

    return {
      duration: transitionDuration,
      css: (t, u) => {
        return transition.interpolator(transition.type === "out" ? u : t);
      },
    };
  }

  /**
   * Transition-bewteen function for arcs
   * @param wedge
   */
  function transitionArcs() {
    let wedgeElements = Object.values(wedges);

    d3.selectAll(wedgeElements)
      .transition("arc")
      .duration(transitionDuration)
      .ease(d3.easeLinear)
      .styleTween("d", function (_, index) {
        let wedge = this;
        let label = Object.keys(wedges)[index];
        let transition = transitionArc(wedge, label);
        return transition?.interpolator;
      });
  }

  function transitionArc(wedge, label) {
    label ??= Object.entries(wedges).find(([label, w]) => w === wedge)[0];
    let d_old = oldData.find((d) => d.label === label);
    let d = pieData.find((d) => d.label === label);

    if (sameArc(d_old, d)) {
      return null;
    }

    let from = d_old ? { ...d_old } : getEmptyArc(label, oldData);
    let to = d ? { ...d } : getEmptyArc(label);
    let angleInterpolator = d3.interpolate(from, to);
    let interpolator = (t) => `path("${arcGenerator(angleInterpolator(t))}")`;
    let type = d ? (d_old ? "update" : "in") : "out";
    return { d, d_old, from, to, interpolator, type };
  }

  function sameArc(d1, d2) {
    return (
      (!d1 && !d2) ||
      (d1?.startAngle === d2?.startAngle && d1?.endAngle === d2?.endAngle)
    );
  }

  function getEmptyArc(label, data = pieData) {
    let labels = d3.sort(new Set([...oldData, ...pieData].map((d) => d.label)));
    let labelIndex = labels.indexOf(label);
    let sibling;
    for (let i = labelIndex - 1; i >= 0; i--) {
      sibling = data.find((d) => d.label === labels[i]);
      if (sibling) {
        break;
      }
    }

    let angle = sibling?.endAngle ?? 0;
    return { startAngle: angle, endAngle: angle };
  }
</script>

<div class="container" style={pieData.length == 0 && "visibility: hidden"}>
  <svg viewBox="-50 -50 100 100">
    {#each pieData as d, index (d.label)}
      <path
        d={d.arc}
        style="
          --start-angle: {d?.startAngle}rad;
          --end-angle: {d?.endAngle}rad;
        "
        fill={colors(d.label)}
        class:selected={selectedIndex === index}
        on:click={(e) => toggleWedge(index, e)}
        on:keyup={(e) => toggleWedge(index, e)}
        tabindex="0"
        role="button"
        aria-label={d.label}
        bind:this={wedges[d.label]}
        transition:arc
      />
    {/each}
  </svg>

  <ul class="legend">
    {#each pieData as d, index (d.label)}
      <li
        style="--color: {colors(d.label)}"
        class:selected={selectedIndex === index}
      >
        <span class="swatch" />
        {d.label} <em>({d.value})</em>
      </li>
    {/each}
  </ul>
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
    transition-property: transform, opacity, fill;
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
