<script>
  import * as d3 from "d3";
  import Projects from "$lib/Projects.svelte";
  import Pie from "$lib/Pie.svelte";
  import projects from "$lib/projects.json";

  let query = "",
    filteredProjects,
    pieData,
    selectedYear,
    selectedYearIndex = -1,
    filteredByYear;
  $: {
    filteredProjects = projects.filter((project) => {
      let values = Object.values(project).join("\n").toLowerCase();
      return values.includes(query.toLowerCase());
    });
    // Pie Chart data
    let rolledData = d3
      .rollups(
        filteredProjects,
        (v) => v.length,
        (d) => d.year
      )
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
    pieData = rolledData.map(([year, count]) => {
      return { value: count, label: year };
    });
    console.log(pieData);
    selectedYear =
      selectedYearIndex > -1 ? pieData[selectedYearIndex].label : null;

    filteredByYear = projects.filter((project) => {
      let values = Object.values(project).join("\n").toLowerCase();
      return (
        values.includes(query.toLowerCase()) &&
        (selectedYear ? project.year === selectedYear : true)
      );
    });
  }
</script>

<svelte:head>
  <title>Projects</title>
</svelte:head>
<h1>{projects.length} Projects</h1>
<Pie data={pieData} bind:selectedIndex={selectedYearIndex} />
<input
  type="search"
  bind:value={query}
  aria-label="Search projects"
  placeholder="🔍 Search projects…"
/>
<Projects projects={filteredByYear} />
