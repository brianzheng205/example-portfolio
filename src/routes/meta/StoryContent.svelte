<script>
  import * as d3 from "d3";
  import CommitsStory from "$lib/commits.json";

  export let commit;
</script>

<p>
  On {commit.datetime.toLocaleString("en", {
    dateStyle: "full",
    timeStyle: "short",
  })}, I edited <strong>{commit.totalLines}</strong> lines across
  <strong
    >{d3.rollups(
      commit.lines,
      (D) => D.length,
      (d) => d.file
    ).length}</strong
  >
  files.
  {CommitsStory[commit.id]}
  Check out the commit (<a href={commit.url} target="_blank">{commit.id}</a>)
  for more details.
</p>
