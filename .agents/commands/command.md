# Command Creator

Create AI agent command documents for SDLC tasks. Commands define structure and principles—agents produce drafts that get iterated on.

## Purpose

Help create command documents for AI agents doing software development work: API design, code review, QA strategy, architecture decisions, etc. 

Output is a structured draft command. Users refine it through conversation or direct editing based on real agent behavior.

## When to Create a Command

**Create a command when**:
- Task requires structured, repeatable output (specs, plans, reviews)
- Multiple people need consistent results from agents
- Task has clear phases or workflow
- Output format matters (markdown structure, sections, fields)

**Don't create a command when**:
- One-off task
- No structure needed (freeform exploration)
- Existing command already covers it

## Core Principles

Good commands are:
- **Lean**: Structure + principles, not exhaustive rules
- **Clear**: Obvious what output should look like
- **Iterative**: Produce drafts, refine based on actual usage
- **Example-driven**: Show GOOD/BAD, not just explain
- **Model-agnostic**: Work across Claude, GPT, local models

Avoid:
- Over-constraining (character limits, atomicity rules)
- Excessive validation checklists
- Trying to prevent every possible mistake
- Implementation details (let agents decide)
- Emojis (use text labels: GOOD/BAD, Required/Optional)

## Command Structure

Every command should have:

```markdown
# [Command Name]

[One sentence: what this command produces]

## Purpose
[2-3 sentences: what problem this solves, what output looks like]

## Mindset
[1-2 paragraphs: mental model, perspective, priorities]

## Workflow
[Step-by-step phases: Phase 1, Phase 2, Phase 3]

## Output Template
[Exact markdown structure agents should produce]

## Writing Guidelines
[Section-by-section format/content guidance]

## Decision Criteria (optional)
[Tables for subjective choices: When X vs When Y]

## Examples
[GOOD and BAD examples for key concepts]

## Guardrails
[5-7 core principles agents must follow]
```

## Section Guidelines

### Purpose
**Content**: What the command produces, who uses it, why it matters
**Length**: 2-3 sentences max
**Avoid**: Vague "better X" statements

### Mindset
**Content**: Mental model and priorities for approaching the task
**Length**: 1-2 paragraphs
**Purpose**: Helps agents make judgment calls aligned with goals
**Example**: "You're a requirements analyst clarifying scope. Help users figure out what they want. Be collaborative but grounded."

### Workflow
**Structure**: 3-4 phases with numbered steps
**Content**: Actionable steps, not vague instructions
**Forcing functions**: Only add when you discover agent bias through usage
**Example**:
```markdown
### Phase 1: Understand
1. Parse user request
2. Summarize back what you heard
3. Ask 3-5 clarifying questions

### Phase 2: Draft
4. Generate output using template
5. Self-validate against guardrails

### Phase 3: Deliver
6. Output final document
7. Provide one-sentence summary
```

### Output Template
**Content**: Complete markdown structure with placeholders
**Purpose**: Shows exact format agents should produce
**Include**: Section numbers, field names, format hints
**Keep**: Simple and scannable

### Writing Guidelines
**Content**: Format/content/avoid guidance for each template section
**Structure**: 
- **Format**: What it looks like
- **Content**: What goes in it
- **Avoid**: What not to do
- **Example**: Concrete sample

### Decision Criteria
**When to include**: Task has subjective choices
**Format**: Side-by-side tables showing "When X" vs "When Y"
**Purpose**: Helps agents make consistent decisions
**Example**: "Normalize vs Denormalize", "Async vs Sync", "Split vs Combine"

### Examples
**Include**: 1-2 GOOD/BAD pairs per key concept
**Label**: Use "GOOD:" and "BAD:", never emojis
**Explain**: Brief "why" after each BAD example
**Keep**: Short and focused

### Guardrails
**Content**: 5-7 core principles agents must follow
**Format**: Bullet list with brief explanation
**Purpose**: Prevent common mistakes discovered through usage
**Example**:
```markdown
- No implementation details: Describe what, not how
- Observable evidence only: No vague "users satisfied"
- Let user drive scope: When they say "keep simple," respect it
```

## Template

Use this as starting point, customize sections as needed:

```markdown
# [Command Name]

[One sentence describing output]

## Purpose

[2-3 sentences: problem solved, output produced, who uses it]

## Mindset

[1-2 paragraphs: mental model, perspective, priorities for approaching task]

## Workflow

### Phase 1: [Name]
1. [Action step]
2. [Action step]
3. [Action step]

### Phase 2: [Name]
4. [Action step]
5. [Action step]

### Phase 3: [Name]
6. [Action step]
7. [Action step]

## Output Template

```markdown
# [Output Title]

## 1. [Section Name]
[Description of what goes here]

## 2. [Section Name]
[Description of what goes here]

## 3. [Section Name]
[Description of what goes here]
```

## Writing Guidelines

### [Section Name]
**Format**: [Structure description]
**Content**: [What to include]
**Avoid**: [What not to do]
**Example**: [Concrete sample]

### [Section Name]
**Format**: [Structure description]
**Content**: [What to include]
**Avoid**: [What not to do]
**Example**: [Concrete sample]

## Decision Criteria (optional)

### [Choice Name]

| Choose X | Choose Y |
|----------|----------|
| When condition A | When condition B |
| When condition C | When condition D |

## Examples

### GOOD: [Concept]
```
[Example showing correct approach]
```

### BAD: [Concept]
```
[Example showing incorrect approach]
```
**Problem**: [Why this is bad]

## Guardrails

- [Core principle 1]
- [Core principle 2]
- [Core principle 3]
- [Core principle 4]
- [Core principle 5]

## Output

Save to: `.agents/commands/[name].md`
```

## Common Patterns

### Backend API Commands
Focus on: endpoints, request/response schemas, error handling, auth

### Code Review Commands  
Focus on: what to check, severity levels, feedback format

### Planning Commands
Focus on: scope definition, task breakdown, dependencies, estimates

### Architecture Commands
Focus on: component responsibilities, interfaces, tradeoffs, decision rationale

## Self-Check

Before finalizing command:
- [ ] Purpose is clear in 2-3 sentences
- [ ] Output template shows exact structure
- [ ] Workflow has actionable steps (not vague)
- [ ] At least 1 GOOD/BAD example included
- [ ] Guardrails list 5-7 core principles
- [ ] No emojis anywhere (use text labels)
- [ ] No over-constraining (character limits, excessive validation)

## Output

Save command to: `.agents/commands/[name].md`

After creating:
1. **Command document** (complete markdown)
2. **Usage note**: "Test with real agent, iterate based on actual output quality"
3. **Reminder**: "Commands produce drafts. Refine based on usage, not upfront perfection."
