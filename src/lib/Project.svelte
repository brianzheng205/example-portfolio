<script>
  export let info = {};
  export let hLevel = 2;
  let p = info;
</script>

<style>
  article {
    grid-template-rows: subgrid;
    grid-row: span 3;
  }

  h2,
  h3 {
    margin: 0;
  }
</style>

<article>
  <svelte:element this={"h" + hLevel}>{ p.title }</svelte:element>
  <img
    src={p.image}
    alt=""
  />
  <p>
    {p.description}
  </p>
</article>