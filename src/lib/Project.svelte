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
  <p class="year"><strong>{info.year}</strong></p>
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
    margin: 0;
  }
</style>
