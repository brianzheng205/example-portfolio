<script>
  export let stats = new Map();
  let statsEntries = stats.entries();
  $: statsEntries = stats.entries();
</script>

<dl>
  {#each statsEntries as [title, data]}
    <div>
      <dt>{title.toUpperCase()}</dt>
      <dd>{data}</dd>
    </div>
  {/each}
</dl>

<style>
  dl {
    display: flex;
    flex-wrap: wrap;

    div {
      display: flex;
      flex-direction: column;
      width: calc(100% / 3);
      margin-bottom: 20px;

      dt {
        font-weight: bold;
        font-size: 12px;
      }

      dd {
        margin: 0;
        font-size: 35px;
        line-height: normal;
        font-weight: 50;
      }
    }
  }
</style>
