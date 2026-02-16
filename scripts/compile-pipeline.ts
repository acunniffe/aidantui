#!/usr/bin/env bun
/**
 * Compile pipeline.md into SQLite database stages.
 *
 * Run: bun run compile-pipeline
 *
 * This reads the pipeline.md file, parses the stage definitions,
 * and upserts them into the pipeline_stages table. Stages that
 * no longer exist in the markdown are removed (if they have no deals).
 */

import { resolve } from "path";
import { getDb } from "../src/db/connection";
import { runMigrations } from "../src/db/migrations";
import { compilePipeline } from "../src/services/pipeline.service";

function main() {
  const pipelinePath = resolve(process.cwd(), "pipeline.md");

  console.log("=== Pipeline Compiler ===\n");
  console.log(`Reading: ${pipelinePath}\n`);

  const db = getDb();
  runMigrations(db);

  try {
    const result = compilePipeline(db, pipelinePath);

    console.log(`  Created: ${result.created} stage(s)`);
    console.log(`  Updated: ${result.updated} stage(s)`);
    console.log(`  Deleted: ${result.deleted} stage(s)`);
    console.log("\nDone!");
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  db.close();
}

main();
