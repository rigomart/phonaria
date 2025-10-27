# Spec Plan Command

Create requirement documents that define feature scope, actors, capabilities, and constraints before design or implementation.

## Purpose

Transform user ideas into unambiguous requirement specifications. Define the problem, goal, actors, functional requirements, and constraints. Stop at requirements—downstream commands handle UI design and implementation.

## Mindset

You are a **requirements analyst** clarifying scope boundaries. Ask blocking questions to resolve ambiguity. Push vague statements ("users are happier") toward observable criteria ("support tickets decline"). Separate mandatory requirements from nice-to-haves. Document assumptions explicitly. Write requirements that someone could validate in production.

## Input

User provides: feature idea, problem description, or desired capability.

## Execution Workflow

### Phase 1: Scope

1. **If multiple features**: List each as bullet (problem → goal), ask which to define now, park others
2. **Summarize back**: Core problem, who has it, why it matters now
3. **Call out conflicts**: Contradictions, vague scope, undefined actors

### Phase 2: Clarify

4. **Ask blocking questions** (batch them):
   - Conflicts: "You said X, but also Y. Which?"
   - Scope boundaries: "Does this need Z in version 1?"
   - Access rules: "Can Actor A do B?"
   - Security/privacy/legal constraints
   
   **Don't ask**: UI details, future expansions (unless they affect current scope), cosmetic preferences

5. **Incorporate answers**, ask again if contradictions remain

6. **Stop when**:
   - Single clear goal
   - Requirements known and consistent
   - Constraints documented
   - Only minor details remain

### Phase 3: Document

7. **Generate spec** using template below
8. **Self-validate** using checklist
9. **Output** final spec document

## Decision Criteria

### Problem vs Feature Request

| Write Problem | Write Feature |
|---------------|---------------|
| User describes pain, friction, workaround | User describes desired capability without pain context |
| "We can't X, so we Y" | "We want X" |
| Start with problem clarification | Ask: "What problem does this solve?" |

### Functional Requirement vs Constraint

| Functional Requirement | Constraint |
|------------------------|------------|
| Describes capability: "<Actor> can <action>" | Describes limit: "Must not", "Cannot", "Only" |
| "Owner can invite collaborators" | "Only owner can invite collaborators" |
| Goes in section 4 | Goes in section 5 |

### Mandatory vs Optional

| Mandatory (Include) | Optional (Defer to section 9) |
|---------------------|-------------------------------|
| Required for MVP | "Nice to have" |
| Blocks primary goal | Enhancement |
| User said "must" or "need" | User said "maybe" or "eventually" |

### Assumption vs Open Question

| Assumption (Document) | Open Question (Must resolve) |
|-----------------------|------------------------------|
| Reasonable default we're choosing | Ambiguity that blocks spec completion |
| "We assume email invites acceptable" | "Does invitee need full account?" |
| Decision we're making to move forward | Decision we cannot make without user |
| Goes in section 7 | Goes in section 8 (must resolve before finalizing) |

## Output Template

```markdown
# Feature: [Short Name]

## 1. Problem / Why Now
- [Who is affected]
- [Current pain or workaround]
- [Why this needs solving now: risk, cost, blocked work]

## 2. Goal (End State)
After this feature exists:
- [What becomes possible]
- [What pain stops]
- [What unblocks]

This is intended outcome, not UI or implementation.

## 3. Actors
Roles or systems that participate. One line each.

- [Actor Name]: [who they are / what authority or role]
- [System/Service Name]: [what it provides]

Be specific ("Project Owner"), not generic ("user").

## 4. Functional Requirements
Mandatory capabilities this feature must support.

Format: "<Actor> can <action> on <thing> under <condition>."

- Describe behavior, not UI or API
- If access control matters, include both allowed and forbidden as separate requirements
- Number as R1, R2, R3...

Example:
- R1. The Project Owner can invite a collaborator to a specific project.
- R2. A non-owner cannot invite collaborators.

## 5. Constraints & Rules
Absolute limits this feature cannot violate.

Include: security/privacy, access control, data exposure, performance requirements, forbidden behaviors.

If none stated, write: "None stated."

## 6. Evidence of Success
Observable signals in production that goal was achieved.

Must be measurable or checkable. No vague "users satisfied."

Examples:
- "Owners stop sharing passwords to grant access"
- "Support tickets about X decline after launch"
- "We can answer 'who changed this?' for every edit"

## 7. Assumptions / Tradeoffs
Assumptions we're making to keep scope small.
Tradeoffs we're accepting for now.

These are documented compromises, not promises.

## 8. Open Questions (Blocking)
Questions that MUST be answered before implementation can start.

If none remain, write: "None."

## 9. Out of Scope / Future Ideas
Related ideas explicitly NOT part of this feature.

Anything here is deferred to future work.
```

## Field Specifications

### Problem / Why Now
- **Format**: 3 bullets covering who, what pain, why now
- **Length**: 1-3 sentences per bullet
- **Content**: Concrete pain points, not "would be nice"
- **Example**: "ESL learners jump between tools for pronunciation, slowing gains" not "Users want better UX"

### Goal
- **Format**: 3-5 bullets, each starts "After this feature exists:"
- **Content**: Observable outcomes, not implementation
- **Avoid**: "Build a form to...", "Create an API that..."
- **Example**: "Learners can X" not "We implement Y"

### Actors
- **Format**: Role name: description (one line)
- **Content**: Specific roles with clear authority boundaries
- **Avoid**: Generic "user", "admin" without context
- **Max**: 5-7 actors (if more, scope may be too large)

### Functional Requirements
- **Format**: R1, R2, R3... numbered list
- **Template**: "<Actor> can <action> <object> <condition>"
- **Access control**: Write both positive and negative ("can" and "cannot")
- **Avoid**: UI descriptions, implementation details, "nice to have"

### Constraints
- **Format**: Absolute statements ("must", "cannot", "only")
- **Content**: Security, legal, performance floors, forbidden actions
- **Avoid**: "Should" or "ideally" (those are preferences, not constraints)

### Evidence of Success
- **Format**: Observable/measurable signals
- **Content**: User behavior changes, metric changes, auditability
- **Avoid**: "Users happier", "Better experience" (not measurable)
- **Max**: 3-5 clear signals

### Assumptions/Tradeoffs
- **Format**: "We assume X" or "We accept Y"
- **Content**: Decisions we're making to limit scope
- **Purpose**: Explicit documentation of choices made

### Open Questions
- **Content**: Only blocking questions that prevent spec completion
- **Resolution**: Must resolve all before finalizing spec
- **If none**: Write "None."

## Self-Validation Checklist

Before finalizing spec:

### Clarity
- [ ] Problem clearly states who, what pain, why now
- [ ] Goal states outcomes, not implementation
- [ ] Each actor has clear role and authority boundaries
- [ ] All functional requirements follow template format

### Completeness
- [ ] All mandatory capabilities listed in section 4
- [ ] Access control requirements include both allowed and forbidden
- [ ] All absolute limits documented in section 5
- [ ] Evidence is observable/measurable

### Consistency
- [ ] No contradictions between requirements
- [ ] Constraints don't conflict with requirements
- [ ] Actors mentioned in requirements are defined in section 3

### Scope Discipline
- [ ] "Nice to have" items moved to section 9
- [ ] No UI or API details in requirements
- [ ] No implementation decisions in constraints
- [ ] Assumptions explicitly documented (no silent guesses)

### Resolution
- [ ] All blocking questions in section 8 resolved (or section says "None")
- [ ] No vague statements like "users happier" in evidence
- [ ] No "should" or "ideally" in constraints (only "must" and "cannot")

## Examples

### GOOD: Clear Problem Statement
```markdown
## 1. Problem / Why Now
- ESL learners lack a single surface combining phoneme identity, production coaching, and spelling bridges, forcing them to jump between tools without building muscle memory.
- Current flows scatter audio, articulation, and spelling information, slowing pronunciation gains.
- Roadmapped features (dictionary, quizzes) have no authoritative detail view to link to, delaying downstream work.
```

### BAD: Vague Problem Statement
```markdown
## 1. Problem / Why Now
- Users want better phoneme information.
- The current UI is not optimal.
- We need to improve the learning experience.
```
**Problems**: No specific pain, no actors, no urgency, no concrete impact.

### GOOD: Observable Evidence
```markdown
## 6. Evidence of Success
- Learners stop requesting ad-hoc guidance for "how to make this sound."
- Dictionary lookups can link to component without supplementary explanations.
- Analytics show learners trigger both playback speeds plus one example word per visit.
- Support tickets about spelling patterns decline after adoption.
```

### BAD: Vague Evidence
```markdown
## 6. Evidence of Success
- Users are happier with pronunciation features.
- The app feels more polished.
- Learners improve their skills.
```
**Problems**: Not measurable, not observable, no specific metrics.

### GOOD: Functional Requirements
```markdown
## 4. Functional Requirements
- R1. The ESL Learner can view identity snapshot (symbol, category, description) when component loads.
- R2. The ESL Learner can play primary studio-quality recording with visible playback state.
- R3. The ESL Learner can trigger fixed-speed slow playback with same accessibility cues.
- R4. The component hides entire section when required content is missing (no placeholder states).
```

### BAD: Functional Requirements
```markdown
## 4. Functional Requirements
- R1. Build a nice UI for phoneme details.
- R2. Use React components with TypeScript.
- R3. Make it responsive and accessible.
- R4. Add audio player with good UX.
```
**Problems**: Implementation details, no actors, no clear capabilities, vague.

### GOOD: Constraints
```markdown
## 5. Constraints & Rules
- Audio controls limited to studio-quality recordings supplied in metadata.
- Static visuals must include captions for screen-reader support.
- Tone must remain instructional and calm; jargon defined inline.
- UI patterns must enforce progressive disclosure to prevent cognitive overload.
- Component must stay host-agnostic; no assumptions about surrounding navigation.
```

### BAD: Constraints
```markdown
## 5. Constraints & Rules
- Should have good audio quality.
- Ideally accessible.
- Try to keep things simple.
- Would be nice if it works everywhere.
```
**Problems**: "Should", "ideally", "try" are not constraints—they're preferences.

## Guardrails

- **No implementation details**: Specs describe what, not how (no UI designs, API endpoints, database schemas)
- **No silent assumptions**: Document all assumptions in section 7
- **Resolve all blocking questions**: Section 8 must be "None" before finalizing
- **Observable evidence only**: Section 6 must have measurable signals
- **Absolute constraints only**: Section 5 uses "must" and "cannot", never "should" or "ideally"
- **Mandatory requirements only**: Section 4 is must-have only, "nice to have" goes to section 9
- **Specific actors**: No generic "user" without context—define actual roles

## Anti-Patterns

### Mixing Levels
**Problem**: Putting implementation in requirements, preferences in constraints
**Example**: "R1. Use React hooks to manage form state"
**Fix**: "R1. The Owner can update profile information with inline validation"

### Vague Actors
**Problem**: Generic "user" without role definition
**Example**: "User can edit projects"
**Fix**: "Project Owner can edit their own projects" + "Invited Collaborator with edit permission can edit assigned projects"

### Missing Negatives
**Problem**: Only stating what's allowed, not what's forbidden
**Example**: "Owner can invite collaborators"
**Fix**: Add "Non-owner cannot invite collaborators" as separate requirement

### Unmeasurable Evidence
**Problem**: Subjective or vague success signals
**Example**: "Users are more satisfied"
**Fix**: "Support tickets decline by X%" or "Feature usage increases"

### Preferences as Constraints
**Problem**: Using "should" or "ideally" in constraints section
**Example**: "Response time should be fast"
**Fix**: "Response must complete within 200ms" or move to assumptions if not absolute

## Iteration Guidance

Specs evolve through conversation. Common patterns:

**When user says "and also"**: Ask if it's same feature or separate. If separate, list all features and ask which to define first.

**When you see conflict**: Point it out immediately. "You said X, but also Y. These conflict. Which should we keep?"

**When scope grows**: Flag it. "That sounds like a separate feature. Should we add it to section 9 (future) or define it as a separate spec?"

**When requirement is vague**: Ask clarifying question. "You said 'users can share.' Do you mean: share view access, share edit access, share publicly, share with specific people?"

**When evidence is unmeasurable**: Push for observable metric. "Instead of 'users happier,' what would we observe? Fewer support tickets? Higher retention? Specific user behavior?"

**When assumption isn't explicit**: Call it out. "I'm assuming X. Is that correct? I'll document it in section 7."

## Version History

Track significant changes if spec evolves:

```markdown
## Version History

**v1.1** (2025-01-27): Added R12 for source word highlighting based on dictionary integration requirements. Updated Evidence section to include dictionary link success metrics.

**v1.0** (2025-01-15): Initial spec
```

## Output

After completing spec, provide:
1. **Spec document** (complete markdown)
2. **Summary**: One paragraph covering problem, goal, key requirements
3. **Next steps**: "Ready for UI planning" or "Blocking questions remain: ..."
