<script>
  export let stats = {};
</script>

<dl>
  {#each stats as s}
    <div>
      <dt>{s.title}</dt>
      <dd>{s.data}</dd>
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
