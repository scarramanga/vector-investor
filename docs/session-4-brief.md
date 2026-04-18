**Vector by Sovereign Signal**

Session 4 Brief

Claude API Enhancement Layer

  -------------------- ----------------------------------------------
  **Document owner**   Andy Boss / Sovereign Assets Limited
  **Session**          4 of n
  **Predecessor**      Session 3 (v0.3.0 --- Asset Discovery Layer)
  **Target version**   v0.4.0
  **Date**             April 2026
  -------------------- ----------------------------------------------

**Context**

Vector is at v0.3.0. Three sessions complete. The static experience
works end to end: 13 questions, scoring engine, four persona profiles
with six capital band overlays, asset discovery layer with 39 instrument
cards across four conviction themes.

Session 4 transforms Vector from a static quiz into an AI-powered
investor orientation platform. Two Claude API calls per completed quiz
produce personalised profile narratives and instrument commentary that
reference the user\'s specific answers. No two outputs are identical.

This is the feature that makes Vector a product rather than a
questionnaire. It is also the capability that differentiates Vector in
the Sharesies integration conversation.

**Scope**

**In Scope**

-   Claude API integration: two calls per completed quiz

-   Answer payload interface: structured TypeScript object emitted by
    the scoring engine

-   System prompt construction: composite prompt using Voice and Tone
    Reference Document v1.0

-   Loading and reveal UX: skeleton states with staggered fadeSlideUp on
    completion

-   Graceful fallback: static content serves as baseline if API fails

-   Environment configuration: separate API key and model env vars

-   Voice and Tone Reference Document added to repo

**Out of Scope**

-   Deployment to vectorinvestor.app (separate deployment session)

-   Changes to the 13 questions or scoring logic

-   Changes to the static profile copy or instrument card content

-   StackMotive profile ingestion engine

-   Analytics or tracking

-   User accounts or persistence

**Technical Specification**

**1. Environment Variables**

Add to the project\'s environment configuration and document for
Kubernetes deployment:

> VECTOR\_ANTHROPIC\_API\_KEY=sk-ant-\... \# Separate key, not
> StackMotive\'s
>
> VECTOR\_CLAUDE\_MODEL=claude-haiku-4-5-20251001 \# Swappable via env
> var

For local development, use a .env file. For production, these will be
added to the vector-prod namespace secrets during the deployment
session.

The model value must be read at runtime, never hardcoded in API call
logic. Default to claude-haiku-4-5-20251001 if the env var is missing.

**2. Answer Payload Interface**

The scoring engine currently determines persona and capital band. It
must now emit a structured object that both the result page and
discovery page consume, and that gets passed to the API calls.

Define this interface in **src/types/vector.ts**:

**VectorAnswerPayload Interface**

**answers**: Record of all 13 question answers, keyed q1 through q13,
each typed as \'A\' \| \'B\' \| \'C\' \| \'D\'.

**persona**: \'awakening\' \| \'comfortable\_blind\_spot\' \|
\'gut\_trader\' \| \'swamped\_analyst\'

**capitalBand**: \'emerging\' \| \'building\' \| \'established\' \|
\'concentrated\' \| \'sovereign\_capital\' \|
\'sovereign\_concentrated\'

**timeHorizon**: Derived from Q8. Values: \'long\' \| \'medium\' \|
\'short\' \| \'undefined\'

**frictionPoint**: Human-readable label from Q12 answer. Example:
\'Knowledge gap is the primary blocker\' for Q12-A.

**desiredOutcome**: Human-readable label from Q13 answer. Example:
\'Wants a clear starting point\' for Q13-A.

**macroAwareness**: Derived from Q9. Values: \'high\' \| \'moderate\' \|
\'low\' \| \'none\'

**actionHistory**: Derived from Q10. Values: \'inactive\' \| \'active\'
\| \'research\_only\' \| \'new\'

**convictionDriver**: Derived from Q11. Values: \'social\' \| \'thesis\'
\| \'analysis\' \| \'instinct\'

The scoring engine must populate all fields. The frictionPoint and
desiredOutcome fields should contain interpretive labels, not raw answer
letters.

**3. API Service Module**

Create **src/services/vectorAI.ts**. This module handles both API calls.

Requirements:

-   Read the model from the environment variable

-   Construct the system prompt (see section 4)

-   Accept the VectorAnswerPayload as input

-   Return the generated text

-   Handle errors gracefully: return null on failure, never throw to the
    UI

-   Implement a timeout (8 seconds for Call 1, 6 seconds for Call 2)

-   Never expose the API key to the client bundle

**Architecture Decision: Lightweight API Proxy**

Because Vector is currently a static React SPA with no backend, the API
calls cannot be made directly from the browser (the API key would be
exposed in the client bundle).

Solution: **add a minimal server component.** A single Express server
file (**server/proxy.ts**) with one POST endpoint. The Docker build
produces a Node server that serves the static React build and handles
the API proxy. This keeps everything in one container and one
deployment.

**Proxy Endpoint Specification**

**POST /api/generate**

Request body:

> { \"type\": \"profile\" \| \"discovery\", \"payload\":
> VectorAnswerPayload, \"theme\"?: string }

Success response:

> { \"content\": string, \"model\": string }

Error response:

> { \"error\": string, \"fallback\": true }

The theme field is only required for discovery type calls. It identifies
which conviction theme to generate instrument commentary for.

**4. System Prompt Construction**

The system prompt is a composite of three parts:

**Part 1: Voice and Tone.** The full Voice and Tone Reference Document
(v1.0). This sets the register, hard rules (no em dashes, no emojis, no
slop phrases), and intellectual posture.

**Part 2: Task context.** Differs between Call 1 and Call 2.

**Part 3: Answer data.** The full VectorAnswerPayload serialised as
JSON, included in the user message (not the system prompt).

**Call 1 Task Context (Profile Narrative)**

*You are generating a personalised investor orientation profile for
Vector by Sovereign Signal. You have received the user\'s complete
answer set across 13 questions, their classified persona, and their
capital band.*

*Your task: write two paragraphs.*

*Paragraph 1, Recognition. Write directly to this person in second
person. Reference specific signals from their answers, not generically,
but in a way that makes them feel seen. If they answered Q5 with A (the
index fund default feels right) but Q2 with B (the old playbook might
not work), surface that tension. If their Q10 shows inaction but Q11
shows thesis-driven conviction, name that gap. The recognition paragraph
should make the reader feel understood, not categorised.*

*Paragraph 2, Reframe. Based on their specific combination of answers,
offer the single most relevant lens shift. Not a lecture. Not a list.
One idea that connects what they believe to what they have not yet
considered. This should feel like the most useful thing anyone has ever
said to them about their financial position.*

*Length: 150 to 250 words total across both paragraphs. No more. Do not
use headings, bullet points, or lists. Write in flowing prose. Do not
mention Vector, StackMotive, or any product by name. Do not give
financial advice. Do not recommend specific securities. Do not use em
dashes.*

**Call 2 Task Context (Instrument Commentary)**

*You are generating a personalised one-sentence thesis for each
instrument in a conviction theme within Vector by Sovereign Signal. You
have received the user\'s answer set, persona, capital band, and the
theme with its instruments.*

*For each instrument provided, write exactly one sentence explaining why
this instrument is relevant to someone with this specific worldview and
situation. Reference their answers where natural, including their time
horizon, conviction driver, and macro awareness level. Each sentence
should feel like it was written for this person, not copied from a
brochure.*

*Return the output as a JSON object with ticker symbols as keys and
thesis sentences as values. Do not give financial advice. Do not
recommend buying anything. Frame everything as \'someone who thinks this
way might find it useful to understand\...\' Do not use em dashes. Do
not use exclamation marks. Plain language throughout.*

**5. Result Page Integration (Call 1)**

Current state: the result page renders static profile content via
ProfileHeader, RecognitionCard, ReframeCard, OrientationCard,
CapitalBandBadge, EducationCards, BridgeCard.

Session 4 changes:

-   On result page mount, fire Call 1 via the proxy endpoint.

-   While waiting: show a skeleton loading state in place of
    RecognitionCard and ReframeCard. Use a subtle pulse animation on
    placeholder blocks that match the approximate dimensions of the
    content. The rest of the page (ProfileHeader, CapitalBandBadge)
    renders immediately with static content.

-   On success: replace the skeleton with the dynamic narrative. Apply
    the existing staggered fadeSlideUp entrance animation.

-   On failure or timeout: render the static RecognitionCard and
    ReframeCard content from Session 2. No error message shown to the
    user. No indication the dynamic content was attempted.

The OrientationCard, EducationCards, and BridgeCard remain static. They
are already persona and capital band specific. The dynamic layer
enhances recognition and reframe only, the two components where
answer-specific personalisation creates the most impact.

**6. Discovery Page Integration (Call 2)**

Current state: each ThemeCard is collapsed by default and expands on tap
to reveal instrument cards with static one-sentence thesis lines.

Session 4 changes:

-   When a ThemeCard is expanded for the first time, fire Call 2 for
    that theme via the proxy endpoint.

-   While waiting: show the instrument cards with their existing static
    content. Overlay a subtle shimmer effect on the thesis line area
    only.

-   On success: replace the static thesis lines with the dynamic
    personalised versions. Brief fade transition.

-   On failure or timeout: static thesis lines remain. No error state.

-   Cache the response in component state. If the user collapses and
    re-expands a theme, do not re-fire the API call. Use the cached
    response.

Call 2 returns JSON. Parse it and match ticker symbols to instrument
cards. If a ticker is missing from the response, keep the static thesis
for that card.

**7. Loading UX Specification**

**Result Page Skeleton (Call 1 Loading State)**

-   Two rounded rectangular blocks where RecognitionCard and ReframeCard
    will appear

-   Background: existing card background colour at reduced opacity

-   Subtle pulse animation (opacity oscillating between 0.4 and 0.7,
    1.5s cycle)

-   A single line of text below the skeleton: \'Building your
    profile\...\' in secondary text colour

-   The skeleton should feel calm and considered, not urgent

**Discovery Page Shimmer (Call 2 Loading State)**

-   The thesis line area within each instrument card gets a horizontal
    shimmer sweep

-   The rest of the card (ticker, name, exchange badge, volatility
    badge) renders immediately

-   No loading text needed. The shimmer is sufficient signal.

**8. Voice and Tone Document in Repo**

Add the Voice and Tone Reference Document to
**src/config/voice-and-tone.md** in the repo. The API proxy reads this
file at startup and includes it in the system prompt construction. It
must not be bundled into the client.

**9. Error Handling and Resilience**

-   API key missing: log a warning at server startup, all API calls
    return fallback immediately

-   API timeout (8s for Call 1, 6s for Call 2): abort the request,
    return fallback signal

-   API error (4xx, 5xx): log the error server-side, return fallback
    signal to client

-   Malformed response: if Call 1 returns empty or unparseable content,
    use static fallback. If Call 2 returns invalid JSON or missing
    tickers, use static fallback per-instrument.

-   Rate limiting (429): return fallback, log for monitoring

-   Network failure: return fallback

**The user must never see an error state, a retry button, or a
\'something went wrong\' message related to the AI layer.** The product
works without it. The AI is an enhancement.

**File Structure Changes**

> src/types/vector.ts \# VectorAnswerPayload interface (new)
>
> src/services/vectorAI.ts \# Client-side service, calls proxy (new)
>
> src/config/voice-and-tone.md \# Voice and Tone v1.0 (new)
>
> src/components/ResultPage/
>
> RecognitionCard.tsx \# Modified: accepts dynamic content prop
>
> ReframeCard.tsx \# Modified: accepts dynamic content prop
>
> SkeletonCard.tsx \# New: loading skeleton component
>
> src/components/DiscoveryPage/
>
> ThemeCard.tsx \# Modified: fires Call 2 on first expand
>
> InstrumentCard.tsx \# Modified: accepts dynamic thesis prop
>
> server/proxy.ts \# API proxy server (new)
>
> server/promptBuilder.ts \# System prompt construction (new)
>
> Dockerfile \# Modified: Node server, not nginx-only

**Acceptance Criteria**

1.  Completing the quiz produces a personalised recognition and reframe
    narrative that references the user\'s specific answers. Verified by
    completing the quiz twice with different answers and confirming
    different output.

2.  Expanding a conviction theme on the discovery page produces
    personalised instrument thesis sentences. Verified by checking at
    least two themes.

3.  If the API key env var is removed, the entire experience still works
    using static content. No errors visible to the user.

4.  The API proxy does not expose the API key to the browser. Verify by
    inspecting network requests in browser dev tools.

5.  The loading skeleton appears on the result page while Call 1 is in
    progress. The shimmer appears on instrument thesis lines while Call
    2 is in progress.

6.  Collapsing and re-expanding a theme does not re-fire Call 2. Cached
    response is used.

7.  The dynamic content follows Voice and Tone rules: no em dashes, no
    emojis, no exclamation marks, no slop phrases, no lists.

8.  The model can be changed via the VECTOR\_CLAUDE\_MODEL env var
    without code changes.

9.  All existing Session 1-3 functionality is preserved. No regressions.

**Things Devin Must Not Do**

-   Do not modify the 13 questions or scoring logic

-   Do not modify the static profile copy, orientation content,
    education cards, or bridge content

-   Do not modify the instrument card static content (tickers, names,
    exchange badges, volatility badges, access methods)

-   Do not add user accounts, authentication, or any persistence layer

-   Do not add analytics or tracking

-   Do not hardcode the API key anywhere. It must come from environment
    variables.

-   Do not hardcode the model string. It must come from environment
    variables with a default.

-   Do not add a typewriter or token-streaming effect. Use the
    skeleton/reveal pattern specified.

-   Do not bundle the Voice and Tone document or the API key into the
    client-side JavaScript bundle

-   Do not create kubectl commands in this brief. Deployment is a
    separate session.

-   Do not create tags. Andy creates tags from terminal after merge.

**Testing Checklist**

Before marking the PR as ready:

10. Complete the quiz with \'all A\' answers. Verify the dynamic profile
    references themes consistent with a Comfortable Blind Spot persona.

11. Complete the quiz with answers B, B, D, D, C, B, B, A, A, B, B,
    B, A. Verify different dynamic output from test 1.

12. Remove the VECTOR\_ANTHROPIC\_API\_KEY env var. Complete the quiz.
    Verify static content renders with no errors in console.

13. Set a 1-second timeout on Call 1. Verify the skeleton appears
    briefly then static content renders.

14. Expand all four conviction themes. Verify each fires Call 2 only
    once. Collapse and re-expand to verify no additional API calls in
    network tab.

15. Read every word of the dynamic output. Flag any em dashes,
    exclamation marks, emojis, or slop phrases from the Voice and Tone
    banned list.

16. Open browser dev tools Network tab. Search for the API key string.
    It must not appear in any request.

17. Run the existing quiz flow end to end. Verify no regressions in
    navigation, scoring, animations, or layout.

**Version**

This session produces v0.4.0. Do not create a git tag. Andy will tag
after merge.

**Notes for Andy**

-   The Dockerfile change from nginx to Node is the biggest
    architectural shift. The container will be slightly larger and use
    marginally more memory. At Vector\'s expected traffic this is
    negligible.

-   Anthropic API costs at Haiku pricing for two calls per quiz
    completion will be fractions of a cent per completion. Even at 1,000
    completions per day the daily cost would be under \$1.

-   The proxy pattern is the same one you would need for the Sharesies
    white-label scenario. The bridge destination is a variable, the API
    layer is server-side, and the client never touches secrets.

-   VECTOR\_ANTHROPIC\_API\_KEY should be created as a separate key in
    the Anthropic console. Label it \'Vector Production\' so it shows
    separately in usage dashboards.

*Document owner: Andy Boss / Sovereign Assets Limited*

*Status: Ready for Devin*
