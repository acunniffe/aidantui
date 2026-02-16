import type { StageDef } from "../types";

/**
 * Parse pipeline.md into stage definitions.
 *
 * Expected format:
 * # Pipeline Name
 * ## Stage Name
 * - order: 1
 * - color: #3498db
 * - required_info: field1, field2
 * - enter_trigger: trigger-name
 * - leave_trigger: trigger-name
 */
export function parsePipelineMarkdown(content: string): StageDef[] {
  const stages: StageDef[] = [];

  // Split on H2 headings
  const sections = content.split(/^## /m).slice(1); // skip everything before first ##

  for (const section of sections) {
    const lines = section.trim().split("\n");
    const name = lines[0].trim();

    if (!name) continue;

    const props: Record<string, string> = {};

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      // Match "- key: value" or "- key:value"
      const match = line.match(/^-\s+(\w+)\s*:\s*(.+)$/);
      if (match) {
        props[match[1]] = match[2].trim();
      }
    }

    const stage: StageDef = {
      name,
      order: parseInt(props.order ?? String(stages.length + 1), 10),
    };

    if (props.color) stage.color = props.color;
    if (props.required_info) {
      stage.requiredInfo = props.required_info.split(",").map((s) => s.trim());
    }
    if (props.enter_trigger) stage.enterTrigger = props.enter_trigger;
    if (props.leave_trigger) stage.leaveTrigger = props.leave_trigger;

    stages.push(stage);
  }

  return stages;
}
