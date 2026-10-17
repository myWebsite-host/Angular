# Architectural Decisions

## AI Tools Declaration
- AI tools were used to assist with Angular Signals usage, form validation using NonNullableFormBuilder, CSS variable creation for design tokens, and translation file generation. All AI-generated suggestions and code were manually reviewed, validated, and tested before being used.

## Key Decisions

1. **State Management: Angular Signals vs. BehaviorSubject**
   - **Chosen:** Angular Signals (`signal()`, `computed()`).
   - **Rejected:** RxJS `BehaviorSubject`.
   - **Why:** Provides fine-grained reactivity out of the box with zero boilerplate subscription management or memory leak risks.

2. **Search & Filter State: URL Query Parameter Sync (FR2)**
   - **Chosen:** Bi-directional sync between filters and URL query parameters with debouncing.
   - **Rejected:** Storing state purely in local component memory.
   - **Why:** Fulfills the requirement for shareable/bookmarked filtered views so users can copy and send links.

3. **Form Validation Timing: Blur-Level & Non-Nullable Builder (FR3)**
   - **Chosen:** Non-nullable form group with blur validation triggers.
   - **Rejected:** Instant keystroke validation and nullable form controls.
   - **Why:** Prevents noisy, frustrating error states while typing; guarantees strict type safety without `null` leaks.

4. **Fixture Data Handling: Runtime Normalizer Service**
   - **Chosen:** Dynamic normalization transformation layer (`OrgNormalizerService`).
   - **Rejected:** Pre-cleaning the raw JSON fixture file.
   - **Why:** Satisfies the prompt requirement ("do not clean it up before loading") and proves resilience against messy backend data.



## Conflict Resolutions

1. **Conflict 1 (Pagination vs One Page):** 
   - **Choice:** Client-side caching with chunked loading simulation.
   - **Rejected:** Hard-blocking API calls for every filter change which triggers rate limits.
   - **Why:** Protects against API rate limits while letting ops users filter instantly.
   
2. **Conflict 2: Coloured Dot vs. Accessibility Standard**
- **Choice:** Combined a coloured status dot with an explicit text badge label.
- **Rejected:** A minimalist coloured dot with no text label.
- **Why:** Accessibility is non-negotiable. Conveying state strictly through color violates WCAG accessibility guidelines for color-blind users. By pairing a subtle design dot with a clean text label, we preserve the uncluttered aesthetic requested by the designer while remaining fully compliant with accessibility standards.
