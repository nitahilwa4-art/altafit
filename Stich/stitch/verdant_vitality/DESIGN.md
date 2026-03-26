# Design System Document: The Editorial Health Experience

## 1. Overview & Creative North Star
**Creative North Star: The Mindful Curator**
This design system rejects the cluttered, utility-first aesthetic of traditional fitness trackers. Instead, it adopts a "High-End Editorial" approach. We treat nutritional data not as a spreadsheet, but as a curated gallery of personal wellness. 

To move beyond "standard" UI, this system leverages **intentional asymmetry** (e.g., staggering cards in a vertical feed), **dynamic breathing room** (using large 5.5rem+ margins for section breaks), and **tonal depth**. By abandoning rigid 1px borders in favor of soft background shifts, we create an interface that feels organic, airy, and premium—mimicking the layout of a high-end wellness magazine.

---

## 2. Colors & Tonal Architecture
The palette is rooted in a "Super-White" foundation, accented by high-contrast charcoal and a "Vibrant Vitality" green.

### The Color Logic
- **Primary (`#006a34`)**: Used for high-priority actions. To ensure a custom feel, use `primary_container` (`#6dfe9c`) for large background washes and reserve the deep `primary` for text and icons atop those washes.
- **Surface & Background**: Use `surface` (`#f9f6f5`) as your base. It is a "warm white" that reduces eye strain compared to pure `#ffffff`.

### The "No-Line" Rule
**Strict Mandate:** 1px solid borders are prohibited for sectioning. 
Structure must be defined through:
1.  **Background Color Shifts:** Place a `surface_container_low` (`#f3f0ef`) element on a `surface` (`#f9f6f5`) background.
2.  **Negative Space:** Use the `8` (2.75rem) or `10` (3.5rem) spacing tokens to separate logical groups.

### Signature Textures: Glass & Gradients
To avoid a "flat" template look:
- **Floating CTAs:** Use a Backdrop Blur (20px+) with `surface_container_lowest` at 80% opacity to create a "Frosted Glass" effect.
- **The Vitality Gradient:** For primary progress bars or hero buttons, use a linear gradient from `primary` (`#006a34`) to `primary_container` (`#6dfe9c`) at a 135-degree angle. This adds "soul" and dimension.

---

## 3. Typography: The Editorial Voice
We use **Inter** exclusively, but we treat it with editorial intent—heavy weight contrasts and generous leading.

- **Display (Display-LG/MD):** Reserved for daily caloric totals or "Big Wins." Use `on_surface` (`#2f2e2e`) with `-0.02em` letter spacing to feel tight and authoritative.
- **Headlines (Headline-SM):** Use for section titles (e.g., "Breakfast," "Nutrient Breakdown").
- **Body (Body-LG):** Set with a line height of 1.6x to ensure the "Airy" feel requested.
- **Labels (Label-MD):** Use for secondary data like timestamps or "g" measurements. Use `on_surface_variant` (`#5c5b5b`) to create hierarchy through color rather than just size.

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to create "boxes"; we use them to create "atmosphere."

- **The Layering Principle:** 
    - **Base:** `surface`
    - **Level 1 (Cards):** `surface_container_low`
    - **Level 2 (Active States):** `surface_container_highest`
- **Ambient Shadows:** When a card must float (e.g., an AI chat suggestion), use a shadow with a 32px blur, 0px spread, and 4% opacity of the `on_surface` color. It should feel like a soft glow, not a hard drop-shadow.
- **The "Ghost Border" Fallback:** If a divider is mandatory for accessibility, use `outline_variant` (`#afacac`) at **15% opacity**. Anything higher is too aggressive for this system.

---

## 5. Components

### Modern Chat Bubbles (The AI Interface)
- **User Bubble:** `surface_container_high` (`#e5e2e1`) with `xl` (1.5rem/24px) rounded corners. Align to the right.
- **AI Bubble:** Use the "Glassmorphism" rule—`surface_container_lowest` with 80% opacity and a backdrop blur. This distinguishes the AI as a "layer" above the data.

### Sleek Progress Bars
- **Track:** `surface_container` (`#eae7e7`). 
- **Indicator:** The "Vitality Gradient" (Primary to Primary-Container).
- **Styling:** Height should be thin (8px) with `full` rounding to maintain a sophisticated, non-industrial look.

### Minimal Cards
- **Construction:** Use `xl` (1.5rem/24px) corner radius.
- **Spacing:** Internal padding must follow the `5` (1.7rem) spacing token. 
- **Separation:** Forbid dividers. Use a `surface_container_low` background to distinguish the card from the main `surface`.

### Action Chips
- **State:** Unselected chips use `surface_variant`. Selected chips use `primary_container` with `on_primary_container` text.
- **Shape:** Use `full` rounding (pill shape) for a friendlier, modern feel.

---

## 6. Do's and Don'ts

### Do
- **Do** use asymmetrical margins (e.g., 2.75rem on the left, 1.4rem on the right) for headline placements to create an editorial feel.
- **Do** use `primary_fixed_dim` for subtle icons that need to feel "healthy" but not distracting.
- **Do** allow content to bleed off-screen horizontally in carousels to encourage exploration.

### Don't
- **Don't** use black (`#000000`). Always use `on_surface` (`#2f2e2e`) for text to maintain a premium, soft-touch feel.
- **Don't** use the `DEFAULT` (8px) rounding for main containers; it feels too "standard." Always lean toward `xl` (24px) for the signature look.
- **Don't** crowd the screen. If you're unsure, add more `spacing-8`. Space is a luxury brand attribute.

---

## 7. Spacing & Grid
- **Gutter:** 1.4rem (`spacing-4`).
- **Section Vertical Gap:** 3.5rem (`spacing-10`).
- **Component Internal Padding:** 1.2rem (`spacing-3.5`) or 1.7rem (`spacing-5`).

By adhering to these rules, the app will transcend being a "tool" and become an "experience"—one that feels as healthy and vibrant as the lifestyle it promotes.