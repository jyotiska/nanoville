# Paper summaries and development reference

Prepared 13 October 2026 from the three PDFs in this project's `papers` directory.

## How to use this document

This document is a detailed, source-grounded reference for developing language-model simulations of people and communities. It covers the papers' research questions, architectures, prompting procedures, software interfaces, parameters, evaluation protocols, statistical analyses, findings, failure cases, appendices, and development implications.

**Evidence labels:**

- **Reported:** a method, number, observation, or proposal stated in the supplied paper.
- **Interpretation:** an assessment of what the reported evidence supports or fails to support.
- **Development recommendation:** a proposed implementation or test derived from the papers; it was not necessarily implemented or evaluated by their authors.
- **Unspecified / inconsistent:** information that the supplied paper does not resolve. Do not turn such a gap into a silently assumed replication parameter.

Page references mean **physical PDF page numbers**, beginning with the first page of each supplied file. This matters particularly for the 1,000-person paper: its supplementary material starts at PDF page 13, with a separate internal page count. PDF page 65 is supplementary Table 8, not an additional main-text page.

The summaries paraphrase the research. Appendix D preserves extracted numerical tables from the supplied 1,000-person manuscript so that item-level and subgroup-level results are not reduced to headline averages. These transcriptions preserve source anomalies; the original PDF remains authoritative for visual column alignment and exact wording. No undocumented parameter, missing participant datum, or missing implementation detail is invented. The full bibliographies and acknowledgments remain in the PDFs; this document summarizes the research context rather than reproducing every reference entry.

**Coverage verification:** the document includes all 25 GA appendix interview probes; all 177 rows in the G1000 construct-level GSS result table; all 111 printed interview-protocol rows (109 question rows plus opening/closing); and complete extracted supplementary numerical Tables 1–6 and 8. Source-page references, local source links, table inclusion, and Markdown contents anchors were checked. Published experiments were documented, not rerun. Exact reproduction still requires resolving the explicit gaps in §7 and obtaining the referenced assessment instruments/code where the PDFs do not supply them.

## Contents

1. [Source register and relationship between the papers](#1-source-register-and-relationship-between-the-papers)
2. [Generative Agents / Smallville](#2-generative-agents--smallville)
3. [Social Simulacra / SimReddit](#3-social-simulacra--simreddit)
4. [Generative Agent Simulations of 1,000 People](#4-generative-agent-simulations-of-1000-people)
5. [Cross-paper comparison](#5-cross-paper-comparison)
6. [Development specification and proposed validation](#6-development-specification-and-proposed-validation)
7. [Reporting inconsistencies and replication gaps](#7-reporting-inconsistencies-and-replication-gaps)
8. [Source coverage map](#8-source-coverage-map)
9. [Appendix A: Smallville interview test inventory](#appendix-a-smallville-interview-test-inventory)
10. [Appendix B: Parameter and result register](#appendix-b-parameter-and-result-register)
11. [Appendix C: Real-person interview protocol inventory](#appendix-c-real-person-interview-protocol-inventory)
12. [Appendix D: Complete supplementary numerical table transcriptions](#appendix-d-complete-supplementary-numerical-table-transcriptions)

## 1. Source register and relationship between the papers

### 1.1 Sources

| ID | Title and authors | Supplied source | Identity / scope |
|---|---|---|---|
| GA | **Generative Agents: Interactive Simulacra of Human Behavior** — Joon Sung Park, Joseph C. O'Brien, Carrie J. Cai, Meredith Ringel Morris, Percy Liang, Michael S. Bernstein | [2304.03442v2.pdf](/Users/jyotiska/Documents/nanoville/papers/2304.03442v2.pdf) | arXiv v2 dated 6 August 2023; UIST 2023; DOI `10.1145/3586183.3606763`; 22 PDF pages |
| SS | **Social Simulacra: Creating Populated Prototypes for Social Computing Systems** — Joon Sung Park, Lindsay Popowski, Carrie J. Cai, Meredith Ringel Morris, Percy Liang, Michael S. Bernstein | [3526113.3545616.pdf](/Users/jyotiska/Documents/nanoville/papers/3526113.3545616.pdf) | UIST 2022; DOI `10.1145/3526113.3545616`; 18 PDF pages |
| G1000 | **Generative Agent Simulations of 1,000 People** — Joon Sung Park, Carolyn Q. Zou, Aaron Shaw, Benjamin Mako Hill, Carrie Cai, Meredith Ringel Morris, Robb Willer, Percy Liang, Michael S. Bernstein | [Generative-Agent-Simulations-of-1000-People-archive.pdf](/Users/jyotiska/Documents/nanoville/papers/Generative-Agent-Simulations-of-1000-People-archive.pdf) | Supplied archival manuscript, 65 PDF pages, including extensive supplementary material. The title page has no explicit version/date, so this document does not assign it an unverified publication version. |

### 1.2 Three different targets

These papers share the use of language models to generate human-like behavior, but they answer different questions:

1. **SS: design exploration.** What plausible conversations might populate an online community, and can they help a designer revise goals, rules, or moderation strategies?
2. **GA: continuing fictional lives.** Can agents retain experiences, infer meaning, and plan activities so that their behavior is coherent over time and social coordination emerges?
3. **G1000: individual predictive fidelity.** Can an agent grounded in a real person's interview predict that particular person's answers and decisions on selected assessments?

The progression is from populated conversation prototypes to agents with continuing histories, then to simulations anchored in actual individuals. It is not a monotonic proof that all forms of human behavior can be simulated reliably.

**Keep these distinctions throughout development:** plausible content, believable character behavior, exact answer prediction, population-level treatment effects, calibrated effect sizes, and realistic collective dynamics are different outcomes. Evidence for one does not establish the others.

## 2. Generative Agents / Smallville

**Primary source:** GA, sections 1–9 and appendices A–B; PDF pp. 1–18, 21–22.

### 2.1 Research problem and contribution

An LLM can generate a plausible action when given a character description and current situation. That alone does not maintain coherent behavior over a day or over accumulating experiences. A character might repeatedly eat lunch, forget an invitation, or react without considering its relationship to another person.

The paper proposes an architecture around an LLM that:

- maintains a comprehensive natural-language record of experiences;
- retrieves the subset needed for a current decision;
- derives higher-level reflections from observations and prior reflections;
- creates and updates plans over multiple time horizons;
- uses these representations for actions, reactions, and dialogue.

Its three contributions are the generative-agent concept, the supporting architecture, and controlled plus end-to-end evaluations, accompanied by interaction patterns and discussion of applications and risks.

**Research framing:** the paper builds on believable game characters, human–AI interaction, cognitive architectures, and prompting/retrieval work. Traditional finite-state machines and behavior trees require manually specified procedures. Reinforcement learning has excelled in games with clear objectives, while believable everyday behavior is broader than a readily specified reward. Cognitive architectures support memory and perception/action cycles but often depend on manually encoded procedural knowledge. The proposed architecture uses natural-language representations to make a broader range of behavior accessible to an LLM. Believability is an illusion of life or character coherence; the authors explicitly do not equate it with genuine human-like agency. [GA §1–2, PDF pp. 2–4]

### 2.2 Demonstration environment and agent initialization

**Smallville** is a manually authored, sprite-based town reminiscent of The Sims. It contains 25 distinct agents and places such as homes, a café, market/pharmacy, park, college, dormitory, bar, and supply store. Places contain subareas, and subareas contain usable objects.

Each resident begins with one authored paragraph containing identity, occupation, personality/context, and relationships. Semicolon-delimited clauses are split into separate initial memories. The initialization therefore includes social structure and individual intentions; the agents do not begin with no knowledge.

John Lin's example seeds a pharmacy shopkeeper, his wife Mei and son Eddy, his care for his family, his neighbor relationships, and his friendship and political discussions with coworker Tom. Subsequent experience changes the retrieved summary and behavior rather than requiring a new manually authored persona.

Primary living quarters include beds, desks, closets, shelves, bathrooms, and kitchens. World creation itself is outside the paper's main contribution and is not automatically generated. [GA §3.1–3.2, §5, PDF pp. 5–6, 12]

### 2.3 User interaction modes

Reported affordances include:

- **Observation:** overhead sprites display emoji summaries of current activities. A language-model call translates the activity description to emojis. Clicking a resident reveals the complete activity description.
- **Conversation:** users specify a perceived persona, such as a reporter, then converse with an agent in natural language.
- **Direct influence:** adopting a resident's “inner voice” makes a statement more likely to be treated as a directive. The example has John decide to run against Sam after receiving such an instruction.
- **Embodiment:** a user can control an existing resident or enter as an outside visitor. Other residents perceive, interact with, and remember this avatar.
- **Environmental intervention:** users rewrite an object's state, such as a stove becoming burning or a shower leaking. The resident perceives the change and responds in a later step.

The paper describes a natural-language influence mechanism, not a formally verified command-following guarantee. [GA §3.1.2–3.2, PDF p. 6]

### 2.4 Architecture: memory stream

The memory stream is a database of natural-language memory objects. The paper explicitly describes a textual description, creation timestamp, and most recent access timestamp. Observations record events directly perceived by the resident, including its own actions, other residents' actions, and object states.

Examples include setting out pastries, observing someone studying, discussing the Valentine's party, and noticing that a refrigerator is empty. Plans and reflections are also recorded in the same stream.

**Development interpretation:** a practical implementation additionally needs stable IDs, a memory type, an embedding or embedding reference, importance score, and evidence references for reflections. The paper describes evidence pointers for reflections and embeddings for retrieval, but does not prescribe a complete production database schema.

Memory is accumulated experience used in prompts; the paper does not train a separate model's weights for each resident. [GA §4–4.1, PDF pp. 8–9]

### 2.5 Retrieval: recency, importance, relevance

Retrieval takes a current situation or query and ranks records using three components.

**Recency**

- Based on time since the memory was last retrieved/accessed, not simply since its creation.
- Exponential decay measured in sandbox game hours.
- Reported decay factor: `0.995`.
- An implementation-equivalent description is `recency = 0.995 ^ elapsed_game_hours_since_last_access`.

**Importance**

- An LLM rates a memory's poignancy on a 1–10 scale when it is created.
- The scale contrasts ordinary routines with major events.
- Reported examples: room cleaning has score 2; asking a crush on a date has score 8.
- Importance concerns what matters to an agent, not an objective measure of truth.

**Relevance**

- Embed the memory description and the current query.
- Compute cosine similarity between their vectors.
- Relevant schoolwork should outrank breakfast when discussing a chemistry test.

**Combined score**

```text
Normalize recency, importance, and relevance to [0, 1] by min–max scaling.
score = α_recency × recency
      + α_importance × importance
      + α_relevance × relevance

Reported weights: α_recency = α_importance = α_relevance = 1.
```

Top-ranked memories that fit within the LLM context window are included in the prompt. There is no single fixed top-k count specified here. The paper does not identify an embedding model, explain a zero-range normalization case, or provide a fully specified token-budget allocator. Those are replication choices, not established constants.

**Motivation:** compressing the whole history into one generic summary loses the specific records needed for a contextual answer. Retrieval aims to maintain specificity without placing every observation in the prompt. [GA §4.1, PDF pp. 8–9]

### 2.6 Reflection: synthesis and evidence links

Raw observations alone may support shallow decisions. For example, selecting a person to spend time with based only on interaction frequency can overlook deeper shared interests.

Reported procedure:

1. Accumulate the importance scores of recently perceived events.
2. Trigger reflection when their sum exceeds `150`.
3. Supply the 100 most recent memory records to the LLM.
4. Ask for three salient high-level questions that can be answered from these experiences.
5. Use those questions as retrieval queries to gather relevant observations and previous reflections.
6. Ask the LLM for five higher-level insights supported by cited memory records.
7. Store each insight as a reflection with pointers to its supporting records.

Agents reflect roughly two or three times per game day in this implementation. That is an observed frequency resulting from the trigger, not a required schedule.

Reflections can use other reflections, creating a tree: observations form leaves and increasingly abstract interpretations form internal nodes. For Klaus, observations about sustained research support an inference about dedication to research; information about Maria can support an inference about shared interests.

**Interpretation:** preserving an evidence pointer makes an inference inspectable, but does not itself ensure the inference is valid. Recursive synthesis can carry forward incorrect or overly broad conclusions. [GA §4.2, PDF pp. 9–10]

### 2.7 Planning and reactions

A plan contains a location, start time, and duration. Plans are saved in memory and can be retrieved alongside observations and reflections.

**Hierarchy:**

1. Use a summary of identity/goals/recent experience and the previous day to draft a day in approximately five to eight broad chunks.
2. Decompose relevant chunks into roughly hour-long activities.
3. Decompose again into actions lasting about 5–15 minutes.
4. Refine the near future just in time because later plans are likely to change.

A four-hour composition session can therefore include brainstorming, writing, breaks, and cleanup rather than one unchanging action. The hierarchy prevents moment-by-moment plausibility from producing repetition or conflicting schedules.

**Reaction loop:** at each time step, perceive nearby agents and objects, record observations, and ask whether to continue the existing plan or react. An idle easel may require no reaction; encountering a family member can motivate conversation.

For relationship-aware reactions, the system retrieves context through queries about the observer's relationship to the observed entity and the entity's current action. It summarizes the answers and combines them with time, agent summary, and observation. If a reaction is chosen, the plan is regenerated from that point. [GA §4.3, PDF pp. 10–11]

### 2.8 Dialogue generation

Dialogue is generated as an interaction between agents rather than one universal narrator:

1. An initiating agent retrieves context about the other person and produces an utterance consistent with its intended reaction.
2. The recipient perceives the initiation as an event.
3. The recipient retrieves relationship context and records relevant to the latest utterance.
4. The recipient's response is conditioned on its summary, current situation, retrieved context, and dialogue history.
5. Continue until one agent decides to end the conversation.

The John/Eddy example uses remembered information about Eddy's music-composition project and their parent/child relationship. The main text does not specify a universal conversation turn cap or a formal termination schema. [GA §4.3.2, PDF pp. 11–12]

### 2.9 Grounding language in a structured world

**Reported software:** Phaser renders the web game; a supplementary server exposes world state to the agents. Authored sprites, world map, and collision map are imported into Phaser.

The server maintains JSON describing each resident's location, activity, and interacting object. At each step it receives changes, moves residents, updates object state, and sends agents/objects within a preset visual range to the corresponding resident's memory/perception pipeline. The visual-range value is not specified.

**Containment tree:** the world is represented as a tree of places, subareas, and objects. The relation “stove is a child of kitchen” becomes a natural-language description. Each resident maintains its own known subgraph, initially including its living quarters, workplace, and familiar destinations. Perception adds new areas. A resident's remembered tree may be stale while away and is refreshed when returning.

**Destination selection:** recursively prompt the model to choose an area, then a subarea, then an object/leaf. The prompt prefers the current area when the activity can be performed there. Traditional pathfinding animates movement to the selected location; the LLM does not directly compute a walking trajectory.

**Object effects:** another model query infers how an action changes the object, such as espresso-making changing a coffee machine to a brewing state. The paper does not describe a complete deterministic precondition/effect engine. [GA §5–5.1, PDF pp. 12–13]

### 2.10 Agent-summary caching and runtime optimizations

Appendix A describes a cached summary built from identity and three retrieved/summarized topics:

- core characteristics;
- current daily occupation;
- feelings about recent progress in life.

Name, age, and traits are concatenated with the three summaries. These are synthesized at regular intervals and reused. The exact cache invalidation interval is not specified.

**Implemented:** high-level advance planning with just-in-time refinement of the near future; cached summaries.

**Suggested, not demonstrated optimizations:** joint dialogue generation rather than alternate calls, partial replanning that invalidates only affected plan segments, and parallel agents. The architecture is described as sequential with approximately one real second per simulated minute; the reported entire two-day run nevertheless took multiple real days. Do not infer a guaranteed wall-clock simulation speed or deployment throughput from the nominal time mapping. [GA Appendix A, PDF p. 21; §8.2, PDF p. 17]

### 2.11 Controlled evaluation: procedure and conditions

**Target:** believability of individual responses given the character's accumulated history.

**Inputs and questions:** after two simulated days under the full architecture, agents receive 25 interview questions: five each for self-knowledge, memory, plans, reactions, and reflections. Appendix A of this summary inventories all questions from the paper's Appendix B.

**Design:** within-subjects. Each evaluator watches a replay of a randomly selected resident's life and can inspect its memory stream. For one randomly selected question from each of the five categories, the evaluator ranks responses from all five conditions from most to least believable.

| Condition | Available history at response time |
|---|---|
| Full architecture | Observations + plans + reflections |
| No reflections | Observations + plans |
| No reflections or planning | Observations only |
| No observations, reflection, or planning | No memory-stream history |
| Crowdworker baseline | A human writes a response after reviewing the resident's replay/history |

**Crucial control:** the ablations use the histories accumulated under the full architecture, with the corresponding memory types withheld when answering. The authors do not independently run the town under each ablated architecture. This avoids incomparable histories, but it tests response-time access to memory types rather than the full long-term consequences of removing each component.

**Human baseline:** a unique crowdworker is recruited for each of 25 agents. The first author checks answers to the broad weekday-schedule question for coherent sentences and the character's voice. Four sets of answers fail this check and are regenerated by other workers. The baseline establishes basic competency, not maximal expert-human performance. [GA §6.1–6.2, PDF pp. 13–14]

### 2.12 Controlled evaluation: sample, analyses, and results

**Evaluators:** 100 adults recruited through Prolific; U.S.-based, fluent in English, over 18; approximately 30 minutes; $15/hour; IRB-approved consent. Median age category 25–34. Gender: 25 female, 73 male, 2 nonbinary. Education: 42 bachelor's, 5 higher degree, 13 associate's, others high school/some high school. Race/ethnicity report: 73% Caucasian, 7% Hispanic, 6% Asian, 10% African American, 4% other. [GA §6.3, PDF p. 14]

**Statistics:**

- Convert rank outcomes to TrueSkill means and standard deviations for interpretable ranking.
- Kruskal–Wallis test on raw ranks.
- Dunn post-hoc comparisons with Holm–Bonferroni correction.
- First-author inductive qualitative analysis: sentence-level open coding, followed by synthesis into higher-level themes.

| Condition | TrueSkill mean μ | TrueSkill σ |
|---|---:|---:|
| Full architecture | 29.89 | 0.72 |
| No reflection | 26.88 | 0.69 |
| No reflection or planning | 25.64 | 0.68 |
| Crowdworker | 22.95 | 0.69 |
| No observation, reflection, or planning | 21.21 | 0.70 |

Omnibus result: `H(4) = 150.29`, `p < 0.001`. All pairwise differences are reported significant at `p < 0.001` except crowdworker versus the fully ablated baseline. The paper reports a standardized effect size `d = 8.16` using the TrueSkill-derived distributions for the full versus fully ablated condition.

**Interpretation:** that large standardized effect is a statistic constructed from the rating distributions, not a percentage of accurate predictions or a direct statement that the agents outperform human beings generally.

**Qualitative results:** memory improves identity and acquaintance recall; reflection helps infer interests and choose relevant gifts. Failures persist: missed election memories, partially retrieved party memories, invented details about an announcement, and confusing a resident called Adam Smith with the historical economist. [GA §6.4–6.5, PDF pp. 14–15]

### 2.13 End-to-end evaluation: measures and outcomes

25 residents interact continuously for two complete game days. The evaluated collective outcomes are information diffusion, relationship formation, and coordination.

**Information diffusion:** seed Sam's mayoral candidacy only in Sam's memory and Isabella's party intention only in Isabella's. At the end, interview every resident about both. Label knowledge yes/no, then verify claimed knowledge by locating a supporting conversation in memory.

**Relationship formation:** interview every agent about every other agent at the beginning and end. A graph edge exists when both agents know of one another. Validate affirmative claims against memory. Compute undirected graph density:

```text
η = 2 × |E| / (|V| × (|V| − 1)), with |V| = 25.
```

This measure is mutual recognition, not an independently assessed measure of trust, intimacy, or friendship quality.

**Coordination:** count invited agents who arrive at the party at the relevant place/time.

| Outcome | Reported result |
|---|---|
| Know Sam's candidacy | 1/25 → 8/25; 4% → 32% |
| Know Isabella's party | 1/25 → 13/25; 4% → 52% |
| Unsupported affirmative claims about the two seeded news items | None found in the checked responses |
| Mutual-recognition graph density | 0.167 → 0.74 |
| Hallucinated acquaintance answers | 6 of 453 responses; 1.3% |
| Party attendance | 5 of 12 invited agents |
| Invited nonattendees | 3 cited conflicting obligations; 4 expressed interest but had not planned to attend |

The party is scheduled for 5–7 p.m. on February 14; preparation occurs on February 13. Isabella invites guests, collects materials, and seeks help decorating. Maria's initially authored crush on Klaus also influences an invitation. Both that crush and the party intention are seeds; the downstream conversations and actions are generated.

The John/Mei/Eddy day illustrates information transfer: John hears about Eddy's project and subsequently tells Mei. Sam and Latoya's repeated encounters illustrate remembering a newly met person's project. These are explanatory examples, not additional controlled accuracy benchmarks. [GA §3.3–3.4, §7.1, PDF pp. 6–7, 15–16]

### 2.14 Failure modes, applications, and limitations

**Observed failures:**

- Fail to retrieve relevant records or retrieve only an incomplete fragment.
- Add unsupported specifics to a correct recollection.
- Import pretrained world knowledge into a fictional identity incorrectly.
- Choose atypical locations as the known-world tree grows.
- Misunderstand physical affordances: treat a one-person dorm bathroom as shared.
- Enter shops after their intended closing hour.
- Use overly formal dialogue.
- Become excessively cooperative and absorb others' interests, weakening persona consistency.
- Fail to turn an expressed intention into an actual scheduled action.

**Limitations / future work:** short observation horizon; nonexpert human baseline; substantial cost and latency; sensitivity to models and hyperparameters; retrieval tuning; untested robustness to prompt hacking, memory hacking, and hallucination. The authors report thousands of dollars in token credits and multiple real days to simulate the town; they do not report a reproducible cost per action. Underlying language-model bias and limited coverage of marginalized populations can propagate into agents.

**Applications proposed:** games, virtual worlds, role-play/rehearsal, social-system prototyping, modeling interaction with personal technology, and social robots with multimodal capabilities. These are proposed uses, not all validated deployments.

**Risks and author proposals:** disclose computational identity to address parasocial attachment; avoid contextually inappropriate interactions; assess consequences of model errors; retain audit logs for misuse involving misinformation/deepfakes/persuasion; complement human stakeholders rather than replace their participation. Logging is a detection/accountability measure, not a guarantee of prevention. [GA §7.2–8.3, PDF pp. 16–18]

## 3. Social Simulacra / SimReddit

**Primary source:** SS, sections 1–8; PDF pp. 1–16. References occupy the remainder.

### 3.1 Problem, conceptual contribution, and scope

Designers often test social platforms with small groups, but later communities exhibit dynamics absent from small, homogeneous pilots: trolling, disagreement, unexpected uses, and contested rules. Cold-start communities cannot readily attract the critical mass needed to observe these interactions. Testing unproven interventions on real communities can cause harm and erode trust.

Social simulacra convert a draft social-space design into plausible interactions that let designers question assumptions. The contribution is a general prototyping technique, prompt-chain implementation, and evaluations of realism and designer usefulness.

A prototype is meant to explore a design question, not perfectly reproduce reality. The paper explicitly seeks a range of possible futures rather than one point forecast.

**SimReddit** is the specific web tool used to demonstrate the technique. It prototypes subreddit-level decisions: community goals, rules, target members, and moderator interventions. It does not implement or evaluate all platform mechanisms, such as ranking algorithms or sharing behavior. [SS §1–3.1, PDF pp. 1–4]

### 3.2 Inputs and generated community

| Input | Representation | Intended influence |
|---|---|---|
| Community goal | Natural-language purpose / topic | Topics and tone across the space |
| Rules | Prescriptive or restrictive statements | Encourage/discourage behavior |
| Target population | Named personas with descriptive interests/traits | Individual topics, style, intentions |

A designer supplies ten seed personas by default. The model expands them to 1,000 thematically relevant personas by default. This reduces manual authoring while aiming for variety.

Personas are behavioral: a tennis enthusiast, an international-relations student, a troll, etc. The prompting model can accept race/gender information, but the interface deliberately does not support demographic personas, following concerns about stereotyping.

Rules are treated as nudges rather than strict guarantees. A hostile persona may become less overtly insulting under a kindness rule, but a rule's presence does not make all violations impossible. [SS §3.2, §4.2.1, PDF pp. 4–5, 9]

### 3.3 Three interaction features

**Generate** creates top-level posts and replies from goals, rules, and expanded personas. Designers change the inputs and regenerate to inspect the differences. The writing-support example illustrates revising a broad description, then adding rules about discouraging bragging or personal attacks.

**WhatIf** branches from a selected utterance, or a manually seeded conversation, by specifying a different responding persona or an intervention. For example, a designer injects a troll, then supplies a moderator's response to examine possible apology, escalation, or defiance. This is local conversation exploration, distinct from changing community-wide inputs.

**Multiverse** regenerates alternatives under the same design. At community level, sample other persona combinations and conversations and permit comparison of generated versions. At utterance level, regenerate possible continuations. It is a strategy used with Generate and WhatIf, rather than an independent behavioral architecture. Its purpose is to make uncertainty explicit and discourage treating a single favorable output as definitive.

The generated pages use a subreddit-style interface with community description, rules, and conversations. They do not demonstrate persistent autonomous residents with day-long plans or evolving personal memory streams. [SS §3.2–3.4, PDF pp. 4–8]

### 3.4 Modeling assumptions and model configuration

The approach assumes the generative model can produce the relevant content modality and encodes enough world/social knowledge for the design questions. Here the modality is English text.

**Reported model:** original GPT-3 `davinci` engine, initially released 11 June 2020. Later variants appeared during the study but were not substituted. No fine-tuning is reported; behavior is elicited with prompts.

Default temperature is reported as `0.7`; Multiverse raises it to `0.8`. Other API parameters are left at defaults; the paper does not pin every default for future reproduction.

The historical model has roughly an 8,000-character input limit in the implementation. The paper illustrates limited knowledge of post-training events, including COVID-19. Treat these as historical constraints of this evaluated model, not assertions about present-day models. [SS §4.1–4.3, §7.2.3, PDF pp. 8–10, 16]

### 3.5 Prompt chain: persona expansion

Use a few-shot list of designer-authored names and behavioral descriptions. Ask the model to add new members resembling the seeds in semantically meaningful ways. For an international-affairs community, seed diplomats, students, professors, travelers, and journalists yield more domain-related personas.

The paper states that generated personas are distinct/nonrepeating, but does not specify a complete deduplication procedure, semantic diversity metric, or sampling policy for every community-wide choice. Do not infer a verified demographic distribution from the generated names. [SS §4.2.1, PDF p. 9]

### 3.6 Prompt chain: top-level posts

The prompt contains:

1. the selected member's description;
2. rule-related behavioral statements;
3. an instruction grounding the post in the community's purpose;
4. an opening HTML `span` whose class identifies a headline-like post and whose title reinforces topic and restrictions.

The model generates the post and a closing `</span>`. The closing tag is the stopping delimiter. The rules appear both in the persona-related text and in the tag metadata, reinforcing behavior within the limited prompt budget.

This use of HTML is a prompting/termination technique, not proof that generated HTML is safe for direct rendering. [SS §4.2.2, PDF p. 9]

### 3.7 Prompt chain: replies and branching

For each top-level post:

- Sample a thread-specific continuation probability from a normal distribution with mean `0.65`; the formula leaves the standard deviation as `stdev`, without a numerical value.
- Flip a coin with that probability to decide whether to add another reply.
- Stop if conversation length exceeds eight replies. The wording leaves a possible boundary/off-by-one interpretation; it is not a precise “maximum exactly eight” specification.
- For the next responder, choose a new persona with probability 50%; otherwise use one already in the thread, excluding the most recent speaker.
- Supply the thread so far, new responder description, community constraints, and an opening comment tag.
- Tags include a `max_200_words` class as a length cue; no independent enforced word-count validation is described.
- When the prompt exceeds the context limit, truncate from the beginning/first post.

For **WhatIf**, replace the current responder's persona or append the designer's intervention and generate onward. For **Multiverse**, reuse the prompt structure with increased randomness.

Unspecified choices include the normal distribution's numerical deviation, clipping/resampling of probabilities outside [0,1], random seed, exact persona selection distribution, and universal content-validity checks. These are important reproduction gaps. [SS §4.2.3–4.2.5, PDF pp. 9–10]

### 3.8 Technical evaluation: sampling and comparison task

**Questions:** Are generated interactions relevant and plausible in previously unseen communities? Does conditioning on community descriptions and personas matter?

**Community sample:** 50 English-language subreddits created on/after GPT-3's release date. The authors inspect the five largest communities created on successive dates starting 11 June 2020 using frontpagemetrics.com. Manual categorization indicates coverage of all ten top-level categories listed in r/ListOfSubreddits. The sampling aims to avoid direct reproduction of communities already in training.

**Task:** participants see one real and one synthetic conversation for a subreddit and identify the real one. They receive the community name/goal and a link, and first browse up to its initial two pages, about 20 posts. There are two comparisons per subreddit, 100 comparisons per participant.

**Real conversations:** select threads at least 200 posts behind the newest and absent from the top feed, so browsing will not reveal the answer. Use text-only conversations with at least three replies. If there are more than five replies, use the first five chronological replies along one thread.

**Design:** between-subjects, four conditions, distinguished by how synthetic conversations are produced:

1. Crowdworker-written content.
2. SimReddit without community goal/rules.
3. SimReddit without personas; use numbered participants instead.
4. Full SimReddit.

For full SimReddit, copy goal/rules from the subreddit. Crowdworkers receive the same descriptions/rules in Google Docs and write a post if no post exists or the current one has at least five comments; otherwise add a reply. Ten unique workers are assigned to each document across the 50 recruited workers. [SS §5.1–5.2, PDF pp. 10–11]

### 3.9 Technical evaluation: participants and statistical methods

**Recruitment:** Prolific; U.S., fluent English, over 18; $15/hour; IRB-approved consent.

**Crowdworker authors:** reported N=50, about 10 minutes. Reported mean age category 4.38 (SD 1.28), where category 4 is 25–34. Education counts: 9 bachelor's, 3 higher degree, 13 associate's, remaining high school/some high school. Race/ethnicity is multiple selection: 88% Caucasian, 6% Hispanic, 4% Asian, 6% African American, 4% other. Reported gender counts are inconsistent with N; see §7.

**Evaluators:** N=200, 50 per condition, about 60 minutes. Sample size from pilot-based power analysis: alpha 0.05, power 80%. Mean age category 4.22 (SD 1.03). Gender report: 118 female, 74 male, 4 nonbinary, 1 agender, 1 undisclosed (these do not account for all 200). Education: 55 bachelor's, 25 higher degree, 23 associate's, remaining high school/some high school. Race/ethnicity: 69.5% Caucasian, 10.5% Hispanic, 2.5% Asian, 16.5% African American, 4.5% other.

**Analysis:** one-way ANOVA on error rates, followed by Tukey HSD. The first author also uses qualitative sentence-level open coding and synthesis into themes. No multi-coder reliability statistic is described in this procedure. [SS §5.3–5.4, PDF p. 11]

### 3.10 Technical evaluation: numerical and qualitative results

The outcome is **misidentification error**: 0% means perfect differentiation of real and synthetic; random guessing corresponds to 50%. More error therefore means harder-to-distinguish generated content in this task.

| Synthetic-content condition | Mean error | SD |
|---|---:|---:|
| Crowdworker | 32% | 13% |
| No community description | 21% | 15% |
| No personas | 34% in Table 1; 33% in nearby prose | 10% |
| Full SimReddit | 41% | 10% |

Omnibus: `F(3,196) = 22.49`, `p < 0.001`.

Table 1 pairwise significance:

| Pair | Reported significance |
|---|---|
| Crowdworker vs no description | p < 0.001 |
| Crowdworker vs no personas | No significance marker |
| Crowdworker vs full | p < 0.01 |
| No description vs no personas | p < 0.001 |
| No description vs full | p < 0.001 |
| No personas vs full | p < 0.05 in Table 1; nearby prose says p < 0.01 |

The full system produces the most plausible synthetic conversations among these conditions. Community constraints and persona conditioning contribute to the result. Evaluators still perform better than random guessing; the paper does not establish universal indistinguishability.

**Qualitative examples:** context-rich domain knowledge can appear in plausible conversations; community descriptions can support reasonable inference about unfamiliar topics. Errors include unexpected opening claims, missing domain knowledge, and generic/off-topic output without conditioning. [SS §5.5, Table 1, PDF pp. 11–12]

### 3.11 Designer evaluation: procedure

**Participants:** 16 people with prior online community design/moderation experience, recruited via social media and mailing lists. Approximately 90–120 minutes spread over several days; $50 compensation; IRB-approved consent. Mean age category 3.5 (SD 0.71); 7 female, 9 male; 5 bachelor's and 5 higher-degree holders. Race/ethnicity report: 25% Caucasian, 6.25% Hispanic, 68.75% Asian.

**Sequence:**

1. Five-minute screener records experience and a community the participant wishes existed.
2. A pre-interview task asks for a new subreddit design: goal, rules, personas, and one hypothetical post.
3. Interview discusses prior design/moderation challenges and intended behaviors.
4. Show a SimReddit generation based on the draft.
5. Participant spends 5–10 minutes reviewing it using think-aloud.
6. Participant revises the design; generate another version.
7. While waiting, show three troll responses to the participant's drafted post using WhatIf/Multiverse.
8. Participant writes a moderator intervention.
9. Show three possible troll responses to that intervention and discuss further moderation.
10. Review revised-community generation for another 5–10 minutes.
11. Discuss the tool's possible role in the participant's design process.

Qualitative analysis again uses initial codes then higher-level themes. This is a design-process evaluation, not a longitudinal trial of actual launched communities. [SS §6.1–6.3, PDF pp. 12–13]

### 3.12 Designer evaluation: findings and concrete examples

Reported experience categories overlap: subreddit 5, Discord 2, Slack 4, mailing lists 4, other 7.

- Most participants (13) find cold-start design daunting.
- Nine describe ethical concerns about testing unproven designs on real users.
- Three recall reactive rules added only after harmful incidents.
- All 16 report unexpected, interesting insights from generated content.
- Ten are described as pleased with how revised inputs change the new generation.
- Fifteen are not surprised by the existence of trolls, but examples make relevant forms of trolling concrete.
- Fourteen remark on overall realism; fifteen also notice some implausible details.
- All 16 describe added value for thinking about their designs.

**Positive use cases:** a Pittsburgh events community also enables finding companions for sightseeing, broadening the designer's understanding of its purpose.

**Negative cases:** international-affairs discussion surfaces inflammatory or potentially manipulative content; a gaming community surfaces abusive vocabulary; a learning community reveals gatekeeping directed at beginners.

**Moderation rehearsals:** generated apology, dismissiveness, or continued defiance lead a moderator to distinguish continued participation, temporary suspension, and permanent banning.

**Marginalized groups:** participants include women of color (5) and religious/ethnic minorities (3), potentially overlapping. Designers identify harassment patterns such as white-supremacist framing or misogynistic taunting and revise protective rules. The model's ability to reproduce harmful behavior is useful for anticipating it, while also exposing the reviewer to that content.

**Reported role:** concrete examples cue recollection, support discussions among moderators, illustrate rule violations, and move some design work before deployment. They do not establish that the revised rules actually improve real-world outcomes. [SS §6.4–7.1, PDF pp. 13–15]

### 3.13 Limitations, false confidence, and author-proposed safeguards

- A generated multiverse is not an exhaustive inventory of possible community outcomes.
- Missing a failure scenario can falsely reassure a designer; the authors relate this to an implied-truth effect.
- Plausibility does not establish probabilities, causal effects of rules, or future trajectories.
- Context limits can remove early conversation history and broader community norms.
- SimReddit is English-text-only; cultural generalization is limited.
- Ranking, likes, upvotes, retweets, and shares are not implemented in the evaluated system.
- New modalities and engagement mechanisms are future directions, not evaluated capabilities.
- Model bias can reproduce underrepresentation/silencing and steer designers away from overlooked needs.
- The tool must supplement actual participatory engagement.

The authors propose vetted designer access, central hosting and logging, auditing output, and checking for bulk export into public spaces to reduce misuse for astroturfing, harassment, or propaganda. These are release recommendations described in the paper, not actions required by this summary or proof that misuse is prevented. [SS §7–8, PDF pp. 15–16]

## 4. Generative Agent Simulations of 1,000 People

**Primary source:** G1000, main text PDF pp. 1–9; supplementary methods/results PDF pp. 14–40; Tables 1–8 PDF pp. 41–65.

### 4.1 Research objective and contribution

The aim is general-purpose agents grounded in particular real individuals, evaluated by comparison with those individuals. Detailed qualitative interviews are intended to capture personal history and idiosyncratic attitudes beyond demographic stereotypes or brief personas.

The contributions are an interview-grounded agent architecture, a bank of 1,052 agents, individual-level and experimental benchmarks, tests of information-source alternatives, demographic performance analyses, and a proposed research-access framework.

The study builds on agent-based social simulation, survey/persona prompting, qualitative interviewing, and prior generative agents. It advances the evaluation target from seeming believable to matching real participants on selected tasks. It does not demonstrate that every proposed policy, social interaction, or life outcome can be predicted. [G1000 main text, PDF pp. 1–4]

### 4.2 Recruitment, sample, compensation, and consent

**Recruitment firm:** Bovitz. Aim: 1,000 participants completing both waves, with demographic stratification. Recruit 1,300 initially anticipating approximately 20% attrition. Higher-than-expected follow-up participation yields a final retained pool of **1,052** while aiming to preserve representativeness.

**Eligibility:** age at least 18, currently living in the U.S. Stratification descriptions cover age, census division/region, education, ethnicity/race, gender, income, neighborhood, political ideology, and sexual identity. Do not equate the stratification claim with a probability sample or assume identical coverage of every population.

**Compensation:** $60 for the initial phase; $30 for follow-up; possible $0–$10 economic-game bonus in each phase.

**Reported sample:** mean age 47.55 (SD 15.93), range 18–84; 593 female, 459 male. Education counts: 283 bachelor's, 151 higher degree, 185 associate's; remaining high school or some high school. Ethnicity counts include 833 white/Caucasian, 154 Black/African American, 53 Asian, 95 other. Ethnicity allows multiple selections. Table 1 distinguishes race from ethnicity; they should not be merged.

**Consent and privacy:** names replaced with pseudonyms, but rich qualitative histories remain difficult to anonymize. The authors work with their IRB for over six months. Participants are told agents will simulate their responses, research use can expose information, and future model capability may increase inferential privacy risks. Withdrawal/removal requests are honored to the best of the researchers' ability for the first 25 years after study completion. Participants are informed of significant changes affecting privacy. [G1000 SM1, PDF pp. 14–16; Table 1, PDF p. 41]

### 4.3 Data collection and task ordering

The custom platform includes account creation, consent, a 2D sprite avatar, interview, surveys/experiments, and follow-up. Modules unlock sequentially.

**Wave 1:** consent → avatar creation → approximately two-hour voice interview → GSS → BFI-44 → economic games → five replication experiments.

**Randomization:** economic-game and replication-study order is randomized; BFI item order is randomized. GSS follows its documented sequence. Participants are randomly assigned to a condition for each replication study.

**Wave 2:** two weeks later, repeat the surveys and experiments but not the interview. This supplies a test–retest consistency baseline. Follow-up only becomes available after the two-week delay.

Interviews yield on average 6,491.19 participant words (SD 2,540.56). The study's main metrics and core analyses are preregistered. The main text supplies an OSF preregistration link; it is recorded in §4.17 as a source-provided resource, not independently inspected here. [G1000 PDF pp. 3–4, 14–15, 21]

### 4.4 AI interviewer: control and adaptation

The interviewer uses an ordered, semi-structured script adapted from the American Voices Project. Each scripted question has a time budget. The interviewer begins a block with its scripted question, then chooses whether to ask a tailored follow-up or move on.

**Goal:** preserve broad coverage and researcher control while allowing respondents to surface what matters to them. The main study uses an externally developed protocol to reduce intentional tailoring to the assessment battery. That does not mean the interview and assessments have no thematic overlap.

**Context management:** a reflection module summarizes facts/inferences from the ongoing conversation. When generating the next move, include these notes plus the most recent **5,000 characters** rather than the entire accumulating transcript.

**Prompt behavior:** assess progress against the current question's learning objective, reason about useful follow-ups, then author the next utterance. The prompt explicitly permits pivoting if a participant refuses to answer for privacy reasons.

**Voice interface:** text-to-speech uses an OpenAI audio model; speech-to-text uses Whisper; GPT-4o generates follow-ups/reflections. The precise text-to-speech model version is not pinned. Audio is calibrated before the interview. A sprite/pulsing indicator distinguishes interviewer speech and participant microphone activity; subtitles and pausing/checkpoint recovery are supported. More than four seconds of silence triggers stopping/processing the participant turn; interviewer responses are generally within four seconds.

Average interviewer output: 5,372.59 words (SD 2,406.12), with 81.71 generated follow-up questions (SD 54.39) in addition to a protocol described as having 99 scripted questions. Appendix C records the supplied script's topics and time budgets.

**Pilot development:** August–November 2023; 10 human and 25 AI interviews reported. Social-science-trained researchers compare transcript quality, and the authors report similar GSS prediction performance for AI- and human-interview-grounded agents. The phrase describing “3 waves of 3” does not reconcile clearly with the reported 35 interviews; see §7. No complete pilot effect-size table is supplied. [G1000 SM2, PDF pp. 16–23]

### 4.5 Real-person agent: memory and expert reflection

Unlike Smallville's many-record retrieval problem, each agent's primary knowledge source here is the **entire interview transcript**, injected into the prediction prompt.

An expert-reflection module generates four sets of interpretations, adopting the perspectives of:

- psychologist;
- behavioral economist;
- political scientist;
- demographer.

The descriptive text says up to 20 observations/reflections per expert; its example prompt asks for more than five and fewer than twenty, a boundary discrepancy. Reflections are generated once and saved.

For a new question:

1. Use a language-model prompt to classify which expert domain is most appropriate.
2. Retrieve all saved reflections from that expert.
3. Append them to the complete interview transcript.
4. Generate the predicted response.
5. If the task is sequential, append prior task stimuli and the agent's preceding responses in natural language.

These “expert” perspectives are LLM-generated, not annotations from four actual expert reviewers. The supplemental architecture makes reflection explicit, but does not separately establish its causal contribution through a reflection-only ablation. [G1000 SM3, PDF pp. 23–26]

### 4.6 Prediction prompting

**Categorical response procedure:** interpret each available response option, assess why the represented participant might choose it, compare options, and output a predicted choice.

**Numerical response procedure:** describe people who would choose each end of the range, reason about the participant's likely position, and predict a value.

Reported model: GPT-4o. The supplied manuscript does not identify a dated model snapshot, full generation parameter set, output parsing implementation, or repetition/seed strategy. Model-generated reasoning is part of the described prompting procedure; it is not a validated psychological explanation of the real participant's decision.

The per-person representation is supplied context plus saved inferences and task memory, not separately trained personal model weights. [G1000 SM3, PDF pp. 24–26]

### 4.7 Benchmark battery: General Social Survey

The GSS core covers demographics, behavior, public spending, race relations, religion, political attitudes, gender/family questions, and other topics.

The analytic selection excludes conditional questions, questions with more than 25 categories, and free-form responses. Supplementary methods identify **183 items: 177 categorical/ordinal and six numerical**. The main headline results concern the 177 categorical/ordinal questions, not all 183.

Average categorical response-option count: 3.70 (SD 2.22). The paper reports a random-choice benchmark of 27.03%. That corresponds to the reciprocal of the reported average number of choices; it should not be silently treated as a per-item or majority-class baseline.

Items are administered through custom Qualtrics forms. The full GSS wording/options are not reprinted in this PDF; Appendix D preserves the reported item identifiers and construct-level results, not an invented survey instrument. [G1000 PDF pp. 5–6; SM4–5, PDF pp. 26, 31–32]

### 4.8 Benchmark battery: personality

Use the complete **44-item Big Five Inventory (BFI-44)**, covering extraversion, agreeableness, conscientiousness, neuroticism, and openness.

Predict individual item answers, reverse-code specified items using the original instrument, and average relevant items into five dimension scores on the 1–5 scale. Each dimension contains eight to ten items. Compute MAE and correlation on the five dimension scores. Item order is randomized.

The supplied PDF refers to the original scoring instructions rather than reproducing all item wording and reverse-code keys. These must be obtained from the referenced instrument for an exact replication. [G1000 PDF pp. 4, 6; SM4–5, PDF pp. 27, 32]

### 4.9 Benchmark battery: five economic games

Humans make choices with real monetary incentives; agents predict those choices from textual task descriptions.

| Game | Mechanism and reported amounts | Target behavior |
|---|---|---|
| Dictator | Allocate an initial $5 between oneself and one other participant; recipient cannot change it | Altruism |
| Trust, first mover | Start with $3; choose amount to send to another participant; transfer is tripled | Trust |
| Trust, second mover | Choose how much of the tripled receipt to return | Reciprocity |
| Public goods | Groups of four; each starts with $4; contributions are doubled and evenly distributed among all four | Cooperation / free riding |
| Prisoner's dilemma | Both cooperate: $6 each; unilateral defection: defector $8, cooperator $2; both defect: $4 each | Cooperation versus self-interest |

Participants are told one game will be randomly chosen for bonuses, without knowing which. The researchers select the dictator game before data collection and randomly pair participants afterward for actual payout. The supplemental description also says games offer maxima of $8–$10 despite the dictator endowment of $5; keep the described payments and the inconsistency separate.

Outputs are normalized to [0,1] using each game's response range. Analyze MAE and correlation over the five game responses, with numerical and dichotomous choices combined. Do not interpret within-person correlation over five different games as accurately ranking people on each game. [G1000 SM4–5, PDF pp. 27–28, 32]

### 4.10 Benchmark battery: five experimental replications

The source pool is a 41-study replication effort curated by Camerer and colleagues. Inclusion criteria: deliverable as natural language, optionally images, and estimated effects observable with no more than 1,000 participants. This yields five experiments. Compare agents to new human replications in this study, not merely to the original papers.

| Experiment | Manipulation / task | Outcome and reported analysis |
|---|---|---|
| Ames & Fiske (2015) | Intentional versus unintentional medication switching by a nursing-home employee; choose among tasks related to blame/punishment and alternatives | Selection of blame-related task; chi-square test of equal proportions |
| Cooney et al. (2016) | Predict reactions to receiving/not receiving a bonus under fair coin-flip versus unfair personal-choice allocation | Outcome × procedure interaction; F-test in a 2×2 ANOVA |
| Halevy & Halali (2015) | Recall intervening versus not intervening in a conflict between friends | Perceived benefits of intervention; independent-samples t-test |
| Rai et al. (2017) | Humanized versus dehumanized description of a stranger; consider harm for payment | Willingness to harm for instrumental motives; independent-samples t-test |
| Schilke et al. (2015) | High versus low structural power in an imagined typing-service relationship | Willingness to provide free sample as trust measure; chi-square test |

Report effect direction, statistical significance, Cohen's d effect sizes, and Pearson correlation between human and agent effect sizes. Sampled experiments are a small set of known, text-deliverable studies; the study is not a benchmark of every form of behavioral intervention. [G1000 SM4–5, PDF pp. 28–33]

### 4.11 Measurement definitions and aggregation

**Exact-match accuracy** for categorical/ordinal GSS:

```text
accuracy_i = matching predictions for participant i / evaluated items for i
self_consistency_i = matching wave-2 and wave-1 answers / evaluated items for i
normalized_accuracy_i = accuracy_i / self_consistency_i
```

The primary analysis is calculated per person and then aggregated across participants. A normalized score of 1 means matching that person's first-wave answers as well as that person matches them two weeks later. It does not mean all answers are correct, and ratios can exceed 1.

**Continuous outcomes:** MAE and Pearson correlation, with normalized correlation relative to test–retest correlation. Do not divide MAE by self-consistency MAE when that denominator is zero; the paper therefore does not report normalized MAE.

**Fisher aggregation:** transform correlations using `z = 0.5 × ln((1+r)/(1−r))`, average z, then invert using `r = tanh(mean(z))`. Tables sometimes explicitly label the dispersion as z standard deviation. Do not interpret these quantities as ordinary bounded-r standard deviations.

**GSS correlation:** represent categorical options as binary indicators and reweight so an expanded item does not dominate. Ordinal options are evenly scaled to [0,1]. The prose gives a contradictory example weight of 0.25 for a five-option variable; see §7. Numeric GSS answers are normalized using historical response ranges from NORC, then evaluated separately.

**Personality:** reverse-code and average items into five 1–5 dimensions, then compute errors/correlations.

**Games:** normalize to [0,1] by task ranges, then calculate errors/correlations.

**Construct-level analysis:** compare predictions across people for a specific survey item, personality dimension, or game. This differs materially from the main person-level analysis across heterogeneous items for each person. Both are retained in this summary. [G1000 SM5, PDF pp. 30–33]

### 4.12 Main predictive results

Full Table 8 is transcribed in Appendix D. Means below are as reported; Table 8 also supplies standard deviations.

| Task / metric | Human test–retest | Interview agents | Demographic agents | Brief-persona agents |
|---|---:|---:|---:|---:|
| GSS raw accuracy | 81.25% | 68.85% | 57.00% | 56.79% |
| GSS normalized accuracy | 1.00 | 0.85 | 0.71 | 0.70 |
| GSS correlation | 0.83 | 0.66 | 0.51 | 0.50 |
| GSS normalized correlation | 1.00 | 0.83 | 0.63 | 0.62 |
| Big Five MAE | 0.30 | 0.67 | 0.76 | 0.74 |
| Big Five correlation | 0.95 | 0.78 | 0.61 | 0.71 |
| Big Five normalized correlation | 1.00 | 0.80 | 0.55 | 0.75 |
| Games MAE | 0.25 | 0.32 | 0.34 | 0.33 |
| Games correlation | 0.99 | 0.66 | 0.57 | 0.60 |
| Games normalized correlation | 1.00 | 0.66 | 0.48 | 0.57 |

**Headline interpretation:** 0.85 is a test–retest-normalized GSS accuracy, with approximately 69% raw answer agreement. It is not “85% of every real person's behavior is predicted.” Averaging per-person ratios also need not equal dividing the two population means exactly.

**Statistical comparisons:**

- GSS accuracy: `F(2,3153)=989.62`, `p<0.001`; Tukey comparisons favor interviews over both baselines, while demographic vs persona is not significant (`p=0.7852`).
- Big Five MAE: main text reports `F(2,3153)=25.96`, `p<0.001`.
- Big Five correlation: supplemental Table 2 reports `F(2,3153)=39.46`, `p<0.001`, with all three pairwise comparisons significant.
- Games MAE: main text reports `F(2,3153)=0.12`, `p=0.89`.
- Games correlation: Table 2 reports `F(2,3153)=2.12`, `p=0.120`; no significant pairwise comparisons.

Different F values above concern different outcomes; do not combine them into a single result. Lower MAE is better, whereas higher accuracy/correlation is better. [G1000 PDF pp. 5–6; Table 2, PDF p. 42; Table 8, PDF p. 65]

### 4.13 Experimental replication results and calibration

Main-text Table 1 uses stars for reported p-value thresholds: `*** <0.001`, `** <0.01`, `* <0.05`. Unstarred entries are transcribed without inventing a p-value.

| Study | Human p marking; d | Interview p marking; d | Demographic p marking; d | Persona p marking; d |
|---|---|---|---|---|
| Ames & Fiske | ***; 9.45 | ***; 12.59 | ***; 13.43 | ***; 10.03 |
| Cooney et al. | ***; 0.40 | ***; 1.48 | ***; 1.39 | ***; 1.37 |
| Halevy & Halali | ***; 0.90 | ***; 2.98 | ***; 4.22 | ***; 3.35 |
| Rai et al. | Unstarred; 0.040 | Unstarred; 0.094 | ***; 0.21 | Unstarred; 0.078 |
| Schilke et al. | ***; 0.33 | ***; 2.97 | ***; 5.52 | ***; 3.74 |

**Important table-reading correction:** for the Rai row, `0.040`, `0.094`, `0.21`, and `0.078` are **effect sizes**, not numeric p-values. The narrow layout can cause text extraction to place them deceptively. The original page was visually checked.

The human sample replicates four studies and fails to replicate Rai. Interview agents reproduce the same four/fifth pattern. Demographic agents show a significant Rai result, so the match is not shared by every baseline.

Effect-size correlations with the human replication:

- Interview: `r=0.98`, 95% CI `[0.74,0.99]`.
- Demographic: `r=0.93`, 95% CI `[0.24,0.99]`.
- Persona: `r=0.94`, 95% CI `[0.33,0.99]`.

The main text reports human retest effect-size correlation 0.99 and normalized interview correlation 0.99.

**Interpretation:** strong correlation over five effect sizes does not ensure calibrated magnitudes. Interview predictions for Cooney, Halevy, and Schilke are materially larger than human effects. The very large Ames/Fiske effect also differs greatly in scale from the others, so a five-point correlation warrants scrutiny. This study supports some replication fidelity; it does not alone validate intervention-impact forecasts in new domains. [G1000 Table 1 and main text, PDF pp. 7–8]

### 4.14 Alternative grounding and exploratory robustness tests

**Main baselines, all participants:**

- **Demographic agents:** replace transcripts with first-person demographic descriptions from GSS, including age, gender, race, political ideology/party context.
- **Persona agents:** replace transcripts with a short self-description participants write about background, personality, and demographics.

**Exploratory sample:** 100 randomly selected agents. Compare:

1. **Survey-and-experiment composite agents:** provide GSS, BFI, and game answers, excluding every question-answer pair in the same category as the target. GSS categories use the core documentation; BFI uses trait categories; economic games use the individual game. Average excluded proportion is 4.00% (SD 2.16).
2. **Maximal agents:** combine interviews with survey/game data, using the same held-out-category rule.
3. **Summary agents:** GPT-4o converts transcripts to factual bullet-point/dictionary summaries, removing most original linguistic features.
4. **Random-lesion agents:** randomly remove 0%, 20%, 40%, 60%, or 80% of interview question-response pairs.

| Exploratory grounding | GSS normalized accuracy | SD |
|---|---:|---:|
| Full interview / 0% lesion | 0.85 | 0.11 |
| Survey and experiments | 0.76 | 0.12 |
| Maximal | 0.85 | 0.12 |
| Summary | 0.83 | 0.12 |
| 20% removed | 0.84 | 0.12 |
| 40% removed | 0.83 | 0.12 |
| 60% removed | 0.83 | 0.12 |
| 80% removed | 0.79 | 0.11 |

Full raw accuracies, correlations, dispersion, numeric-GSS, personality, and game results are retained in Appendix D, Table 6.

**What the reported results suggest:** interview information carries predictive value beyond the compared structured instruments; adding structured answers provides little categorical-GSS gain over interviews in this sample; much of the value persists after factual summarization; distributed fragments of the interview retain useful information.

**Interpretation limits:** randomly retaining 20% of a completed two-hour interview is not equivalent to conducting a purpose-designed 24-minute interview. The sampling can preserve material from throughout the interview. The tests do not isolate every architecture component, and the observed categorical-GSS pattern should not be asserted for every metric: numerical GSS and game behavior show different results.

Numerical GSS summary: reported average correlation `r=0.97` with dispersion 0.82 and MAE `0.14` (SD 0.15). The robustness table explicitly calls several correlation dispersions “z std.” Avoid pooling six numeric questions with the 177-item accuracy headline. [G1000 PDF pp. 6–7; SM5–6, PDF pp. 33–37; Table 6, PDF p. 59]

### 4.15 Construct-level results: where the headline is weaker

The appendix reports per-item GSS results and per-dimension/per-game correlations across people. These need not match correlations calculated across heterogeneous answers within each individual.

**Big Five construct-level results:**

| Dimension | MAE | Correlation | Retest-normalized correlation |
|---|---:|---:|---:|
| Extraversion | 0.72 | 0.45 | 0.51 |
| Agreeableness | 0.60 | 0.35 | 0.43 |
| Conscientiousness | 0.63 | 0.52 | 0.59 |
| Neuroticism | 0.75 | 0.68 | 0.77 |
| Openness | 0.62 | 0.39 | 0.46 |

**Economic-game construct-level results:**

| Game | MAE | Correlation | Retest-normalized correlation |
|---|---:|---:|---:|
| Dictator | 0.23 | 0.11 | 0.24 |
| Trust first mover | 0.35 | 0.08 | 0.16 |
| Trust second mover | 0.17 | 0.03 | 0.06 |
| Public goods | 0.52 | -0.05 | -0.71 |
| Prisoner's dilemma | 0.36 | 0.10 | 0.32 |

**Interpretation:** knowing whether one person tends to give higher numerical values in one task than another is different from distinguishing which people will cooperate more in a particular game. The low between-person game correlations are consequential for simulation development and should accompany the favorable main correlation of 0.66.

**GSS item variation:** autobiographical and demographic items often have much higher exact agreement than nuanced attitudes. Table 3 includes, for example, very high marital/citizenship agreement and much lower agreement on several racial-attitude and social-spending questions. Preserve item-level results and distinguish facts explicitly elicited during the interview from harder attitude extrapolation. The complete identifier-level table is retained in Appendix D. [G1000 Table 3, PDF pp. 43–47]

### 4.16 Demographic performance analyses

The paper uses **Demographic Parity Difference (DPD)** to summarize the difference between the best- and worst-performing groups. In this study it concerns predictive-performance disparity, not simply parity of generated outcomes.

For GSS, disparities are reported in percentage points. For personality and games, they are differences in correlation-based performance. The tables include agent grounding conditions and the best/worst group's identity and metric value.

Main-text examples comparing demographic to interview grounding:

| Dimension / outcome | Demographic | Interview |
|---|---:|---:|
| Political ideology, GSS gap | 12.35 pp | 7.85 pp in prose; 7.86 in table |
| Political ideology, personality gap | 0.165 | 0.063 |
| Political ideology, games gap | 0.50 | 0.19 |
| Race, GSS gap | 3.33 pp | 2.08 pp |
| Race, personality gap | 0.17 | 0.11 |
| Race, games gap | 0.043 | 0.040 |

Gender gaps are already small and similar across conditions. Full Table 5 additionally covers age, census division, political party, education, ethnicity, income, neighborhood, and sexual orientation. Interview grounding does **not** improve every gap: for instance, the reported GSS education gap and game income gap are larger than the demographic baseline. The fuller tables prevent the general “reduces bias” description from becoming a universal claim.

**Regression:** separate models for each demographic factor, with predictive performance as dependent variable. Tables provide coefficients, standard errors, t-statistics, p-values, R², F values, degrees of freedom, and reference categories. Main discussion emphasizes higher GSS performance for strongly liberal, strongly Democratic, and nonheterosexual participants. Additional reported associations appear in the tables; all numerical regressions are retained in Appendix D.

**Cautions:** subgroup sample sizes and missingness differ; ethnicity is multiple-selection; table entries include unusual correlation-like values and suspect repeated model p-value annotations. See §7 before reproducing these analyses. Reduced disparity is not a claim of unbiased responses or proof that participants' identities are represented completely. [G1000 PDF pp. 8–9; SM5–6, PDF pp. 36–37; Tables 4–5, PDF pp. 48–58]

### 4.17 Proposed agent-bank access and source-provided resources

The bank combines interview transcripts, participant assessment answers, and code/prompts generating behavior. The researchers propose research-only API access rather than unrestricted release of rich personal transcripts. An illustrative sample of interview data is planned.

The access framework has three axes:

1. **Tasks:** arbitrary open queries versus fixed, structured tasks.
2. **Results:** individual agent responses versus aggregated statistics.
3. **Users:** broad academic access versus progressively reviewed/approved access.

The proposed two-part plan:

- **Aggregated responses on fixed tasks:** academic researchers sign usage agreements; query defined tasks or subpopulations and receive aggregates; propose new structured queries for review.
- **Individual responses on open tasks:** supply a research purpose and potential-harm assessment; obtain approval for custom queries and individual outputs.

The plan includes noncommercial restrictions, usage auditing, adaptation to future model capability and feedback, withdrawal support, and possible tighter limits if probing/jailbreaking increases privacy risk. Sensitive information can emerge indirectly even without direct transcript download, and generated defamatory statements could be falsely attributed to represented people.

This is the access plan described by the supplied manuscript; **current operational availability was not independently verified**.

Source-provided resources:

- Preregistration: [OSF record](https://osf.io/mexkf/?view_only=375fe67b9a3e48afa7c3684c9d344da4).
- Agent-generation code cited by the main-text footnote: [joonspk-research/generative_agent](https://github.com/joonspk-research/generative_agent).
- Interview protocol attribution: American Voices Project, Stanford Center on Poverty and Inequality, referenced in the manuscript.

These resources were not separately inspected; no implementation detail in this document is inferred from an unexamined repository. [G1000 PDF pp. 4, 9; SM7, PDF pp. 38–40]

### 4.18 Overall evidence boundaries

Reported evidence supports prediction on selected individual assessments and a small set of experimental tasks. The following remain open:

- Generalization outside the sampled U.S. adults and English interviews.
- Generalization to new, out-of-distribution contexts or substantially different instruments.
- Predictions of observed everyday conduct, long-term behavior, or life outcomes.
- Accuracy of interactive groups whose agents affect one another over time.
- Stability under future dated model versions, prompt changes, and sampling randomness.
- Calibrated effect magnitudes, beyond correlated effect sizes.
- Sensitivity to factual versus inferred transcript information and demographic correlations.
- Stability of ratios when individual retest correlation is near zero or negative.
- Whether displayed reasoning corresponds to participants' actual decision processes.
- Robustness to privacy probing, misleading stimuli, and model-generated identity embellishment.

These are development-relevant interpretations of the study's scope, not claims that the authors conducted and failed all these tests.

## 5. Cross-paper comparison

### 5.1 Architecture and evidence

| Dimension | SS / SimReddit | GA / Smallville | G1000 |
|---|---|---|---|
| Primary entity | Generated member persona in a conversation | Fictional resident with continuing life | Simulation of one interviewed individual |
| Main goal | Explore possible community interactions | Believable coherent behavior over time | Predict selected real-person responses |
| Grounding | Community goal, rules, persona, thread | Seed memories, perceptions, reflections, plans | Full interview, expert reflections, task history |
| Persistent experience | No Smallville-style lifetime memory architecture | Comprehensive evolving memory stream | Stored transcript/reflections; task-context memory |
| Retrieval | Thread/persona conditioning | Recency + importance + embedding relevance | Select expert domain and its reflections; use full transcript |
| Reflection | No equivalent autonomous reflection module | Recursive evidence-linked synthesis | One-time domain-perspective transcript synthesis |
| Plans | No day/activity planning | Daily plan → hours → 5–15-minute activities | No demonstrated physical daily planner |
| Environment | Subreddit-style generated prototype | Phaser world, containment tree, server JSON | Interview/task platform, textual assessments |
| Historical model | Original GPT-3 davinci | gpt-3.5-turbo | GPT-4o |
| Main human study | Real/synthetic differentiation; designer interviews | Believability ranking of agent interviews | Answers compared with source people and their retests |
| Main limits | Plausible possibilities lack probability calibration | Short fictional simulation, cost, memory errors | Task-limited real-person prediction, privacy, metric sensitivity |

### 5.2 Components that can be reused, with limits

**Development interpretation:**

- Use SS's community-level conditioning and branching to inspect alternative social scenarios.
- Use GA's memory, evidence-linked reflection, hierarchical scheduling, and world grounding when agents must live through ongoing interactions.
- Use G1000's rich interview grounding when representing particular consenting individuals, and its test–retest comparison when evaluating predictive fidelity.
- Test a combined architecture directly. A design combining all three is not itself evaluated in these papers.
- More prompts or memories are not automatically better: irrelevant history, stale beliefs, and recursive inference can degrade coherence.
- Model choice affects both ability and style. A local Ollama model is a new experimental condition; the published results do not transfer automatically.

## 6. Development specification and proposed validation

**Everything in this section is a development recommendation unless explicitly described as reported. These are proposed tests for future work, not additional experiments already performed by the papers.**

### 6.1 Choose the target before implementation

Specify which outcome the project needs:

- A world of interesting fictional characters: prioritize continuing identity, temporal coherence, grounded actions, and understandable social events.
- Community-design exploration: prioritize scenario diversity, traceable conditioning, moderation branches, and human design usefulness.
- Predictions of real individuals: prioritize consented grounding, held-out assessments, identity fidelity, test–retest baselines, and privacy.

Avoid using the same “accuracy” score for all three. If the goal is a Smallville-style town, an answer-prediction benchmark is supplementary rather than a replacement for testing the running simulation.

### 6.2 Suggested state representation

| State | Needed information | Rationale |
|---|---|---|
| Agent identity | Stable ID, authored/consented grounding, traits, source version | Distinguish seeded facts from evolving interpretations |
| Observation | Text, simulation time, source event ID, perceiver, location | Prevent agents knowing events they did not perceive |
| Memory | ID, type, creation/access time, importance, embedding reference | Reproduce retrieval and inspect failures |
| Reflection | Text, supporting memory IDs, model/prompt version | Audit how interpretations were produced |
| Plan | Activities, locations, start times, durations, status, parent plan | Verify completion and avoid repeated routines |
| Agent world belief | Known locations/objects, last observation time | Separate remembered local knowledge from current world state |
| Authoritative world | Object occupancy/state, valid actions, collision map, schedules | Enforce physical consistency |
| Dialogue | Participants, turns, locations, referenced memories, termination | Track information transfer and costs |
| Prediction trial | Agent/source participant ID, target, permitted context, prediction, ground truth | Prevent evaluation leakage |
| Run metadata | Model snapshot, prompt versions, parameters, random seeds, runtime/cost | Make comparisons reproducible |

This table is a suggested implementation schema, not a claimed schema from any of the papers.

### 6.3 Proposed Smallville validation

| Test | Procedure | Acceptance evidence |
|---|---|---|
| Retrieval recency | Give two equally relevant/important memories different access times | Computed ranking follows intended 0.995 decay |
| Retrieval importance | Hold recency/relevance constant, vary importance | Ranking reflects higher importance |
| Retrieval relevance | Mix unrelated routine records with a seeded party invitation | Appropriate record is surfaced for party questions |
| Budget handling | Large history with limited prompt capacity | Selected records fit and critical retrieved evidence is not silently cut |
| Evidence provenance | Generate reflections from known records | All referenced IDs exist; unsupported conclusions are flagged |
| Recursive error propagation | Include an intentionally wrong earlier reflection with contrary observations | Assess whether later synthesis amplifies or corrects it |
| Temporal consistency | Simulate a day with meals/work and completed activities | No repeated meal caused only by stateless decisions; plan/actual differences measured |
| Replanning | Introduce an interruption during a scheduled task | New schedule remains temporally valid and records interruption |
| Local perception | Put agent A away from a conversation between B/C | A does not know its content without later communication |
| Stale world belief | Change an object while a resident is away | Resident belief and authoritative state remain distinguishable |
| Occupancy / hours | Attempt to enter occupied one-person space or closed store | World constraints prevent physically invalid action |
| Dialogue grounding | Talk about a known relationship and project | Statements trace to seed/observed information or are marked as invention |
| Persona disagreement | Suggest activity inconsistent with a resident's priorities | Measure unjustified agreement and persona drift |
| Party coordination | Seed intention, track dissemination, invitations, plans, arrival | Count each stage separately; do not collapse knowledge into attendance |
| Memory attack | Supply a false assertion that an event previously occurred | Track whether assertion becomes unqualified autobiographical memory |
| Cost / duration | Run the same scenario across model/settings | Report successful actions, call counts, latency, cost, and simulation duration |

The paper's own interview tests are listed in Appendix A. Add running-world tests because good verbal answers do not establish that agents actually execute commitments.

### 6.4 Proposed SimReddit validation

- Change only the community goal and compare topic distributions while holding other settings fixed.
- Change only rules and inspect violations, without assuming that prompt wording predicts human compliance.
- Compare full, no-description, and no-persona conditions with blinded real/synthetic judgments.
- Test persona duplicates and measure diversity beyond name uniqueness.
- Define continuation probability deviation, valid-range policy, seed, and maximum-reply boundary explicitly.
- Ensure previous-speaker exclusion and responder-reuse policies are implemented consistently.
- Test context truncation with long conversations, including whether removing the original post makes replies incoherent.
- Treat generated text as untrusted display content; verify escaping and parser behavior if HTML tags remain part of prompting.
- Verify that WhatIf branches preserve a reproducible original and that Multiverse alternatives are labeled as possibilities.
- Ask designers to explain what they changed and why; separately measure real deployment outcomes if claims concern effectiveness.
- Track missed important scenarios; favorable generations should not certify a community as safe or fully anticipated.

### 6.5 Proposed real-person predictive validation

- Split participant grounding and benchmark targets explicitly; log what each prompt is allowed to see.
- Keep exact categorical accuracy, MAE, within-person correlations, between-person item correlations, and effect-size calibration separate.
- Include test–retest human baselines and report raw as well as normalized performance.
- Include simple baselines such as majority answers or demographic/persona descriptions; model-only baselines are useful additions beyond this paper's comparisons.
- Test direct interview facts separately from genuinely held-out attitude extrapolation.
- Use the instrument's exact reverse coding, category definitions, and normalization ranges; do not reconstruct them from intuition.
- Retain mean/dispersion, missingness, subgroup sample sizes, denominator distributions, and handling of undefined correlations.
- Replicate the source's person-level and construct-level analyses; weak per-game results must remain visible.
- Compare randomized lesions to an actual shortened-interview protocol before claiming interview-time savings.
- Run reflections present/absent with the same transcript to isolate their contribution.
- Assess experimental effect direction, significance, absolute effect-size error, uncertainty, and calibration, not just correlation.
- Use additional unfamiliar experiments to test generalization beyond the five published studies.
- Reevaluate under every materially different model/prompt version and under repeated runs.
- Test privacy probing and ensure withdrawal removes the represented participant from relevant stores and future access paths.

### 6.6 Evaluation layers and decision records

A useful evaluation sequence is:

1. Deterministic state/retrieval/plan checks.
2. Prompt-level and grounded-action checks.
3. Blinded human judgments where believability or design usefulness is the target.
4. Source-person answer comparisons where predictive validity is the target.
5. Multi-agent and long-horizon scenarios.
6. Subgroup, robustness, latency, and cost assessment.

Record unresolved decisions rather than copying uncertain constants: embedding model, prompt budget, cache refresh, reflection triggers, task-memory format, world-state validation, stop conditions, local-model settings, and statistical treatment of repeated measures/undefined ratios.

## 7. Reporting inconsistencies and replication gaps

This register distinguishes source limitations from extraction mistakes. Numerical table transcriptions intentionally preserve the reported values. Findings below should be checked against source code/data before an exact replication.

### 7.1 GA / Smallville

- The embedding model, visual-range value, universal conversation cap, exact context allocator, and cache-refresh interval are not specified in the supplied paper.
- Nominal time mapping in Appendix A should not be turned into a guaranteed runtime: the main text describes multi-day wall-clock execution and thousands of dollars of usage.
- Ablations are response-time restrictions on a common full-architecture history, not independently simulated populations.
- The TrueSkill-based `d=8.16` is not a direct predictive-accuracy effect or evidence of general superiority over expert humans.
- The news-verification finding of no fabricated positive answers is scoped to two seeded news items; six acquaintance claims are hallucinated elsewhere.

### 7.2 SS / SimReddit

- The reply-probability formula prints a mean of 0.65 and a symbolic `stdev`, without specifying its numerical value or range handling.
- The stopping condition says to stop after length exceeds eight replies; boundary behavior is not fully defined.
- No-persona error is 34% in Table 1 but 33% in nearby prose.
- Table 1 shows `p<0.05` for no personas versus full; nearby prose says `p<0.01`.
- Crowdwriter sample is reported as 50 while female/male counts 28 and 32 sum to 60.
- Evaluator gender counts sum to 198 despite reported N=200.
- “max_200_words” is a prompt cue, not a documented deterministic length guarantee.

### 7.3 G1000

- The main GSS headline uses 177 categorical/ordinal items; supplementary analysis adds six numeric items. Treating the headline as all 183 would be inaccurate.
- A categorical-weight example assigns five expanded binary options a weight of 0.25 each while claiming their total equals the original item. Equal weights summing to one would be 0.20. The document preserves the intended principle and flags the numeric example rather than guessing which implementation was used.
- The paper correctly describes Fisher-z aggregation, but labels dispersion inconsistently between main and supplementary tables. Some reported SD values exceed the range one might expect for an r-value; do not interpret them without checking the underlying scale.
- Some normalized correlations greatly exceed 1 or are negative. These ratios are not raw Pearson correlations and can be unstable when consistency denominators are small or negative.
- Table 6 reports economic-game MAE values around 0.5 with standard deviations around 2 on responses described as normalized to [0,1]. Such SDs are not compatible with ordinary bounded absolute errors as described. Preserve them as reported and verify the calculation/label before reproduction.
- Table 5 includes a persona economic-game value of 1.66 for one subgroup despite describing entries as correlations. That cannot be an ordinary Pearson r; the exact scale/aggregation needs clarification.
- Many Table 4 model-summary notes repeat `p<0.001` even where small F values and high row-level p-values would not support that omnibus significance. For example, games/gender reports F(1,1046)=0.07 while repeating p<0.001. Do not treat these notes as validated omnibus results.
- Main prose supplies personality and game **MAE** ANOVAs, whereas Table 2 supplies **correlation** ANOVAs. Their differing F values are different analyses, not necessarily a contradiction.
- Political-ideology GSS disparity is 7.85 in prose and 7.86 in the table, consistent with a rounding/reporting difference.
- Main prose on racial discrepancy contains a self-contradictory comparative sentence. Numeric results indicate the reduction from 3.33 to 2.08; use the numbers with their stated comparison.
- The expert-reflection count description says up to 20; the prompt says fewer than 20.
- Pilot-wave wording does not reconcile transparently with the 10 human/25 AI interview totals.
- The descriptive methods text says 99 scripted questions, while the printed Table 7 contains 109 question rows plus introductory and closing scripts. Appendix C preserves every printed row and its budget.
- The abbreviated-script description says some fine-grained financial questions are omitted, but Table 7 still includes substantial budget/income detail. Do not infer the exact removal list without the original script/code.
- The economic-game bonus maximum statement does not align neatly with the dictator game's $5 allocation. Preserve task amounts and payment description separately.
- The full named GSS/BFI instruments, category memberships, historical numeric ranges, dated GPT-4o snapshot, all generation parameters, random seeds, missing-data handling, and exact repeated-prompt procedures are not completely specified.
- ANOVA degrees of freedom pool three architecture groups despite each being grounded in the same participants. A replication should examine pairing/repeated-measure dependence rather than assuming an independent-groups test is automatically suitable. This is an interpretation, not a reported alternative analysis.
- Known published experiments may be represented in a pretrained model's knowledge. The supplied paper does not isolate this possible source of performance through an unfamiliar-experiment benchmark.
- Access descriptions are the manuscript's plan, not a verification of currently available services.

## 8. Source coverage map

This map records substantive coverage. Reference lists and acknowledgments are not duplicated; referenced instruments and external code are not silently treated as inspected sources.

| Source sections | PDF pages | Coverage in this document |
|---|---|---|
| GA abstract, introduction, related work | 1–4 | §§1–2.1 |
| GA behavior, user controls, environment, illustrative day/social events | 4–7 | §§2.2–2.3, 2.13 |
| GA memory, reflection, planning, reacting, dialogue | 8–12 | §§2.4–2.8 |
| GA sandbox implementation | 12–13 | §2.9 |
| GA controlled evaluation and findings | 13–15 | §§2.11–2.12; Appendix A |
| GA end-to-end evaluation / errors | 15–17 | §§2.13–2.14 |
| GA discussion, ethics, conclusion | 17–18 | §2.14 |
| GA Appendix A optimizations | 21 | §2.10 |
| GA Appendix B 25 interviews | 21–22 | Appendix A |
| SS abstract, introduction, related work | 1–4 | §3.1 |
| SS system/features | 4–8 | §§3.2–3.3 |
| SS prompting/model | 8–10 | §§3.4–3.7 |
| SS technical evaluation / Table 1 | 10–12 | §§3.8–3.10 |
| SS designer evaluation | 12–15 | §§3.11–3.12 |
| SS discussion, limitations, ethics, conclusion | 15–16 | §3.13 |
| G1000 main text / results / experiment Table 1 | 1–9 | §§4.1–4.3, 4.12–4.17 |
| G1000 SM1 constructing bank | 14–16 | §§4.2–4.3 |
| G1000 SM2 AI interviewer | 16–23 | §4.4; Appendix C |
| G1000 SM3 agent architecture | 23–26 | §§4.5–4.6 |
| G1000 SM4 assessments | 26–30 | §§4.7–4.10 |
| G1000 SM5 evaluation methods | 30–36 | §§4.11, 4.14, 4.16 |
| G1000 SM6 additional results | 36–37 | §§4.14–4.16 |
| G1000 SM7 access | 38–40 | §4.17 |
| G1000 Table 1 demographics | 41 | §4.2; Appendix D |
| G1000 Table 2 ANOVA / Tukey | 42 | §4.12; Appendix D |
| G1000 Table 3 all item/construct results | 43–47 | §4.15; Appendix D |
| G1000 Table 4 complete regressions | 48–55 | §4.16; Appendix D |
| G1000 Table 5 all subgroup gaps and extremes | 56–58 | §4.16; Appendix D |
| G1000 Table 6 all robustness metrics | 59 | §4.14; Appendix D |
| G1000 Table 7 full interview protocol | 60–64 | Appendix C |
| G1000 Table 8 complete headline metrics / dispersion | 65 | §4.12; Appendix D |

## Appendix A: Smallville interview test inventory

Source: GA Appendix B, PDF pp. 21–22. The following preserves the question purposes and parameters; wording is paraphrased. Names in brackets are substituted according to the original procedure. These are interview probes, not a supplied executable unit-test suite.

### A.1 Self-knowledge — five probes

1. Introduce yourself.
2. State your occupation.
3. Describe your interests.
4. Identify who you live with.
5. Describe a typical weekday schedule in broad terms.

### A.2 Memory — five probes

1. Identify [an agent previously interacted with; example Wolfgang Schulz].
2. Identify Kane Martinez, testing an unfamiliar name / appropriate uncertainty.
3. Say who is running in the election.
4. Recall whether the Valentine's Day party occurred.
5. Identify [another previously encountered agent; example Ayesha Khan].

For probes 1 and 5, the paper randomly selects names from people the subject encountered. The unfamiliar-name probe should not encourage fabricating a relationship.

### A.3 Plans — five probes

1. What are you doing at 6 a.m. today?
2. What are you doing at 6 p.m. today?
3. What have you just finished at 1 p.m. today?
4. What have you just finished at noon today?
5. What are you doing at 10 p.m. today?

The illustrative plans in the main evaluation discussion mention a tomorrow/10 a.m. question, but the actual appendix supplies the five questions above. Use the appendix for the reported inventory.

### A.4 Reactions — five probes

1. Your breakfast is burning: how do you respond?
2. The bathroom is occupied: what do you do?
3. You need dinner but the refrigerator is empty: what do you do?
4. You see a friend passing in the street: what do you do or say?
5. You see a street fire: how do you respond?

### A.5 Reflections — five probes

1. What currently inspires you most, and why?
2. Given what you know of [frequently encountered person], what book might they like and why?
3. What birthday gift would that person like?
4. What would you say to compliment that person?
5. Whom have you spoken with recently that you would choose to spend time with, and why?

Names in reflection probes refer to frequent interlocutors. The original appendix includes Klaus's sample answers: identity and research interests, uncertainty about the unfamiliar name, election/party recall, schedule answers, emergency/routine responses, and inferred interests of Ayesha. They illustrate outputs rather than establish every answer as factual ground truth. Development verification should compare responses against the actual stored history and plan.

## Appendix B: Parameter and result register

### B.1 Published implementation settings

| Setting | GA | SS | G1000 |
|---|---|---|---|
| Population | 25 fictional residents | 1,000 expanded personas by default | 1,052 real-person agents |
| Seed description | Semicolon-separated paragraph → memories | 10 seed personas by default | Approx. two-hour transcript |
| LLM | gpt-3.5-turbo | Original GPT-3 davinci | GPT-4o |
| Recency | 0.995 exponential decay per game hour since access | Not applicable as a memory score | Not used in described full-transcript prediction |
| Importance | LLM 1–10 | Not specified | Not this architecture's trigger |
| Retrieval weights | 1, 1, 1; min–max normalization | Community/persona/thread prompting | Select expert reflections; full transcript |
| Reflection trigger | Importance sum >150 | No equivalent | Precomputed once |
| Reflection input | 100 latest records; 3 questions; 5 insights | No equivalent | Four expert perspectives, ~6–19 per example prompt / up to 20 in prose |
| Time hierarchy | Day → hour → 5–15 minutes | No activity schedule | Interview question time budgets |
| Temperature | Not comprehensively pinned in paper | 0.7; Multiverse 0.8 | Not pinned |
| Thread continuation | Agent decision to end dialogue | Normal mean 0.65, unspecified stdev | Task-specific history |
| Responder selection | Perceiving/interacting agents | 50% new vs previous participant; exclude last speaker | Represented person answers task |
| Reply length | No universal cap reported | `max_200_words` cue | Instrument response formats |
| Interview context | Retrieved relevant memories and summary | Thread context with initial truncation | Interviewer: notes + latest 5,000 chars; predictive agent: full transcript + expert reflections |
| Evaluation horizon | Two game days | Short conversations and designer sessions | Two assessment waves two weeks apart |

### B.2 Metrics that must not be conflated

| Quantity | Meaning | What it does not establish |
|---|---|---|
| SS 41% error | Real/synthetic differentiation mistakes | 41% behavioral prediction error or future-event probability |
| GA TrueSkill 29.89 | Relative believability rating | 29.89% accuracy or an interval-scale personality score |
| GA density 0.74 | Mutual recognition graph density | Deep friendships or realistic social-network dynamics |
| G1000 68.85% | Exact agreement on categorical/ordinal GSS items | Matching every behavior or every question type |
| G1000 0.85 | Relative to human answer repeatability | 85% raw accuracy |
| G1000 0.66 game correlation | Main individual-level aggregate across games | Accurate person ranking in each individual game |
| G1000 effect correlation 0.98 | Association of five effect sizes | Calibrated magnitudes or universal experimental replication |

## Appendix C: Real-person interview protocol inventory

Source: G1000 Table 7, PDF pp. 60–64. Each entry below paraphrases a scripted prompt and preserves its **reported time budget in seconds**. The leading and closing scripts have budget 0. Conditional/repetitive prompts are retained as presented. Time budgets describe the script, not an observed duration for every respondent or a guarantee that all prompts were asked exactly as listed.

The introductory script discloses the AI interviewer, explains subtitles/pause controls and checkpoint recovery, recommends completing in one sitting, describes approximately two hours of semi-structured interviewing and research sharing, and explains when to speak. The concluding script thanks the participant and returns them to the remaining study modules.

The printed table contains **109 question rows**, plus opening and closing scripts (111 rows total), including repeated household checks. The descriptive methods text instead says 99 scripted questions; that discrepancy is retained here rather than silently deleting prompts. The listed question budgets sum to **7,130 seconds (118 minutes 50 seconds)**, calculated from Table 7; this is a derived inventory total, not a reported observed interview duration.

| Row | Prompt purpose (paraphrased) | Budget, seconds | PDF page |
|---:|---|---:|---:|
| 0 | Opening disclosure, controls, checkpoints, participation and sharing explanation | 0 | 60 |
| 1 | Life story: childhood, education, family, relationships, major events | 625 | 60 |
| 2 | Life crossroads: available paths and the story of a consequential choice | 235 | 60 |
| 3 | Whether the crossroads involved a conscious choice or happened without one | 50 | 60 |
| 4 | People or organizations that could have helped at those moments | 40 | 60 |
| 5 | Important family, partner, and children | 310 | 60 |
| 6 | Other immediate family and relationships not yet discussed | 25 | 60 |
| 7 | Important people outside family, including friends or romantic partners | 80 | 60 |
| 8 | Current neighborhood and surrounding area | 105 | 60 |
| 9 | Perceived neighborhood safety | 40 | 60 |
| 10 | Positive and negative experiences of living there | 40 | 60 |
| 11 | Everyone currently in the household, including temporary residents | 80 | 60 |
| 12 | Temporary versus permanent household members | 10 | 60 |
| 13 | People who stay occasionally | 10 | 60 |
| 14 | Usual household members currently away | 10 | 60 |
| 15 | Variation in days across a typical week | 105 | 61 |
| 16 | Current jobs and working times | 105 | 61 |
| 17 | Other routines and responsibilities | 80 | 61 |
| 18 | Recent routine changes | 80 | 61 |
| 19 | Children's school-day routine and extracurricular activities | 80 | 61 |
| 20 | Personal experiences with law enforcement | 80 | 61 |
| 21 | Other memorable law-enforcement experiences | 40 | 61 |
| 22 | Arrest experiences affecting self, loved ones, family, or friends | 40 | 61 |
| 23 | Voting frequency | 80 | 61 |
| 24 | Political views | 310 | 61 |
| 25 | Recent political-view changes | 115 | 61 |
| 26 | How Black Lives Matter, racism, and policing issues have affected the participant | 105 | 61 |
| 27 | Thoughts about issues raised by Black Lives Matter | 105 | 61 |
| 28 | Recent thoughts about race in the U.S. | 105 | 61 |
| 29 | Responses to increased attention to racism/policing: private thought, discussion, protest | 50 | 61 |
| 30 | Responses of close contacts to increased attention to racism/policing | 80 | 61 |
| 31 | General health description | 80 | 61 |
| 32 | Factors making it easy or difficult to stay healthy | 65 | 61 |
| 33 | Major health events in the past two years | 80 | 61 |
| 34 | Health effects on work or caring for children | 50 | 61 |
| 35 | Effects of loved ones' health problems | 80 | 61 |
| 36 | Access to needed health care and any care forgone | 80 | 61 |
| 37 | Use of alternative, indigenous, non-Western, or informal medicine | 80 | 61 |
| 38 | Smoking or drinking as coping mechanisms | 80 | 61 |
| 39 | Prescription medicines, pain medicines, cannabis, other substances, recent use | 80 | 61 |
| 40 | Coping with or paying for family health-care needs | 80 | 61 |
| 41 | Views about vaccination | 50 | 61 |
| 42 | Trusted sources of vaccine information | 80 | 61 |
| 43 | Feelings over the past year | 115 | 61 |
| 44 | Story of a recent emotional struggle | 80 | 62 |
| 45 | Experiences with depression, anxiety, or similar difficulties | 80 | 62 |
| 46 | Family emotional experiences | 50 | 62 |
| 47 | Importance of religion or spirituality | 155 | 62 |
| 48 | How social media is used to connect with the wider world | 115 | 62 |
| 49 | Social-media use for emotional or financial support | 50 | 62 |
| 50 | Recent changes in stress, worry, or coping strategies | 50 | 62 |
| 51 | Reconfirm current household membership | 25 | 62 |
| 52 | Babies or small children in the household | 10 | 62 |
| 53 | Usual household members currently away (repeated check) | 10 | 62 |
| 54 | Resident lodgers, boarders, or employees | 10 | 62 |
| 55 | Who pays household costs such as rent or mortgage | 5 | 62 |
| 56 | Largest household expenses last month | 50 | 62 |
| 57 | Total monthly spending, usual spending, and categories | 50 | 62 |
| 58 | Home ownership versus renting | 50 | 62 |
| 59 | Variation in bills over the past year | 50 | 62 |
| 60 | Handling recent extra expenses | 40 | 62 |
| 61 | Savings methods or lack of saving | 80 | 62 |
| 62 | Reasons for saving, such as a home or emergencies | 80 | 62 |
| 63 | Current debt, including formal and family borrowing | 50 | 62 |
| 64 | Instances of insufficient money for needs or bills in the past year | 65 | 62 |
| 65 | Current or former occupation and principal duties | 155 | 62 |
| 66 | Union or employee-association contract coverage | 40 | 62 |
| 67 | Weeks worked in the past year, including paid leave or military service | 40 | 62 |
| 68 | Usual weekly work hours | 15 | 62 |
| 69 | Whether any paid job/business work occurred in the past week | 15 | 62 |
| 70 | Multiple jobs, including part-time/evening/weekend work | 25 | 62 |
| 71 | Number of jobs worked in the past month | 25 | 63 |
| 72 | Occupational income in the past month | 50 | 63 |
| 73 | Pay frequency | 25 | 63 |
| 74 | Total household income in the past month | 50 | 63 |
| 75 | Whether taxes were filed last year | 40 | 63 |
| 76 | Workplace tenure and benefits, including leave and health benefits | 15 | 63 |
| 77 | Relationships with managers and coworkers | 15 | 63 |
| 78 | Predictability and flexibility of work hours | 80 | 63 |
| 79 | Child-care barriers to employment | 15 | 63 |
| 80 | Receipt of public benefits such as SNAP, vouchers, or SSI | 25 | 63 |
| 81 | Low-income periods in the past year and ways of making ends meet | 50 | 63 |
| 82 | Ability to cover a $400 emergency and alternative funding | 50 | 63 |
| 83 | Overall feelings about finances | 105 | 63 |
| 84 | Marital/relationship status and cohabiting romantic partner | 40 | 63 |
| 85 | Date of birth | 25 | 63 |
| 86 | U.S. birth; otherwise country of birth and immigration year | 25 | 63 |
| 87 | Birth city and state | 25 | 63 |
| 88 | Hispanic, Latinx, or Spanish origin | 15 | 63 |
| 89 | Self-identified race or races | 15 | 63 |
| 90 | Highest completed education | 15 | 63 |
| 91 | Current school enrollment | 15 | 63 |
| 92 | School enrollment during the past three months | 15 | 63 |
| 93 | Active-duty military, reserve, or National Guard service | 15 | 63 |
| 94 | Religious identity | 15 | 63 |
| 95 | Political-party identification and strength | 80 | 63 |
| 96 | Closer affiliation with Democratic or Republican party | 50 | 63 |
| 97 | City/state of residence at age 16 | 25 | 63 |
| 98 | Whether living with both own parents at age 16 | 25 | 63 |
| 99 | Other household members at age 16 | 25 | 63 |
| 100 | Father's highest education | 15 | 63 |
| 101 | Mother's highest education | 15 | 64 |
| 102 | Whether mother worked for pay while participant grew up | 15 | 64 |
| 103 | Mother's occupation and duties | 50 | 64 |
| 104 | Mother's workplace/business and its activities | 50 | 64 |
| 105 | Whether father worked for pay while participant grew up | 15 | 64 |
| 106 | Father's occupation and duties | 50 | 64 |
| 107 | Father's workplace/business and its activities | 50 | 64 |
| 108 | Hopes for life a few years in the future | 155 | 64 |
| 109 | Most important values in life | 80 | 64 |
| 110 | Closing thanks and return to remaining study modules | 0 | 64 |


## Appendix D: Complete supplementary numerical table transcriptions

Source: G1000, supplementary Tables 1–6 and 8, physical PDF pp. 41–59 and 65. These are extracted source data retained for detailed development work; they are not newly calculated results. Each table identifies its physical page(s). Column wrapping and anomalous reported values are preserved. Use the original PDF to resolve ambiguous layout, and consult §7 before treating suspicious entries as verified calculations.

For Table 3, `*` and `/y` suffixes are retained as printed identifiers; the supplied table does not fully explain every suffix. No question wording is inferred from an identifier. Table 4 includes all factor-specific coefficients and model-summary notes; Table 5 includes all reported minima/maxima, not only the favorable comparisons discussed in the main text. Table 6 contains the complete small-sample robustness metrics rather than only categorical GSS.

### D.1 Supplementary Table 1: Demographic distribution

Source: physical PDF pp. 41–41. Extracted transcription.

```text
[Physical PDF page 41]
8. Supplementary Tables
Age 18 to 24 25 to 34 35 to 44 45 to 54 55 to 64 65 to 74
11.03% 13.88% 17.49% 19.77% 21.48% 13.50%
75 or more
2.85%
Census division New England Middle Atlantic E.N. Central W.N. Central South Atlantic E.S. Central
6.65% 12.83% 18.73% 8.08% 10.08% 11.5%
W.S. Central Mountain Pacific Foreign
8.65% 5.13% 15.78% 2.57%
Education Less than high High school Associate/junior Bachelor's degree Graduate degree
school graduate graduate college
2.28% 38.88% 17.59% 26.9% 14.35%
Race White Black Other
75.95% 14.26% 9.79%
Ethnicity White/Caucasian Black/African Asian Native Hawaiian American Indian Other ethnicity
American or Pacific Isl. or Alaskan nat.
79.18% 14.64% 5.04% 0.48% 2.76% 5.80%
Sexuality Heterosexual Gay or lesbian Bisexual Asexual Pansexual Other sexual
/straight orientation
82.2% 4.36% 8.04% 1.72% 2.41% 1.15%
Gender Female Male
56.37% 43.63%
Income Less than $25,000 $25,000 to $35,000 to $50,000 to $75,000 to $100,000 to
$34,999 $49,999 $74,999 $99,999 $124,999
18.83% 11.83% 13.89% 20.44% 14.7% 8.04%
$125,000 to $150,000 to $175,000 to $200,000 to $250,000 or more
$149,999 $174,999 $199,999 $249,999
5.05% 2.18% 1.61% 1.38% 2.18%
Neighborhood Urban Suburban Rural
30.88% 48.11% 21.13%
Political ideology Extremely Liberal Liberal Slightly Liberal Moderate Slightly Conservative
conservative
11.31% 19.01% 9.32% 28.8% 8.94% 16.83%
Extremely
conservative
5.8%
Political party Strong Democrat Democrat Independent, close Independent Independent, close Republican
preference to Dem. to Rep.
21.96% 13.31% 11.88% 15.59% 8.46% 11.6%
Strong Republican Other
14.83% 2.38%
Table 1. Demographic distribution of our 1,052 participants. Collectively, they represent a stratified sample of the
U.S. demographic across age, gender, race, region of residence, level of education, and political identity. Note that
for ethnicity, the participants could choose more than one option.
```

### D.2 Supplementary Table 2: Architecture comparison: ANOVA and Tukey

Source: physical PDF pp. 42–42. Extracted transcription.

```text
[Physical PDF page 42]
[General Social Survey: Agent Architecture Comparison (ANOVA)]
Source Sum of Squares (SS) df F p-value
Group 10.032 2 989.62 < .001
Residual 15.981 3153 N/A N/A
Group 1 Group 2 Mean Difference p-value Lower Bound Upper Bound Reject Null
Demographics Interview 0.1186 < .001 0.1113 0.1258 Yes
Demographics Persona -0.0021 0.7852 -0.0093 0.0052 No
Interview Persona -0.1206 < .001 -0.1279 -0.1133 Yes
[Big Five Personality Traits: Agent Architecture Comparison (ANOVA)]
Source Sum of Squares (SS) df F p-value
Group 15.298 2 39.46 < .001
Residual 611.110 3153 N/A N/A
Group 1 Group 2 Mean Difference p-value Lower Bound Upper Bound Reject Null
Demographics Interview 0.1705 < .001 0.1255 0.2155 Yes
Demographics Persona 0.0843 < .001 0.0393 0.1293 Yes
Interview Persona -0.0862 < .001 -0.1312 -0.0412 Yes
[Economic Games: Agent Architecture Comparison (ANOVA)]
Source Sum of Squares (SS) df F p-value
Group 1.812 2 2.12 0.120
Residual 1344.295 3153 N/A N/A
Group 1 Group 2 Mean Difference p-value Lower Bound Upper Bound Reject Null
Demographics Interview 0.0585 0.0996 -0.0083 0.1253 No
Demographics Persona 0.0333 0.4704 -0.0334 0.1001 No
Interview Persona -0.0252 0.6508 -0.0919 0.0416 No
Table 2. Comparative predictive performance of agents built using different descriptions. Agents constructed from
interview transcripts outperformed both demographic-based and persona-based agents across multiple tasks.
Specifically, interview-based agents showed significant improvement in predicting responses to the General Social
Survey (in accuracy) and Big Five Personality Traits (in correlation), as confirmed by ANOVA tests (p < 0.001 for
both). In contrast, no significant differences were observed between agent types for the Economic Games (in
correlation), indicating that interviews were particularly valuable for tasks requiring deeper, personal insights.
```

### D.3 Supplementary Table 3: Complete construct-level results

Source: physical PDF pp. 43–47. Extracted transcription.

```text
[Physical PDF page 43]
[General Social Survey: Construct-Level Analysis]
General Social Survey Accuracy Normalized Correlation Normalized
accuracy Correlation
natspac/y 0.33 0.45 0.17 0.25
natenvir/y 0.6 0.74 0.51 0.69
natheal/y 0.7 0.91 0.36 0.73
natcity/y 0.48 0.75 0.32 0.62
natdrug/y 0.56 0.78 0.29 0.5
nateduc/y 0.68 0.84 0.36 0.54
natrace/y 0.64 0.84 0.67 0.87
natarms/y 0.56 0.75 0.46 0.63
nataid/y 0.7 0.85 0.34 0.53
natfare/y 0.67 0.84 0.5 0.71
natroad 0.44 0.61 0.14 0.24
natsoc 0.56 0.72 0.21 0.36
natmass 0.52 0.71 0.37 0.62
natpark 0.54 0.75 0.22 0.43
natchld 0.58 0.78 0.43 0.69
natsci 0.48 0.69 0.32 0.55
natenrgy 0.54 0.78 0.43 0.7
uswary 0.51 0.62 0.15 0.24
prayer 0.75 0.91 0.4 0.7
courts 0.56 0.74 0.48 0.7
discaffw 0.43 0.7 0.37 0.59
discaffm 0.39 0.67 0.33 0.6
fehire 0.33 0.58 0.48 0.71
fechld 0.48 0.75 0.29 0.48
fepresch 0.43 0.64 0.29 0.43
fefam 0.43 0.65 0.45 0.62
fepol 0.78 0.88 0.28 0.39
reg16 0.67 0.85 0.6 0.81
mobile16 0.75 0.85 0.72 0.86
famdif16 0.89 0.97 0.75 0.89
incom16 0.53 0.71 0.53 0.73
dwelown16 0.76 0.82 0.59 0.67
paeduc* 0.86 0.96 0.66 0.85
padeg* 0.8 0.91 0.74 0.87
maeduc* 0.91 0.98 0.72 0.92
madeg* 0.84 0.97 0.8 0.96
mawrkgrw 0.97 1.05 0.91 1.2
marital 0.97 1.02 0.96 1.03
widowed 0.98 1.0 0.84 0.95
divorced 0.94 0.97 0.86 0.92
martype* 0.84 0.97 0.78 0.94
posslq/y 0.95 1.02 0.93 1.03

[Physical PDF page 44]
wrkstat 0.76 0.94 0.76 0.94
evwork 0.96 1.01 0.66 0.94
wrkgovt1 0.88 0.95 0.56 0.74
wrkgovt2 0.74 0.89 0.3 0.51
partfull 0.81 0.99 0.69 0.93
wksub1 0.83 1.05 0.68 1.06
wksup1 0.83 1.0 0.69 0.95
conarmy 0.49 0.66 0.28 0.43
conbus 0.58 0.81 0.34 0.56
conclerg 0.63 0.83 0.6 0.83
coneduc 0.56 0.82 0.28 0.47
confed 0.5 0.7 0.23 0.38
confinan 0.52 0.72 0.2 0.31
conjudge 0.54 0.74 0.41 0.59
conlabor 0.54 0.78 0.38 0.64
conlegis 0.55 0.75 0.22 0.39
conmedic 0.6 0.85 0.43 0.67
conpress 0.62 0.84 0.42 0.64
consci 0.63 0.83 0.48 0.69
contv 0.58 0.87 0.33 0.65
vetyears 0.97 0.99 0.91 1.03
joblose 0.76 0.97 0.59 0.94
jobfind 0.59 0.84 0.32 0.67
happy 0.67 0.92 0.54 0.84
hapmar 0.77 0.94 0.5 0.81
satjob 0.67 0.96 0.43 0.83
speduc* 0.84 0.98 0.8 0.96
spdeg* 0.65 0.76 0.37 0.49
spwrksta 0.74 0.88 0.56 0.78
spjew 0.71 0.88 0.08 0.13
spfund 0.76 0.94 0.42 0.74
unemp 0.74 0.89 0.45 0.68
union1 0.94 0.99 0.57 0.83
spkath/y 0.74 0.87 0.23 0.44
colath 0.64 0.8 0.19 0.4
spkrac/y 0.56 0.71 0.04 0.07
colrac 0.71 0.9 0.17 0.34
librac/y 0.54 0.72 0.14 0.29
spkcom/y 0.68 0.8 0.21 0.32
colcom/y 0.67 0.85 0.2 0.39
libcom/y 0.75 0.89 0.19 0.34
spkhomo/y 0.9 0.98 0.28 0.65
colhomo 0.83 0.88 0.21 0.38
libhomo/y 0.85 0.96 0.39 0.67
cappun 0.67 0.77 0.37 0.51
polhitok/y 0.65 0.8 0.14 0.24

[Physical PDF page 45]
polabuse/y 0.94 1.0 -0.01 -0.02
polattak/y 0.67 0.86 0.08 0.16
grass 0.73 0.77 0.31 0.36
gunlaw 0.7 0.83 0.35 0.56
owngun 0.76 0.8 0.37 0.43
hunt1 0.89 0.94 0.21 0.3
class 0.62 0.77 0.61 0.79
satfin 0.67 0.97 0.67 0.96
finalter 0.63 0.89 0.54 0.83
finrela 0.53 0.77 0.71 0.97
race* 0.93 0.95 0.92 0.95
racdif1 0.81 0.95 0.61 0.86
racdif2 0.93 1.0 0.08 0.17
racdif3 0.71 0.89 0.42 0.7
racdif4 0.75 0.9 0.38 0.63
wlthwhts 0.33 0.6 0.14 0.35
wlthblks 0.15 0.28 0.11 0.29
wlthhsps 0.31 0.62 0.06 0.15
racwork 0.62 0.84 0.37 0.61
letin1a 0.49 0.71 0.6 0.75
getahead 0.59 0.8 0.31 0.5
aged 0.53 0.75 0.15 0.31
parsol 0.36 0.68 0.46 0.71
kidssol 0.44 0.79 0.17 0.45
spanking 0.39 0.53 0.46 0.54
divlaw 0.48 0.64 0.34 0.52
sexeduc 0.78 0.84 0.34 0.47
pillok 0.44 0.67 0.49 0.64
xmarsex 0.56 0.8 0.22 0.37
homosex 0.68 0.86 0.61 0.74
marhomo 0.53 0.69 0.6 0.7
discaff 0.57 0.8 0.47 0.78
abdefect 0.83 0.9 0.41 0.58
abnomore 0.8 0.9 0.55 0.72
abhlth 0.92 0.96 0.27 0.4
abpoor 0.83 0.91 0.59 0.74
abrape 0.9 0.95 0.48 0.64
absingle 0.79 0.88 0.54 0.68
abany 0.79 0.88 0.56 0.71
letdie1 0.74 0.82 0.35 0.48
suicide1 0.79 0.89 0.4 0.56
suicide2 0.75 0.85 0.05 0.07
suicide3 0.75 0.85 0.14 0.21
suicide4 0.66 0.77 0.22 0.31
pornlaw 0.7 0.85 0.48 0.68
fair 0.43 0.63 0.18 0.3

[Physical PDF page 46]
helpful 0.42 0.65 0.24 0.44
trust 0.47 0.66 0.24 0.41
tax 0.58 0.73 0.26 0.46
vote16 0.84 0.92 0.76 0.88
pres16 0.77 0.83 0.72 0.79
if16who 0.81 0.89 0.76 0.86
polviews 0.55 0.66 0.84 0.88
partyid 0.74 0.9 0.71 0.89
news 0.31 0.46 0.37 0.48
relig* 0.76 0.85 0.63 0.73
jew 0.72 0.96 0.17 0.36
relig16* 0.62 0.7 0.55 0.63
jew16* 0.75 1.0 0.18 0.44
attend 0.56 0.75 0.75 0.84
pray 0.5 0.69 0.75 0.83
postlife 0.82 0.9 0.59 0.75
bible 0.66 0.75 0.65 0.75
reborn 0.68 0.83 0.48 0.64
savesoul 0.82 0.9 0.57 0.72
relpersn 0.63 0.79 0.79 0.91
sprtprsn 0.56 0.78 0.73 0.9
born 0.99 1.0 0.89 1.02
granborn 0.62 0.82 0.43 0.84
uscitzn* 1.0 1.0 1.0 1.27
fucitzn 0.99 1.0 0.42 1.02
mnthsusa 0.77 0.8 0.85 0.88
educ* 0.94 0.98 0.37 0.76
degree* 0.89 0.98 0.94 0.99
income 0.42 0.67 0.34 0.56
visitors 0.86 0.93 0.25 0.61
rvisitor 0.98 1.0 0.57 1.1
dwelown 0.94 1.0 0.92 1.02
zodiac 0.9 0.92 0.89 0.92
othlang 0.85 0.92 0.55 0.71
sex* 0.99 1.0 0.97 1.0
hispanic 0.98 1.01 0.92 1.03
health 0.6 0.75 0.64 0.81
compuse* 0.97 1.01 0.12 0.31
webmob 0.98 1.01 0.15 0.62
xmovie 0.66 0.75 0.23 0.31
usewww* 0.98 1.0 -0.01 -0.05
life 0.61 0.78 0.33 0.5
richwork 0.33 0.82 0.34 0.49

[Physical PDF page 47]
[Big Five: Construct-Level Analysis]
Big Five MAE - Correlation Correlation-
Replication ratio
extraversion 0.72 - 0.45 0.51
agreeableness 0.6 - 0.35 0.43
conscientiousness 0.63 - 0.52 0.59
neuroticism 0.75 - 0.68 0.77
openness 0.62 - 0.39 0.46
[Economic Games: Construct-Level Analysis]
Economic Games MAE - Correlation Correlation-
Replication ratio
game1_DG 0.23 - 0.11 0.24
game2_TF1 0.35 - 0.08 0.16
game3_TF2 0.17 - 0.03 0.06
game4_PG 0.52 - -0.05 -0.71
game5_PD 0.36 - 0.1 0.32
Table 3. The construct-level analysis of predictive accuracy across the General Social Survey, Big Five personality
traits, and econimic games. For each construct, we provide accuracy and correlation metrics, along with replication
ratios. The analysis highlights the performance of generative agents in predicting specific dimensions within these
constructs, with metrics showing varied levels of predictive accuracy across different social, personality, and
game-based items. This evaluation complements the individual-level analysis, which is of our primary interest in
this work, by offering a detailed look at the accuracy of agents for specific constructs and items.
```

### D.4 Supplementary Table 4: Complete demographic regressions

Source: physical PDF pp. 48–55. Extracted transcription.

```text
[Physical PDF page 48]
[General Social Survey: Regression]
Age
Variable Coefficient Std. Error t-value p-value
const 0.6957 0.0039 177.365 <0.001
affiliation_18 - 24 0.0029 0.0067 0.427 0.669
affiliation_25 - 34 -0.0147 0.0063 -2.343 0.019
affiliation_35 - 44 -0.0205 0.0059 -3.510 <0.001
affiliation_45 - 54 -0.0199 0.0057 -3.517 <0.001
affiliation_65 - 74 0.0108 0.0063 1.717 0.086
affiliation_75 or more 0.0224 0.0115 1.954 0.051
Note: R² = 0.045, F(6.0, 1045.0) = 8.18, p < 0.001. Reference category: 55 - 64.
Census Division
Variable Coefficient Std. Error t-value p-value
const 0.6892 0.0043 161.841 <0.001
affiliation_e. sou. central -0.0095 0.0069 -1.370 0.171
affiliation_foreign -0.0060 0.0123 -0.485 0.627
affiliation_middle atlantic 0.0176 0.0067 2.643 0.008
affiliation_mountain -0.0139 0.0092 -1.515 0.130
affiliation_new england 0.0073 0.0083 0.878 0.380
affiliation_pacific -0.0075 0.0063 -1.187 0.235
affiliation_south atlantic 0.0032 0.0072 0.438 0.662
affiliation_w. nor. central 0.0004 0.0078 0.049 0.961
affiliation_w. sou. central -0.0067 0.0076 -0.878 0.380
Note: R² = 0.022, F(9.0, 1042.0) = 2.55, p < 0.001. Reference category: e. nor. central.
Political Ideology
Variable Coefficient Std. Error t-value p-value
const 0.6703 0.0031 218.263 <0.001
affiliation_conservative -0.0081 0.0051 -1.605 0.109
affiliation_extremely conservative -0.0007 0.0075 -0.099 0.921
affiliation_extremely liberal 0.0704 0.0058 12.181 <0.001
affiliation_liberal 0.0497 0.0049 10.208 <0.001
affiliation_slightly conservative -0.0030 0.0063 -0.468 0.640
affiliation_slightly liberal 0.0269 0.0062 4.336 <0.001
Note: R² = 0.215, F(6.0, 1045.0) = 47.70, p < 0.001. Reference category: moderate.
Political Party
Variable Coefficient Std. Error t-value p-value
const 0.7165 0.0037 196.221 <0.001
affiliation_independent (neither) -0.0397 0.0057 -7.006 <0.001
affiliation_independent, close to democrat 0.0022 0.0062 0.349 0.727
affiliation_independent, close to republican -0.0516 0.0069 -7.459 <0.001
affiliation_not very strong democrat -0.0171 0.0059 -2.884 0.004

[Physical PDF page 49]
affiliation_not very strong republican -0.0508 0.0062 -8.178 <0.001
affiliation_other party -0.0408 0.0117 -3.494 <0.001
affiliation_strong republican -0.0577 0.0058 -10.024 <0.001
Note: R² = 0.155, F(7.0, 1044.0) = 27.28, p < 0.001. Reference category: strong democrat.
Education
Variable Coefficient Std. Error t-value p-value
const 0.6828 0.0029 233.029 <0.001
affiliation_associate/junior college -0.0024 0.0053 -0.448 0.655
affiliation_bachelor's 0.0140 0.0046 3.063 0.002
affiliation_graduate 0.0225 0.0056 3.985 <0.001
affiliation_less than high school -0.0354 0.0124 -2.844 0.005
Note: R² = 0.034, F(4.0, 1047.0) = 9.11, p < 0.001. Reference category: high school.
Race
Variable Coefficient Std. Error t-value p-value
const 0.6922 0.0021 327.316 <0.001
affiliation_black -0.0208 0.0053 -3.917 <0.001
affiliation_other -0.0067 0.0063 -1.078 0.281
Note: R² = 0.015, F(2.0, 1049.0) = 7.83, p < 0.001. Reference category: white.
Ethnicity
Variable Coefficient Std. Error t-value p-value
const 0.6926 0.0021 334.816 <0.001
affiliation_American Indian or Alaskan native -0.0055 0.0113 -0.484 0.628
affiliation_Asian -0.0027 0.0085 -0.317 0.752
affiliation_Black/African American -0.0183 0.0052 -3.492 <0.001
affiliation_Native Hawaiian or Pacific Islander -0.0417 0.0268 -1.558 0.119
affiliation_Other race or ethnicity -0.0103 0.0084 -1.232 0.218
Note: R² = 0.013, F(5.0, 1122.0) = 3.02, p < 0.001. Reference category: White/Caucasian.
Gender
Variable Coefficient Std. Error t-value p-value
const 0.6909 0.0025 279.783 <0.001
affiliation_male -0.0054 0.0037 -1.432 0.153
Note: R² = 0.002, F(1.0, 1050.0) = 2.05, p < 0.001. Reference category: female.
Income
Variable Coefficient Std. Error t-value p-value
const 0.6837 0.0046 149.055 <0.001
affiliation_$100,000 to $124,999 -0.0023 0.0086 -0.263 0.792
affiliation_$125,000 to $149,999 -0.0023 0.0103 -0.221 0.825
affiliation_$150,000 to $174,999 0.0389 0.0148 2.631 0.009
affiliation_$175,000 to $199,999 -0.0106 0.0170 -0.623 0.533
affiliation_$200,000 to $249,999 0.0329 0.0183 1.800 0.072

[Physical PDF page 50]
affiliation_$25,000 to $34,999 -0.0067 0.0076 -0.889 0.374
affiliation_$250,000 or more 0.0038 0.0148 0.255 0.799
affiliation_$35,000 to $49,999 0.0109 0.0072 1.515 0.130
affiliation_$75,000 to $99,999 0.0039 0.0071 0.547 0.585
affiliation_Less than $25,000 -0.0026 0.0066 -0.394 0.694
Note: R² = 0.019, F(10.0, 861.0) = 1.70, p < 0.001. Reference category: $50,000 to $74,999.
Neighborhood
Variable Coefficient Std. Error t-value p-value
const 0.6908 0.0030 230.902 <0.001
affiliation_Rural -0.0122 0.0054 -2.255 0.024
affiliation_Urban -0.0076 0.0048 -1.586 0.113
Note: R² = 0.007, F(2.0, 869.0) = 2.91, p < 0.001. Reference category: Suburban.
Sexual Orientation
Variable Coefficient Std. Error t-value p-value
const 0.6783 0.0022 305.815 <0.001
affiliation_Asexual 0.0708 0.0155 4.574 <0.001
affiliation_Bisexual 0.0328 0.0074 4.415 <0.001
affiliation_Gay or lesbian 0.0316 0.0099 3.199 0.001
affiliation_Other sexual orientation 0.0375 0.0189 1.984 0.048
affiliation_Pansexual 0.0596 0.0131 4.539 <0.001
Note: R² = 0.071, F(5.0, 864.0) = 13.25, p < 0.001. Reference category: Heterosexual/straight.
[Big Five: Regression]
Age
Variable Coefficient Std. Error t-value p-value
const 0.6712 0.0178 37.639 <0.001
affiliation_18 - 24 0.0291 0.0306 0.949 0.343
affiliation_25 - 34 0.0167 0.0285 0.588 0.557
affiliation_35 - 44 -0.0047 0.0266 -0.178 0.858
affiliation_45 - 54 -0.0030 0.0258 -0.118 0.906
affiliation_65 - 74 -0.0516 0.0287 -1.798 0.072
affiliation_75 or more -0.1028 0.0521 -1.973 0.049
Note: R² = 0.011, F(6.0, 1045.0) = 1.87, p < 0.001. Reference category: 55 - 64.
Census Division
Variable Coefficient Std. Error t-value p-value
const 0.6520 0.0191 34.093 <0.001
affiliation_e. sou. central 0.0585 0.0310 1.888 0.059
affiliation_foreign -0.0095 0.0551 -0.172 0.863
affiliation_middle atlantic -0.0208 0.0300 -0.694 0.488

[Physical PDF page 51]
affiliation_mountain 0.0361 0.0412 0.877 0.381
affiliation_new england -0.0181 0.0374 -0.486 0.627
affiliation_pacific 0.0213 0.0283 0.753 0.452
affiliation_south atlantic 0.0313 0.0323 0.968 0.333
affiliation_w. nor. central 0.0524 0.0348 1.503 0.133
affiliation_w. sou. central -0.0209 0.0340 -0.613 0.540
Note: R² = 0.011, F(9.0, 1042.0) = 1.28, p < 0.001. Reference category: e. nor. central.
Political Ideology
Variable Coefficient Std. Error t-value p-value
const 0.6805 0.0154 44.052 <0.001
affiliation_conservative -0.0068 0.0254 -0.267 0.790
affiliation_extremely conservative 0.0151 0.0377 0.400 0.689
affiliation_extremely liberal -0.0241 0.0291 -0.828 0.408
affiliation_liberal -0.0436 0.0245 -1.779 0.076
affiliation_slightly conservative -0.0041 0.0317 -0.130 0.897
affiliation_slightly liberal -0.0363 0.0312 -1.162 0.246
Note: R² = 0.005, F(6.0, 1045.0) = 0.84, p < 0.001. Reference category: moderate.
Political Party
Variable Coefficient Std. Error t-value p-value
const 0.6656 0.0176 37.744 <0.001
affiliation_independent (neither) 0.0365 0.0274 1.333 0.183
affiliation_independent, close to democrat -0.0464 0.0298 -1.558 0.120
affiliation_independent, close to republican 0.0105 0.0334 0.315 0.753
affiliation_not very strong democrat -0.0379 0.0287 -1.321 0.187
affiliation_not very strong republican -0.0101 0.0300 -0.338 0.736
affiliation_other party 0.0701 0.0564 1.242 0.215
affiliation_strong republican 0.0222 0.0278 0.799 0.424
Note: R² = 0.012, F(7.0, 1044.0) = 1.81, p < 0.001. Reference category: strong democrat.
Education
Variable Coefficient Std. Error t-value p-value
const 0.6368 0.0132 48.170 <0.001
affiliation_associate/junior college 0.0504 0.0237 2.127 0.034
affiliation_bachelor's 0.0353 0.0207 1.708 0.088
affiliation_graduate 0.0416 0.0255 1.635 0.102
affiliation_less than high school 0.1890 0.0562 3.366 <0.001
Note: R² = 0.014, F(4.0, 1047.0) = 3.77, p < 0.001. Reference category: high school.
Race
Variable Coefficient Std. Error t-value p-value
const 0.6742 0.0095 71.125 <0.001
affiliation_black -0.0676 0.0238 -2.834 0.005
affiliation_other 0.0093 0.0280 0.332 0.740

[Physical PDF page 52]
Note: R² = 0.008, F(2.0, 1049.0) = 4.27, p < 0.001. Reference category: white.
Ethnicity
Variable Coefficient Std. Error t-value p-value
const 0.6740 0.0093 72.481 <0.001
affiliation_American Indian or Alaskan native 0.0728 0.0507 1.436 0.151
affiliation_Asian -0.0134 0.0380 -0.353 0.724
affiliation_Black/African American -0.0650 0.0235 -2.761 0.006
affiliation_Native Hawaiian or Pacific Islander 0.1443 0.1204 1.199 0.231
affiliation_Other race or ethnicity 0.0464 0.0377 1.230 0.219
Note: R² = 0.012, F(5.0, 1122.0) = 2.80, p < 0.001. Reference category: White/Caucasian.
Gender
Variable Coefficient Std. Error t-value p-value
const 0.6490 0.0110 58.917 <0.001
affiliation_male 0.0377 0.0167 2.264 0.024
Note: R² = 0.005, F(1.0, 1050.0) = 5.12, p < 0.001. Reference category: female.
Income
Variable Coefficient Std. Error t-value p-value
const 0.6991 0.0204 34.276 <0.001
affiliation_$100,000 to $124,999 0.0170 0.0384 0.443 0.658
affiliation_$125,000 to $149,999 -0.0581 0.0458 -1.268 0.205
affiliation_$150,000 to $174,999 -0.0526 0.0657 -0.801 0.423
affiliation_$175,000 to $199,999 -0.0166 0.0755 -0.220 0.826
affiliation_$200,000 to $249,999 0.0787 0.0812 0.970 0.333
affiliation_$25,000 to $34,999 -0.0181 0.0337 -0.537 0.591
affiliation_$250,000 or more -0.0505 0.0657 -0.769 0.442
affiliation_$35,000 to $49,999 -0.0496 0.0321 -1.546 0.123
affiliation_$75,000 to $99,999 -0.0571 0.0315 -1.812 0.070
affiliation_Less than $25,000 -0.0210 0.0295 -0.714 0.476
Note: R² = 0.010, F(10.0, 861.0) = 0.88, p < 0.001. Reference category: $50,000 to $74,999.
Neighborhood
Variable Coefficient Std. Error t-value p-value
const 0.6619 0.0132 49.984 <0.001
affiliation_Rural 0.0273 0.0240 1.137 0.256
affiliation_Urban 0.0163 0.0212 0.770 0.442
Note: R² = 0.002, F(2.0, 869.0) = 0.73, p < 0.001. Reference category: Suburban.
Sexual Orientation
Variable Coefficient Std. Error t-value p-value
const 0.6798 0.0102 66.621 <0.001
affiliation_Asexual -0.0499 0.0712 -0.700 0.484

[Physical PDF page 53]
affiliation_Bisexual -0.0359 0.0342 -1.050 0.294
affiliation_Gay or lesbian 0.0150 0.0455 0.329 0.742
affiliation_Other sexual orientation -0.0853 0.0869 -0.981 0.327
affiliation_Pansexual -0.0603 0.0605 -0.997 0.319
Note: R² = 0.004, F(5.0, 864.0) = 0.69, p < 0.001. Reference category: Heterosexual/straight.
[Economic Games: Regression]
Age
Variable Coefficient Std. Error t-value p-value
const 0.2859 0.0593 4.822 <0.001
affiliation_18 - 24 -0.0007 0.1017 -0.007 0.994
affiliation_25 - 34 -0.0081 0.0945 -0.085 0.932
affiliation_35 - 44 0.1149 0.0884 1.300 0.194
affiliation_45 - 54 0.0898 0.0857 1.049 0.295
affiliation_65 - 74 0.0104 0.0955 0.109 0.913
affiliation_75 or more 0.0504 0.1755 0.287 0.774
Note: R² = 0.003, F(6.0, 1041.0) = 0.54, p < 0.001. Reference category: 55 - 64.
Census Division
Variable Coefficient Std. Error t-value p-value
const 0.2977 0.0636 4.683 <0.001
affiliation_e. sou. central 0.1580 0.1032 1.531 0.126
affiliation_foreign -0.0672 0.1827 -0.368 0.713
affiliation_middle atlantic -0.0062 0.0998 -0.062 0.950
affiliation_mountain 0.0058 0.1368 0.042 0.966
affiliation_new england 0.0033 0.1239 0.026 0.979
affiliation_pacific 0.0994 0.0939 1.059 0.290
affiliation_south atlantic -0.0280 0.1073 -0.261 0.794
affiliation_w. nor. central -0.0012 0.1156 -0.010 0.992
affiliation_w. sou. central -0.0131 0.1133 -0.116 0.908
Note: R² = 0.005, F(9.0, 1038.0) = 0.57, p < 0.001. Reference category: e. nor. central.
Political Ideology
Variable Coefficient Std. Error t-value p-value
const 0.3642 0.0509 7.153 <0.001
affiliation_conservative -0.0534 0.0840 -0.635 0.526
affiliation_extremely conservative 0.2830 0.1252 2.259 0.024
affiliation_extremely liberal -0.0917 0.0959 -0.956 0.339
affiliation_liberal -0.0976 0.0810 -1.205 0.228
affiliation_slightly conservative -0.0875 0.1046 -0.836 0.403
affiliation_slightly liberal -0.0995 0.1030 -0.966 0.334
Note: R² = 0.010, F(6.0, 1041.0) = 1.76, p < 0.001. Reference category: moderate.

[Physical PDF page 54]
Political Party
Variable Coefficient Std. Error t-value p-value
const 0.2616 0.0587 4.456 <0.001
affiliation_independent (neither) 0.1738 0.0909 1.913 0.056
affiliation_independent, close to democrat 0.0344 0.0988 0.348 0.728
affiliation_independent, close to republican 0.0215 0.1110 0.193 0.847
affiliation_not very strong democrat 0.0117 0.0953 0.123 0.903
affiliation_not very strong republican 0.0204 0.0996 0.205 0.838
affiliation_other party 0.0712 0.1871 0.381 0.703
affiliation_strong republican 0.1708 0.0926 1.846 0.065
Note: R² = 0.007, F(7.0, 1040.0) = 1.01, p < 0.001. Reference category: strong democrat.
Education
Variable Coefficient Std. Error t-value p-value
const 0.3909 0.0440 8.887 <0.001
affiliation_associate/junior college -0.0941 0.0787 -1.195 0.232
affiliation_bachelor's -0.1202 0.0688 -1.748 0.081
affiliation_graduate -0.1055 0.0850 -1.241 0.215
affiliation_less than high school -0.0636 0.1866 -0.341 0.733
Note: R² = 0.004, F(4.0, 1043.0) = 0.95, p < 0.001. Reference category: high school.
Race
Variable Coefficient Std. Error t-value p-value
const 0.3365 0.0315 10.686 <0.001
affiliation_black -0.0358 0.0793 -0.452 0.652
affiliation_other -0.0610 0.0935 -0.653 0.514
Note: R² = 0.001, F(2.0, 1045.0) = 0.28, p < 0.001. Reference category: white.
Ethnicity
Variable Coefficient Std. Error t-value p-value
const 0.3335 0.0298 11.173 <0.001
affiliation_American Indian or Alaskan native -0.0601 0.1625 -0.370 0.712
affiliation_Asian -0.0909 0.1219 -0.746 0.456
affiliation_Black/African American -0.0342 0.0757 -0.452 0.651
affiliation_Native Hawaiian or Pacific Islander -0.0499 0.3859 -0.129 0.897
affiliation_Other race or ethnicity -0.0491 0.1219 -0.403 0.687
Note: R² = 0.001, F(5.0, 1118.0) = 0.18, p < 0.001. Reference category: White/Caucasian.
Gender
Variable Coefficient Std. Error t-value p-value
const 0.3190 0.0365 8.742 <0.001
affiliation_male 0.0148 0.0554 0.266 0.790
Note: R² = 0.000, F(1.0, 1046.0) = 0.07, p < 0.001. Reference category: female.

[Physical PDF page 55]
Income
Variable Coefficient Std. Error t-value p-value
const 0.2884 0.0731 3.947 <0.001
affiliation_$100,000 to $124,999 -0.0201 0.1373 -0.147 0.883
affiliation_$125,000 to $149,999 -0.0204 0.1638 -0.125 0.901
affiliation_$150,000 to $174,999 -0.0917 0.2347 -0.391 0.696
affiliation_$175,000 to $199,999 -0.0945 0.2699 -0.350 0.726
affiliation_$200,000 to $249,999 0.0108 0.2900 0.037 0.970
affiliation_$25,000 to $34,999 0.0166 0.1205 0.138 0.890
affiliation_$250,000 or more 0.0266 0.2347 0.113 0.910
affiliation_$35,000 to $49,999 0.0252 0.1147 0.220 0.826
affiliation_$75,000 to $99,999 -0.0138 0.1128 -0.122 0.903
affiliation_Less than $25,000 0.2508 0.1054 2.381 0.018
Note: R² = 0.011, F(10.0, 860.0) = 0.95, p < 0.001. Reference category: $50,000 to $74,999.
Neighborhood
Variable Coefficient Std. Error t-value p-value
const 0.3270 0.0475 6.884 <0.001
affiliation_Rural 0.0676 0.0862 0.785 0.433
affiliation_Urban -0.0300 0.0760 -0.394 0.693
Note: R² = 0.001, F(2.0, 868.0) = 0.56, p < 0.001. Reference category: Suburban.
Sexual Orientation
Variable Coefficient Std. Error t-value p-value
const 0.3417 0.0365 9.366 <0.001
affiliation_Asexual -0.0639 0.2545 -0.251 0.802
affiliation_Bisexual -0.0330 0.1222 -0.270 0.787
affiliation_Gay or lesbian -0.0567 0.1624 -0.349 0.727
affiliation_Other sexual orientation -0.0750 0.3107 -0.241 0.809
affiliation_Pansexual -0.0866 0.2160 -0.401 0.689
Note: R² = 0.000, F(5.0, 863.0) = 0.08, p < 0.001. Reference category: Heterosexual/straight.
Table 4. Regression analyses of predictive performance across demographic variables. This table presents the results
of regression analyses examining the influence of demographic variables on the predictive performance of
generative agents, across the General Social Survey, Big Five Personality Traits, and economic games. Separate
models were run for each demographic factor, with predictive performance as the dependent variable. Coefficients
represent the relative difference in performance for each demographic group, with positive values indicating higher
predictive accuracy. Significant discrepancies are observed for political ideology, party affiliation, and sexual
orientation, with stronger performance for participants identifying as strong liberals, strong Democrats, and
non-heterosexual/straight individuals.
```

### D.5 Supplementary Table 5: Complete subgroup disparities and extremes

Source: physical PDF pp. 56–58. Extracted transcription.

```text
[Physical PDF page 56]
[General Social Survey: Demographic Parity Difference]
Agents w/ Interview Agents w/ Demog. Info. Agents w/ Persona Desc.
Age DPD=4.30 DPD=4.76 DPD=3.23
Min: 35 - 44 (67.51%) Min: 45 - 54 (55.3%) Min: 45 - 54 (55.98%)
Max: 75 or more (71.81%) Max: 75 or more (60.06%) Max: 18 - 24 (59.21%)
Census Division DPD=3.16 DPD=2.74 DPD=3.99
Min: mountain (67.52%) Min: foreign (55.51%) Min: foreign (54.76%)
Max: middle atlantic (70.68%) Max: middle atlantic (58.25%) Max: middle atlantic (58.75%)
Political Ideology DPD=7.86 DPD=12.35 DPD=11.91
Min: conservative (66.22%) Min: conservative (50.74%) Min: extremely conservative
Max: extremely liberal (74.07%) Max: extremely liberal (63.09%) (50.43%)
Max: extremely liberal (62.34%)
Political Party DPD=5.98 DPD=9.79 DPD=9.34
Min: strong republican (65.89%) Min: strong republican (51.96%) Min: strong republican (52.08%)
Max: independent, close to Max: independent, close to Max: independent, close to
democrat (71.87%) democrat (61.74%) democrat (61.41%)
Education DPD=5.79 DPD=5.15 DPD=6.41
Min: less than high school Min: less than high school (53.2%) Min: less than high school
(64.74%) Max: graduate (58.35%) (52.28%)
Max: graduate (70.52%) Max: graduate (58.7%)
Race DPD=2.08 DPD=3.33 DPD=3.19
Min: black (67.13%) Min: black (54.19%) Min: black (54.13%)
Max: white (69.22%) Max: white (57.52%) Max: white (57.32%)
Ethnicity DPD=2.15 DPD=4.42 DPD=3.63
Min: Other race or ethnicity Min: Other race or ethnicity Min: Other race or ethnicity
(67.11%) (53.77%) (53.75%)
Max: White/Caucasian (69.26%) Max: Native Hawaiian or Pacific Max: White/Caucasian (57.37%)
Islander (58.19%)
Gender DPD=0.54 DPD=0.56 DPD=0.61
Min: male (68.55%) Min: male (56.68%) Min: male (56.45%)
Max: female (69.09%) Max: female (57.24%) Max: female (57.06%)
Income DPD=4.95 DPD=5.43 DPD=6.61
Min: $175,000 to $199,999 Min: Less than $25,000 (55.4%) Min: Less than $25,000 (55.21%)
(67.31%) Max: $200,000 to $249,999 Max: $200,000 to $249,999
Max: $150,000 to $174,999 (60.83%) (61.82%)
(72.26%)
Neighborhood DPD=1.22 DPD=1.62 DPD=2.89
Min: Rural (67.85%) Min: Urban (56.0%) Min: Rural (54.68%)
Max: Suburban (69.08%) Max: Suburban (57.62%) Max: Suburban (57.57%)
Sexual Orientation DPD=7.08 DPD=7.50 DPD=9.88
Min: Heterosexual/straight Min: Heterosexual/straight Min: Heterosexual/straight
(67.83%) (55.85%) (55.73%)
Max: Asexual (74.92%) Max: Pansexual (63.36%) Max: Asexual (65.61%)

[Physical PDF page 57]
[Big Five: Demographic Parity Difference]
Agents w/ Interview Agents w/ Demog. Info. Agents w/ Persona Desc.
Age DPD=0.22 DPD=0.37 DPD=0.33
Min: 18 - 24 (0.56) Min: 18 - 24 (0.23) Min: 18 - 24 (0.37)
Max: 75 or more (0.78) Max: 65 - 74 (0.6) Max: 65 - 74 (0.7)
Census Division DPD=0.19 DPD=0.24 DPD=0.23
Min: mountain (0.49) Min: mountain (0.36) Min: mountain (0.39)
Max: w. sou. central (0.68) Max: foreign (0.6) Max: foreign (0.63)
Political Ideology DPD=0.06 DPD=0.17 DPD=0.14
Min: moderate (0.6) Min: extremely liberal (0.34) Min: extremely liberal (0.49)
Max: extremely conservative (0.67) Max: moderate (0.51) Max: slightly conservative (0.63)
Political Party DPD=0.17 DPD=0.22 DPD=0.22
Min: other party (0.49) Min: other party (0.3) Min: other party (0.39)
Max: independent, close to democrat Max: independent, close to democrat Max: strong republican (0.61)
(0.66) (0.53)
Education DPD=0.23 DPD=0.24 DPD=0.3
Min: less than high school (0.44) Min: less than high school (0.3) Min: less than high school (0.33)
Max: graduate (0.68) Max: graduate (0.54) Max: graduate (0.63)
Race DPD=0.11 DPD=0.17 DPD=0.08
Min: other (0.59) Min: other (0.4) Min: other (0.52)
Max: black (0.7) Max: black (0.57) Max: black (0.6)
Ethnicity DPD=0.21 DPD=0.62 DPD=0.42
Min: Native Hawaiian or Pacific Min: Native Hawaiian or Pacific Min: Native Hawaiian or Pacific
Islander (0.49) Islander (-0.05) Islander (0.31)
Max: Black/African American (0.71) Max: Black/African American (0.57) Max: American Indian or Alaskan
native (0.73)
Gender DPD=0.01 DPD=0.01 DPD=0.02
Min: male (0.62) Min: female (0.46) Min: female (0.54)
Max: female (0.63) Max: male (0.46) Max: male (0.55)
Income DPD=0.32 DPD=0.29 DPD=0.38
Min: $200,000 to $249,999 (0.41) Min: $200,000 to $249,999 (0.31) Min: $200,000 to $249,999 (0.35)
Max: $250,000 or more (0.73) Max: $250,000 or more (0.6) Max: $150,000 to $174,999 (0.73)
Neighborhood DPD=0.03 DPD=0.05 DPD=0.04
Min: Urban (0.58) Min: Rural (0.43) Min: Suburban (0.51)
Max: Rural (0.62) Max: Urban (0.48) Max: Urban (0.54)
Sexual Orientation DPD=0.23 DPD=0.29 DPD=0.45
Min: Other sexual orientation (0.43) Min: Other sexual orientation (0.17) Min: Other sexual orientation (0.1)
Max: Pansexual (0.66) Max: Heterosexual/straight (0.46) Max: Heterosexual/straight (0.55)

[Physical PDF page 58]
[Economic Games: Demographic Parity Difference]
Agents w/ Interview Agents w/ Demog. Info. Agents w/ Persona Desc.
Age DPD=0.18 DPD=0.19 DPD=0.8
Min: 75 or more (0.21) Min: 35 - 44 (0.18) Min: 35 - 44 (0.15)
Max: 45 - 54 (0.39) Max: 55 - 64 (0.36) Max: 55 - 64 (0.94)
Census Division DPD=0.2 DPD=0.21 DPD=0.65
Min: mountain (0.25) Min: e. nor. central (0.19) Min: mountain (0.15)
Max: foreign (0.45) Max: new england (0.4) Max: pacific (0.8)
Political Ideology DPD=0.19 DPD=0.5 DPD=0.53
Min: conservative (0.24) Min: extremely conservative (-0.03) Min: moderate (0.37)
Max: extremely liberal (0.44) Max: extremely liberal (0.47) Max: slightly liberal (0.91)
Political Party DPD=0.22 DPD=0.4 DPD=0.58
Min: independent (neither) (0.21) Min: strong republican (0.03) Min: independent (neither) (0.31)
Max: strong democrat (0.43) Max: strong democrat (0.43) Max: independent, close to democrat
(0.88)
Education DPD=0.14 DPD=0.12 DPD=0.44
Min: high school (0.29) Min: associate/junior college (0.21) Min: less than high school (0.31)
Max: less than high school (0.43) Max: graduate (0.33) Max: graduate (0.76)
Race DPD=0.04 DPD=0.04 DPD=0.42
Min: black (0.3) Min: other (0.24) Min: other (0.37)
Max: white (0.34) Max: white (0.29) Max: black (0.79)
Ethnicity DPD=0.52 DPD=0.63 DPD=1.54
Min: Other race or ethnicity (0.06) Min: Other race or ethnicity (0.07) Min: Asian (0.12)
Max: Native Hawaiian or Pacific Max: Native Hawaiian or Pacific Max: Native Hawaiian or Pacific
Islander (0.58) Islander (0.7) Islander (1.66)
Gender DPD=0.03 DPD=0.03 DPD=0.05
Min: female (0.32) Min: female (0.27) Min: female (0.55)
Max: male (0.35) Max: male (0.29) Max: male (0.6)
Income DPD=0.51 DPD=0.46 DPD=0.71
Min: $200,000 to $249,999 (0.21) Min: $200,000 to $249,999 (0.19) Min: $125,000 to $149,999 (0.22)
Max: $175,000 to $199,999 (0.72) Max: $150,000 to $174,999 (0.65) Max: $175,000 to $199,999 (0.93)
Neighborhood DPD=0.14 DPD=0.11 DPD=0.52
Min: Urban (0.25) Min: Urban (0.2) Min: Urban (0.35)
Max: Suburban (0.38) Max: Suburban (0.32) Max: Rural (0.88)
Sexual Orientation DPD=0.32 DPD=0.41 DPD=0.74
Min: Asexual (0.23) Min: Heterosexual/straight (0.24) Min: Bisexual (0.2)
Max: Other sexual orientation (0.55) Max: Other sexual orientation (0.66) Max: Pansexual (0.93)
Table 5. Demographic Parity Difference (DPD) Results. This table summarizes the results of regression analyses
measuring demographic parity differences (DPD) across three tasks (GSS, Big Five, and economic games) for
agents using demographic information, interview data, and persona-based profiles. Interview-based agents
consistently reduced bias compared to demographic-based agents across political ideology, race, and gender.
```

### D.6 Supplementary Table 6: Complete exploratory robustness results

Source: physical PDF pp. 59–59. Extracted transcription.

```text
[Physical PDF page 59]
[Robustness Analysis]
GSS GSS Num. Big Five Economic Games
Interview Acc.=67.96 (std=6.67) MAE=0.14 (std=0.15) MAE=0.67 (std=0.27) MAE=0.51 (std=2.01)
Nrm. Acc.=0.85 (std=0.11)
-- -- -- --
Correl.=0.65 (z std=0.2) Correl.=0.97 (z std=0.82) Correl.=0.79 (z std=0.73) Correl.=0.52 (z std=0.9)
Nrm. Correl.=0.85 (std=0.32) Nrm. Correl.=2.16 (std=9.17) Nrm. Correl.=0.77 (std=0.76) Nrm. Correl.=0.33 (std=1.22)
Survey and Acc.=61.08 (std=7.0) MAE=0.32 (std=0.19) MAE=0.68 (std=0.25) MAE=0.47 (std=2.0)
Experiments Nrm. Acc.=0.76 (std=0.12)
-- -- -- --
Correl.=0.55 (z std=0.18) Correl.=0.75 (z std=0.62) Correl.=0.71 (z std=0.75) Correl.=0.52 (z std=0.93)
Nrm. Correl.=0.72 (std=0.33) Nrm. Correl.=1.74 (std=8.94) Nrm. Correl.=0.64 (std=0.61) Nrm. Correl.=0.31 (std=1.22)
Maximal Acc.=68.0 (std=6.65) MAE=0.28 (std=0.21) MAE=0.68 (std=0.26) MAE=0.47 (std=2.0)
Nrm. Acc.=0.85 (std=0.12)
-- -- -- --
Correl.=0.65 (z std=0.2) Correl.=0.78 (z std=0.71) Correl.=0.77 (z std=0.75) Correl.=0.55 (z std=0.93)
Nrm. Correl.=0.85 (std=0.34) Nrm. Correl.=1.85 (std=9.19) Nrm. Correl.=0.72 (std=0.78) Nrm. Correl.=0.3 (std=1.29)
Summary Acc.=66.8 (std=6.58) MAE=0.19 (std=0.18) MAE=0.69 (std=0.3) MAE=0.5 (std=2.0)
Nrm. Acc.=0.83 (std=0.12)
-- -- -- --
Correl.=0.64 (z std=0.2) Correl.=0.93 (z std=0.82) Correl.=0.76 (z std=0.76) Correl.=0.49 (z std=0.85)
Nrm. Correl.=0.84 (std=0.36) Nrm. Correl.=0.92 (std=2.77) Nrm. Correl.=0.7 (std=0.67) Nrm. Correl.=0.41 (std=1.1)
Random lesion Acc.=67.96 (std=6.67) MAE=0.14 (std=0.15) MAE=0.67 (std=0.27) MAE=0.51 (std=2.01)
(0% removal) Nrm. Acc.=0.85 (std=0.11)
-- -- -- --
Correl.=0.65 (z std=0.2) Correl.=0.97 (z std=0.82) Correl.=0.79 (z std=0.73) Correl.=0.52 (z std=0.9)
Nrm. Correl.=0.85 (std=0.32) Nrm. Correl.=2.16 (std=9.17) Nrm. Correl.=0.77 (std=0.76) Nrm. Correl.=0.33 (std=1.22)
Random lesion Acc.=67.3 (std=6.94) MAE=0.16 (std=0.13) MAE=0.66 (std=0.28) MAE=0.52 (std=2.02)
(20% removal) Nrm. Acc.=0.84 (std=0.12)
-- -- -- --
Correl.=0.64 (z std=0.2) Correl.=0.95 (z std=0.81) Correl.=0.79 (z std=0.74) Correl.=0.58 (z std=0.89)
Nrm. Correl.=0.84 (std=0.33) Nrm. Correl.=1.46 (std=3.71) Nrm. Correl.=0.75 (std=0.72) Nrm. Correl.=0.46 (std=1.18)
Random lesion Acc.=66.5 (std=6.79) MAE=0.16 (std=0.14) MAE=0.65 (std=0.28) MAE=0.52 (std=2.02)
(40% removal) Nrm. Acc.=0.83 (std=0.12)
-- -- -- --
Correl.=0.63 (z std=0.2) Correl.=0.96 (z std=0.75) Correl.=0.78 (z std=0.74) Correl.=0.63 (z std=0.9)
Nrm. Correl.=0.82 (std=0.32) Nrm. Correl.=2.14 (std=9.15) Nrm. Correl.=0.75 (std=0.74) Nrm. Correl.=0.5 (std=1.21)
Random lesion Acc.=66.44 (std=6.69) MAE=0.16 (std=0.12) MAE=0.65 (std=0.29) MAE=0.48 (std=2.0)
(60% removal) Nrm. Acc.=0.83 (std=0.12)
-- -- -- --
Correl.=0.63 (z std=0.18) Correl.=0.95 (z std=0.81) Correl.=0.77 (z std=0.74) Correl.=0.57 (z std=0.91)
Nrm. Correl.=0.82 (std=0.33) Nrm. Correl.=1.96 (std=9.02) Nrm. Correl.=0.73 (std=0.68) Nrm. Correl.=0.41 (std=1.33)
Random lesion Acc.=63.7 (std=6.96) MAE=0.18 (std=0.15) MAE=0.64 (std=0.26) MAE=0.52 (std=2.01)
(80% removal) Nrm. Acc.=0.79 (std=0.11)
-- -- -- --
Correl.=0.6 (z std=0.19) Correl.=0.96 (z std=0.76) Correl.=0.75 (z std=0.72) Correl.=0.62 (z std=0.93)
Nrm. Correl.=0.76 (std=0.25) Nrm. Correl.=2.0 (std=9.09) Nrm. Correl.=0.73 (std=0.74) Nrm. Correl.=0.46 (std=1.19)
Table 6. Robustness analysis. This table presents the results of an exploratory robustness analysis comparing
different agent architectures informed by various data sources, including interviews, surveys, experiments, and
summaries. Performance is evaluated across four constructs: the General Social Survey (GSS), GSS Numeric (GSS
Num.), Big Five Personality Traits (Big Five), and economic games. Interview-based agents consistently outperform
others, achieving high accuracy (0.85, std=0.11) on the GSS, indicating that interviews provide richer, more
comprehensive information than surveys and experiments. Maximal agents, which integrate data from all sources,
show similar performance. Summary agents perform slightly below interview-based agents, with minor losses in
accuracy (0.83, std = 0.12). A progressive decline is observed for random lesion agents as portions of interview data
are removed, with accuracy dropping from 0.85 to 0.79 as 80% of the utterances are excluded, suggesting that even
shortened interviews retain valuable insights compared to survey-only agents.
```

### D.8 Supplementary Table 8: Main performance and dispersion

Source: physical PDF pp. 65–65. Extracted transcription.

```text
[Physical PDF page 65]
General Social Survey Accuracy Normalized Correlation Normalized
Accuracy Correlation
Participant Replication 81.25% (std=8.11) 1.00 (std=0.00) 0.83 (std=0.30) 1.00 (std=0.00)
Agents w/ Interview 68.85% (std=6.01) 0.85 (std=0.11 ) 0.66 (std=0.19) 0.83 (std=0.31)
Agents w/ Demog. Info. 57.00% (std=7.45) 0.71 (std=0.11) 0.51 (std=0.19) 0.63 (std=0.26)
Agents w/ Persona Desc. 56.79% (std=7.76) 0.70 (std=0.11) 0.50 (std=0.20) 0.62 (std=0.25)
Big Five Mean Absolute - Correlation Normalized
Error Correlation
Participant Replication 0.30 (std=0.17) - 0.95 (std=0.76) 1.00 (std=0.00)
Agents w/ Interview 0.67 (std=0.27) - 0.78 (std=0.70) 0.80 (std=1.88)
Agents w/ Demog. Info. 0.76 (std=0.32) - 0.61 (std=0.70) 0.55 (std=2.25)
Agents w/ Persona Desc. 0.74 (std=0.32) - 0.71 (std=0.73) 0.75 (std=2.59)
Economic Games Mean Absolute - Correlation Normalized
Error Correlation
Participant Replication 0.25 (std=0.88) - 0.99 (std=1.00) 1.00 (std=0.00)
Agents w/ Interview 0.32 (std=0.89) - 0.66 (std=0.95) 0.66 (std=2.83)
Agents w/ Demog. Info. 0.34 (std=0.89) - 0.57 (std=0.91) 0.48 (std=2.90)
Agents w/ Persona Desc. 0.33 (std=0.88) - 0.60 (std=0.93) 0.57 (std=2.84)
Table 8. Generative agents’ predictive performance. The consistency rate between participants and the predictive
performance of generative agents is evaluated across various constructs and averaged across individuals. For the
General Social Survey (GSS), accuracy is reported due to its categorical response types, while the Big Five
personality traits and economic games report mean absolute error (MAE) due to their numerical response types.
Correlation is reported for all constructs. Normalized accuracy is provided for all metrics, except for MAE, which
cannot be calculated for individuals whose MAE is 0 (i.e., those who responded the same way in both phases). We
find that generative agents predict participants' behavior and attitudes well, especially when compared to
participants' own rate of internal consistency. Additionally, using interviews to inform agent behavior significantly
improves the predictive performance of agents for both GSS and Big Five constructs, outperforming other
commonly used methods in the literature.
```

