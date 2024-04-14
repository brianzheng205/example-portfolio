<script>
  import * as d3 from "d3";
  import { scale } from "svelte/transition";
  import { flip as originalFlip } from "svelte/animate";

  export let lines = [],
    colors = d3.scaleOrdinal(d3.schemeTableau10);
  let files = [];
  $: {
    files = d3
      .groups(lines, (d) => d.file)
      .map(([name, lines]) => {
        return { name, lines };
      });

    files = d3.sort(files, (d) => -d.lines.length);
  }

  function getFlip() {
    return originalFlip;
  }
  $: flip = getFlip(files);
</script>

<dl class="files">
  {#each files as file (file.name)}
    <div class="file" animate:flip>
      <dt>
        <code>{file.name} <small>{file.lines.length} lines</small></code>
      </dt>
      <dd>
        {#each file.lines as line (line.line)}
          <div class="line" style="--color: {colors(line.type)}" in:scale />
        {/each}
      </dd>
    </div>
  {/each}
</dl>

<style>
  .files {
    display: flex;
    flex-direction: column;
    gap: 1em;

    .file {
      display: flex;
      justify-content: space-between;
      gap: 2em;

      dt {
        flex: 1;

        small {
          display: block;
          opacity: 0.8;
        }
      }

      dd {
        flex: 2;
        display: flex;
        flex-wrap: wrap;
        align-items: start;
        align-content: start;
        gap: 0.15em;
        padding-top: 0.6em;
        margin-left: 0;

        .line {
          display: flex;
          width: 0.5em;
          aspect-ratio: 1;
          background: var(--color);
          border-radius: 50%;
        }
      }
    }
  }
</style>
