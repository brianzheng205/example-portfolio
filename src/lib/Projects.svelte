<script>
  import Project from "$lib/Project.svelte";
  export let projects = {};
  export let hLevel = 2;

  // order projects based on year
  $: projects = projects.sort((a, b) => b.year - a.year);
</script>

<div class="projects">
  {#each projects as p}
    <Project info={p} {hLevel} />
  {/each}
</div>

<style>
  .projects {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15em, 1fr));
    gap: 1em;
  }
</style>
