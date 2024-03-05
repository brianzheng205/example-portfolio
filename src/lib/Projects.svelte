<script>
  import Project from "$lib/Project.svelte";
  export let projects = {}
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
    <Project info={p} />
  {/each}
</div>