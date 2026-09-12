import { defineDynamic, defineInstructions } from "eve/instructions";

const ZONA = "America/Asuncion";

// Relative days ("para mañana") need today's date in Asunción (instructions.md, step 5).
// Turn scope, so a conversation that crosses midnight resolves against the right day.
export default defineDynamic({
  events: {
    "turn.started": () => {
      const ahora = new Date();
      const hoy = new Intl.DateTimeFormat("en-CA", {
        timeZone: ZONA,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(ahora);
      const legible = new Intl.DateTimeFormat("es-PY", {
        timeZone: ZONA,
        dateStyle: "full",
        timeStyle: "short",
      }).format(ahora);
      return defineInstructions({
        content: `## Current date\nNow in Asunción it is ${legible}. Today is ${hoy} (YYYY-MM-DD).`,
      });
    },
  },
});
