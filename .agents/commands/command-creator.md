# Command Creator

Create AI agent command documents that produce reliable, consistent outputs for SDLC tasks.

## Purpose

This meta-command helps you create new command documents for AI agents working on software development lifecycle tasks: backend design, QA strategy, code review, architecture decisions, data modeling, deployment planning, and similar structured work.

Good commands are explicit without over-constraining, use examples over explanations, and evolve based on discovered agent behaviors.

**Note**: Commands should never use emojis. Use clear text labels instead (GOOD/BAD, YES/NO, Required/Optional).

## Command Anatomy

Every command should have these core sections (customize as needed):

### 1. Purpose & Scope
**What it does**: Single paragraph explaining what the command enables
**Format**: 2-3 sentences, outcome-focused

**Example:**
```markdown
Create database schema designs that balance normalization with query performance.
Plans specify tables, relationships, indexes, and migration strategy while citing
data modeling principles for key decisions.
```

### 2. Mindset
**What it does**: Sets mental model for approaching the task
**Format**: 1-2 paragraphs establishing perspective and priorities

**Example:**
```markdown
You are a data architect optimizing for long-term maintainability. Treat schema
design as communication mechanism first, storage optimization second. Balance 
theoretical purity with practical query patterns. Flag ambiguity early.
```

### 3. Execution Workflow
**What it does**: Step-by-step process agents follow
**Format**: Phased approach (Phase 1: Understand, Phase 2: Design, Phase 3: Document)

**Critical**: Each step should be actionable. Use forcing functions sparingly—only when you've discovered agent bias through usage.

**Example:**
```markdown
### Phase 1: Requirements Analysis
1. Parse feature requirements and identify entities
2. List relationships and cardinality
3. Note query patterns and access frequency
4. Document constraints (uniqueness, referential integrity)

### Phase 2: Schema Design
5. Map entities to tables with primary keys
6. Define foreign key relationships
7. If 5+ tables, consider schema partitioning strategy
8. Identify indexes based on query patterns

### Phase 3: Validation & Output
9. Self-validate using checklist
10. Output schema with rationale
```

### 4. Decision Criteria
**What it does**: Objective rules for subjective choices
**Format**: When/then tables or if/else logic

**Example:**
```markdown
## Normalization vs Denormalization

| Choose Normalized | Choose Denormalized |
|-------------------|---------------------|
| Write-heavy workload | Read-heavy workload |
| Data consistency critical | Query performance critical |
| Storage cost matters | Join cost unacceptable |
```

### 5. Field Specifications
**What it does**: Defines required and optional output fields with constraints
**Format**: Required fields first, then optional, with clear format/length/content rules

**Example:**
```markdown
### Required Fields

#### Table Name
- Format: snake_case, plural noun
- Max length: 50 characters
- Examples: "users", "order_items", "payment_methods"

#### Rationale
- Format: 1-3 sentences, max 300 characters
- Must cite: Data modeling principle from catalog
- Examples: "Normalized to 3NF to eliminate update anomalies. Supports consistency principle."
```

### 6. Output Template
**What it does**: Exact structure agents should produce
**Format**: Complete markdown template with placeholders and formatting rules

**Example:**
```markdown
## Output Template

\`\`\`markdown
# Database Schema: [Feature Name]

## Tables

### [TableName]
- **Purpose**: [What this table stores]
- **Primary Key**: [column_name]
- **Relationships**: 
  - [relationship description]
- **Indexes**: 
  - [index description and rationale]
- **Rationale**: [Why designed this way, principles cited]

[Repeat for each table]

## Migration Strategy
- [Approach and considerations]
\`\`\`
```

### 7. Self-Validation Checklist
**What it does**: Quality checks agents run before finalizing output
**Format**: Checkboxes covering completeness, consistency, quality

**Critical**: This catches issues before human review. Include checks for common failure modes.

**Example:**
```markdown
### Schema Completeness
- [ ] All entities from requirements mapped to tables
- [ ] All relationships defined with cardinality
- [ ] Primary key specified for every table
- [ ] Foreign keys match referenced primary keys

### Quality Checks
- [ ] Table names follow naming convention
- [ ] Every design decision cites data modeling principle
- [ ] Indexes justified by query patterns
- [ ] Migration strategy addresses data preservation
```

### 8. Examples
**What it does**: Shows good and bad outputs
**Format**: Labeled examples with annotations

**Critical**: Examples are how agents learn. Include:
- Minimal viable example (simplest case)
- Complex realistic example (shows depth)
- Anti-pattern examples (what NOT to do)

**Note**: Never use emojis in examples. Use "GOOD", "BAD", "Required", "Optional" as text labels.

**Example:**
```markdown
### GOOD Example

\`\`\`markdown
### users
- **Purpose**: Store user account information
- **Primary Key**: id (UUID)
- **Relationships**: 
  - Has many orders (one-to-many)
- **Indexes**: 
  - email (unique) - login lookup
  - created_at - admin analytics
- **Rationale**: Normalized to 3NF. UUID primary key supports distributed systems.
  Separate profile table avoided to reduce join cost for common queries (KISS principle).
\`\`\`

### BAD Example

\`\`\`markdown
### user_data
- Stores stuff about users
- Columns: id, email, name, password, address, orders_json
\`\`\`
**Problems**: Vague purpose, denormalized (orders_json), no relationships, no rationale.
```

### 9. Guardrails
**What it does**: Critical constraints agents must follow
**Format**: Bullet list, concise, enforceable

**Critical**: Use sparingly. Only add guardrails for:
- Discovered agent biases (through usage)
- Critical errors that break downstream processes
- Security/safety concerns

**Example:**
```markdown
## Guardrails

- **No god tables**: Single table serving multiple purposes indicates design failure
- **Cite principles**: Every design choice must reference modeling principle
- **Specify types**: Column types required (no "string" or "number")
- **Self-validate**: Run complete checklist before finalizing
```

## Optional Sections (Add When Needed)

### Glossary / Reference Library
**When to include**: Domain has canonical terms needing definition
**Format**: Separate reference file linked from main command

### Principles Catalog
**When to include**: Decisions should cite established principles (like UI planner)
**Format**: Named principles with brief descriptions

### Pattern Library
**When to include**: Common solutions exist for recurring problems
**Format**: Pattern name, when to use, examples

### Tool Recommendations
**When to include**: Specific tools are industry standard for this task type
**Format**: Tool name, when appropriate, alternatives

## Determining Complexity Level

Use this rubric to determine how detailed your command should be:

### Factors Increasing Complexity Need:

| Factor | Low Need | High Need |
|--------|----------|-----------|
| **Task Ambiguity** | Clear requirements, obvious approach | Multiple valid approaches, judgment required |
| **Decision Points** | Few choices, obvious answers | Many choices, trade-offs unclear |
| **Output Diversity** | Narrow output format | Wide variety of valid outputs |
| **Failure Modes** | Errors obvious and easy to fix | Silent failures, hard to detect issues |
| **Domain Knowledge** | General programming knowledge | Specialized expertise required |
| **Downstream Impact** | Mistakes caught easily | Errors propagate to other systems |

**Simple Command Example (50-150 lines):**
- Task: Format code according to style guide
- Few decisions, clear right/wrong answers
- Output is transformed input (deterministic)
- Structure: Purpose, Workflow (5 steps), Examples, Checklist

**Complex Command Example (400-700 lines):**
- Task: Design UI information architecture (like ui-planner.md)
- Many decisions, multiple valid approaches
- Output varies widely based on requirements
- Structure: Full anatomy + glossary + principles + extensive examples

## Workflow for Creating a Command

### Phase 1: Define Scope
1. **Name the task** clearly (verb + noun: "Design Database Schema", "Review Code Quality")
2. **Identify success criteria** (what makes output "good"?)
3. **List decision points** where agent needs guidance
4. **Determine complexity** using rubric above
5. **Choose sections** from command anatomy (all required, some optional)

### Phase 2: Draft Command
6. **Write Purpose & Mindset** (sets expectations)
7. **Create workflow steps** (actionable, sequential)
8. **Build decision criteria** (objective rules for choices)
9. **Define field specs** (required/optional with constraints)
10. **Draft output template** (exact structure)
11. **Create examples** (good, complex, anti-pattern)
12. **Write self-validation checklist** (catches common errors)
13. **Add guardrails** (only critical constraints)

### Phase 3: Test & Iterate
14. **Test with AI agent** on real task
15. **Review agent output** against criteria
16. **Identify patterns**:
    - Agent consistently misses something? → Add to checklist
    - Agent defaults to same approach? → Add decision checkpoint
    - Agent asks clarifying questions? → Workflow ambiguous
    - Output inconsistent? → Field specs unclear
17. **Update command** based on findings
18. **Document iteration** (what changed, why)
19. **Re-test** until consistent results

### Phase 4: Maintain
20. **Monitor usage** over time
21. **Watch for drift** (outputs degrade or shift)
22. **Discover biases** (agent defaults, patterns)
23. **Refine** when needed (not preemptively)

## Quality Criteria

A good command:

### Clarity
- [ ] Agent understands task after reading once
- [ ] Every step is actionable (no vague instructions)
- [ ] Field specifications leave no ambiguity
- [ ] Examples show rather than tell

### Completeness
- [ ] All required outputs specified
- [ ] Decision points have objective criteria
- [ ] Output template covers all cases
- [ ] Self-validation catches common errors

### Balance
- [ ] Explicit enough to ensure consistency
- [ ] Flexible enough to handle variation
- [ ] Not over-constrained with unnecessary rules
- [ ] Examples outnumber explanations
- [ ] No emojis used (use text labels instead)

### Maintainability
- [ ] Organized logically (easy to find information)
- [ ] Concise (no redundant sections)
- [ ] Signals where iteration is expected
- [ ] Version history tracked (if significant changes)

### Effectiveness
- [ ] Produces consistent outputs across executions
- [ ] Agent follows correctly on first try
- [ ] Human review time minimal
- [ ] Final deliverable meets quality bar

## Iteration Guidance

Commands evolve. Expect to refine based on usage.

### When to Update

**Update immediately if:**
- Agent consistently produces wrong output
- Critical errors slip through self-validation
- Downstream processes break

**Update after pattern emerges (3+ instances) if:**
- Agent defaults to same approach without considering alternatives
- Specific sections consistently incomplete or incorrect
- Clarifying questions repeat

**Don't update if:**
- Single agent error (might be context, not command)
- Output works but isn't your preferred style
- Agent follows correctly but you want different outcome (requirements change, not command issue)

### How to Update

1. **Identify root cause**:
   - Ambiguous instruction? → Clarify workflow step
   - Missing guidance? → Add decision criteria
   - Discovered bias? → Add checkpoint (not just warning)
   - Incomplete spec? → Enhance field definition

2. **Choose fix approach**:
   - **Structural fix** (best): Change workflow to ask right question at right time
   - **Criteria addition**: Add objective decision rule
   - **Example addition**: Show pattern you want to see
   - **Guardrail** (last resort): Only for discovered bias or critical error

3. **Test the fix**:
   - Verify fix addresses issue
   - Ensure fix doesn't over-constrain
   - Check for unintended consequences

4. **Document change**:
   - Note what changed and why
   - Include example of old vs new behavior
   - Date the update

### Version History

Keep lightweight changelog if command evolves significantly:

```markdown
## Version History

**v2.1** (2025-01-15): Added decision checkpoint for partition strategy when 5+ tables exist. Agents were defaulting to monolithic schema without considering microservices implications.

**v2.0** (2024-12-01): Restructured workflow to address normalization bias. Agents over-normalized at expense of query performance. Added decision criteria table for normalization vs denormalization trade-offs.

**v1.0** (2024-10-01): Initial version
```

## Anti-Patterns

### Over-Constraining
**Problem**: Too many specific rules that limit valid approaches
**Example**: "Always use UUID primary keys" (sometimes auto-increment is fine)
**Fix**: Use decision criteria table showing when to use each approach

### Assuming Biases
**Problem**: Adding preventive guardrails before observing actual agent behavior
**Example**: Adding 5 rules about what NOT to do without evidence agents do it
**Fix**: Start simple, add guardrails only after discovering patterns

### Vague Instructions
**Problem**: Steps that aren't actionable or leave agent guessing
**Example**: "Design a good schema" (what does "good" mean?)
**Fix**: Define concrete steps with objective criteria

### Missing Examples
**Problem**: All explanation, no demonstration
**Example**: Long paragraph describing good table design without showing one
**Fix**: Replace or supplement explanations with annotated examples

### Buried Critical Information
**Problem**: Important constraints hidden in long paragraphs
**Example**: "Also remember to always cite principles" at end of section
**Fix**: Move to Guardrails section, add to self-validation checklist

### Redundant Sections
**Problem**: Same information repeated in multiple places
**Example**: Naming conventions in workflow, field specs, guardrails, and examples
**Fix**: Define once in field specs, reference elsewhere

### Prescriptive Implementation
**Problem**: Telling agents HOW instead of WHAT
**Example**: "Use React useState hook for managing form state"
**Fix**: "Track form state changes, provide validation feedback" (implementation open)

### Ignoring Context
**Problem**: Command assumes specific environment or tooling
**Example**: Referencing internal tools, company-specific frameworks
**Fix**: Keep general, or create separate tool-specific addendum

### Using Emojis
**Problem**: Emojis in commands or examples
**Example**: "Good naming convention" or "Bad: god tables"
**Fix**: Use clear text labels: "GOOD naming convention" or "BAD: god tables"

## Template Structures by Task Type

### Backend API Design Command

**Minimal structure:**
- Purpose, Mindset, Workflow
- Endpoint specifications (path, method, request/response)
- Error handling requirements
- Security considerations
- Examples (CRUD operations)
- Self-validation checklist

**Add if needed:**
- API design principles catalog
- Common patterns (pagination, filtering, auth)
- Tool recommendations (OpenAPI/Swagger)

### Code Review Command

**Minimal structure:**
- Purpose, Mindset, Workflow
- Review dimensions (correctness, style, security, performance)
- Severity levels (critical, important, suggestion)
- Output format (findings with location and rationale)
- Examples (good and bad findings)
- Self-validation checklist

**Add if needed:**
- Code quality principles
- Language-specific patterns
- Security vulnerability reference

### QA Strategy Command

**Minimal structure:**
- Purpose, Mindset, Workflow
- Test coverage criteria
- Test types (unit, integration, e2e)
- Priority/risk assessment
- Output format (test plan)
- Examples (simple and complex features)
- Self-validation checklist

**Add if needed:**
- Testing principles
- Common test patterns
- Tool recommendations (testing frameworks)

### Architecture Decision Command

**Minimal structure:**
- Purpose, Mindset, Workflow
- Decision dimensions (performance, scalability, maintainability)
- Trade-off analysis format
- Output format (ADR - Architecture Decision Record)
- Examples (technology choice, pattern choice)
- Self-validation checklist

**Add if needed:**
- Architecture principles catalog
- Common patterns library
- Trade-off frameworks

## Meta-Command Self-Check

Before finalizing your new command, verify:

### Structure
- [ ] All required sections present (1-9 from Command Anatomy)
- [ ] Optional sections included only if needed
- [ ] Logical flow (purpose → workflow → output → validation)
- [ ] Sections are appropriately sized (not too long/short)

### Clarity
- [ ] Purpose states outcome clearly
- [ ] Workflow steps are actionable
- [ ] Decision criteria are objective
- [ ] Field specs have clear constraints
- [ ] Examples show good and bad patterns

### Completeness
- [ ] Output template covers all requirements
- [ ] Self-validation catches common errors
- [ ] Examples demonstrate key concepts
- [ ] Guardrails address critical constraints only

### Balance
- [ ] Not over-constrained (allows valid variation)
- [ ] Not under-specified (prevents inconsistency)
- [ ] Examples > explanations ratio
- [ ] Forcing functions only for discovered biases

### Testability
- [ ] Can test command with real agent on real task
- [ ] Success/failure clear from output
- [ ] Iteration path clear if command needs refinement

---

## Getting Started

1. **Identify task** needing command
2. **Assess complexity** using rubric
3. **Choose template** structure from examples above
4. **Draft command** following anatomy
5. **Test with agent** on real work
6. **Iterate** based on results
7. **Document** lessons learned

Remember: Commands evolve. Start simple, add structure as you discover what agents need. Prefer structural fixes (better workflow) over reactive warnings.
