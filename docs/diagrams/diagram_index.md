# Diagram Index

This index catalogs all architectural and component diagrams for the CaterKing project. Each entry includes the diagram's intent, dependencies, and references to iterations or tasks.

| Diagram Name                | File Path                              | Description                                                                                                                                                                                                                  | Dependencies | Iteration References                                                           |
| --------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------ |
| Component Overview          | docs/diagrams/component_overview.puml  | High-level C4-PlantUML overview of the entire CaterKing platform, including apps, libs, Supabase services, and ops tooling.                                                                                                  | None         | I1.T1 (foundation), I1.T2 (structure)                                          |
| PrepChef Components Diagram | docs/diagrams/prepchef_components.puml | Detailed PlantUML diagram showing server/client components, React Query caches, realtime adapter, mutation service, and undo controller interactions specific to the PrepChef app, referencing Section 2 of UI architecture. | I1.T1, I1.T2 | I1.T3 (this task); upcoming I2.T6 (UI skeleton), I2.T7 (component integration) |
| Deployment View             | docs/diagrams/deployment_view.puml     | Deployment architecture diagram.                                                                                                                                                                                             | TBD          | TBD                                                                            |
| Supabase ERD                | docs/diagrams/supabase_erd.mmd         | **PRIMARY SOURCE** - Comprehensive Entity-Relationship Diagram in Mermaid format with changelog. Includes all 18 tables, relationships, and schema evolution history.                                                        | Migrations   | All iterations (maintained continuously)                                       |
| Knowledge Base Content Flow | docs/diagrams/knowledge_flow.mmd       | Mermaid flowchart describing author upload, validation, processing, realtime updates, playback, and failure recovery for the knowledge base stack mapping Admin CRM authoring to PrepChef drawers.                           | I3.T2        | I3.T3, I3                                                                      |

## How to Regenerate PNG/SVG

To render PlantUML diagrams locally:

1. Install PlantUML (e.g., via Java or VS Code extension).
2. Run `plantuml <filename>.puml` to generate PNG/SVG.

For online rendering, upload to a PlantUML server or use GitHub's Mermaid renderer for .mmd files.

Keep labels ASCII-safe to ensure compatibility across renderers.</content>
<filePath>docs/diagrams/diagram_index.md
