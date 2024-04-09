<script>
  export let info = {};
  export let hLevel = 2;
</script>

<article>
  <svelte:element this={"h" + hLevel}>{info.title}</svelte:element>
  <img src={info.image} alt={info.title} />

  <p>
    {info.description}
  </p>

  <div class="metadata-container">
    {#if info.url}
      <a class="metadata" href={info.url} target="_blank">MORE INFO</a>
    {/if}
    <p class="year metadata"><strong>{info.year}</strong></p>
  </div>
</article>

<style>
  article {
    grid-template-rows: subgrid;
    grid-row: span 3;
  }

  h2,
  h3 {
    margin: 0;
  }

  .year {
    text-align: right;
  }

  .metadata-container {
    display: flex;

    .metadata {
      flex: 1;
      margin: 0;
    }

    a {
      text-decoration: none;
      font-weight: bold;
      color: var(--color-accent);
    }
  }
</style>
