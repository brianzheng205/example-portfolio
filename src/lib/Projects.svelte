<script>
  import Project from "$lib/Project.svelte";
  export let projects = {}
  export let hLevel = 2;
</script>

<style>
  .projects {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15em, 1fr));
    gap: 1em;
  }
</style>

<div class="projects">
  {#each projects as p}
    <Project info={p} hLevel={hLevel}/>
  {/each}
</div>