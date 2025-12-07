# UXPilot Prompts V2 - DeFi Yield Simulator

Sequential prompts for designing the redesigned DeFi Yield Simulator UI.
Each prompt generates one page/view.

---

## Design System Reference

### Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | Deep Purple | `#48104a` | Primary buttons, active states, brand |
| **Primary Light** | Soft Purple | `#6B2D6B` | Hover states, secondary elements |
| **Success** | Muted Green | `#2D6B4F` | Positive returns, gains |
| **Warning** | Warm Amber | `#B8860B` | Caution states |
| **Danger** | Deep Red | `#8B0000` | Losses, liquidation warnings |
| **Background** | Off-White | `#FAFAFA` | Page background |
| **Surface** | White | `#FFFFFF` | Cards, panels |
| **Text Primary** | Charcoal | `#1A1A1A` | Headings, body text |
| **Text Secondary** | Slate Gray | `#6B7280` | Labels, secondary info |
| **Border** | Light Gray | `#E5E7EB` | Dividers, input borders |

### Design Principles (Robinhood-inspired)

- **Spacious**: Generous whitespace, never cramped
- **Bold typography**: Large numbers, clear hierarchy
- **Rounded & soft**: Pill buttons, rounded cards (16px radius)
- **One focus**: Each screen has one primary purpose
- **Minimal**: Only essential information, no clutter
- **Touch-friendly**: Large tap targets, comfortable inputs
- **Light mode**: Clean white cards on light gray background

### Typography

- Font: Inter or SF Pro (system)
- Hero numbers: 48-64px, bold
- Section headers: 18-20px, semibold
- Body: 14-16px, regular
- Labels: 12-14px, medium, muted color
- Monospace for financial figures

---

## Prompt 1: Global Layout Shell

```
Design the main layout shell for "DeFi Yield Simulator" - a portfolio simulator for institutional DeFi investors. Full-height sidebar with integrated branding.

DESIGN STYLE:
- Robinhood-inspired: clean, spacious, modern fintech
- Light mode with generous whitespace
- Large bold typography for key numbers
- Rounded corners (16px), soft shadows
- Professional but approachable
- Desktop-first (1440px)

COLOR PALETTE:
- Primary: Deep Purple #48104a
- Primary Light: Soft Purple #6B2D6B
- Background: #FAFAFA
- Surface/Cards: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #6B7280
- Border: #E5E7EB
- Success: #2D6B4F
- Warning: #B8860B
- Danger: #8B0000

---

LAYOUT STRUCTURE:

┌──────────────┬──────────────────────────────────────────┐
│   SIDEBAR    │  GLOBAL CONTROLS                         │
│   (full      │  [Portfolio Allocation] 16px [ETH Price] │
│    height)   ├──────────────────────────────────────────┤
│              │                                          │
│   Logo       │                                          │
│   Nav        │         CONTENT AREA                     │
│              │                                          │
│   Lang       │                                          │
└──────────────┴──────────────────────────────────────────┘

- NO separate header bar
- Sidebar spans full viewport height
- Global controls sit at top of content area (right of sidebar)
- No gap between sidebar and global controls (flush against sidebar)
- 16px gap BETWEEN the two control widgets
- Subtle bottom border on global controls to separate from content

---

SIDEBAR (left, 240px width, full viewport height, white, right border #E5E7EB):

Top section (padding 24px):
- Logo: "Prism DeFi Labs" (20px, bold, #48104a)
- Subtitle: "DeFi Yield Simulator" (14px, #6B7280)

Divider: 1px line #E5E7EB, margin 24px vertical

Navigation (padding 16px horizontal):
- 4 nav items, vertical stack, 8px gap
- Each item: rounded 12px, padding 16px, icon + label
- Active: background #f5f0f5, text #48104a
- Inactive: text #6B7280, hover background #F5F5F5

Nav items:
1. ETH icon + "ETH Products"
2. Coins icon + "Stablecoin Products"
3. Shield icon + "Hedge"
4. Calculator icon + "Results"

Bottom section (padding 24px, stick to bottom):
- Language toggle: "EN | KR" segmented control
- Active segment: background #F3F4F6, text #1A1A1A
- Inactive segment: text #6B7280

---

GLOBAL CONTROLS (top of content area, white background, bottom border #E5E7EB):
- Flush against sidebar (no left gap)
- 16px gap BETWEEN the two widget cards
- Padding inside widgets: 24px top/bottom, 24px horizontal

LEFT WIDGET - Portfolio Allocation (~65% width):
- White card, NO border, subtle shadow (0px 1px 2px rgba(0,0,0,0.05))
- Header: "Portfolio Allocation" (16px, semibold) + "Reset" link (14px, #6B7280)
- Two controls side by side:
  - Investment Amount input with "$" prefix
  - 3-segment slider (ETH purple #48104a | Stable #E5E7EB | Hedge #6B7280)
- Labels below slider with amounts

RIGHT WIDGET - ETH Price (~35% width):
- White card, NO border, subtle shadow (0px 1px 2px rgba(0,0,0,0.05))
- Header: "ETH Price" (16px, semibold) + "Reset" link
- Two controls: Price input ($) + Scenario input (%)
- "Fetch" link below price, projected price below scenario

---

CONTENT AREA:
- Background: #FAFAFA
- Padding: 32px
- Placeholder text: "Content Area"

---

VISUAL NOTES:
- The two control widgets are visually separated by the 16px gap
- Bottom border on controls area creates clear separation from content
- Sidebar and controls feel unified (flush, no gap between them)
- Subtle shadows on widget cards for depth
- All interactive elements have hover states
```

---

## Prompt 2: ETH Products Tab

```
Design the "ETH Products" tab content for a DeFi Yield Simulator. This page allows users to select and allocate weights to ETH-based yield products.

DESIGN STYLE:
- Robinhood-inspired: clean, spacious, modern fintech
- Light mode, generous whitespace
- Large bold numbers
- Rounded cards (16px), soft shadows
- Professional but approachable

COLOR PALETTE:
- Primary: Deep Purple #48104a
- Background: #FAFAFA
- Surface/Cards: #FFFFFF
- Inner Cards: #F5F5F5
- Text Primary: #1A1A1A
- Text Secondary: #6B7280
- Border: #E5E7EB
- Success: #2D6B4F

---

OUTER CONTAINER:
- White card wrapping ALL content (title, badge, progress bar, product list)
- Border-radius: 16px
- Shadow: 0px 1px 2px rgba(0,0,0,0.05)
- Padding: 32px

---

HEADER (inside white card):
- Title: "ETH Products" (24px, bold)
- Subtitle: "Select products and allocate weights" (14px, gray)
- Right side: Total allocation badge "Total: $600,000" (large, bold, purple background #48104a, white text, pill shape)

---

ALLOCATION PROGRESS BAR (below header):
- Full width rounded bar (8px height)
- Shows allocation progress toward 100%
- Filled portion: purple (#48104a)
- Unfilled: light gray (#E5E7EB)
- Right side label: "75% allocated" or "100% ✓" (green #2D6B4F when complete)

---

PRODUCT LIST (vertical stack of cards):
- Each product is a light gray card (#F5F5F5) since it's inside white container
- Card border-radius: 16px
- Card padding: 24px
- Card height: 92px
- Gap between cards: 16px

PRODUCT CARD LAYOUT (horizontal, space-between):

Left section (flex, align center, gap 16px):
- Checkbox: Large rounded checkbox (24px), purple when checked
- Logos: Two overlapping circles (32px each)
  - Back: Protocol logo (e.g., Lido)
  - Front: Token logo (e.g., stETH), offset right and down
- Product info (vertical stack):
  - Product name: "stETH" (16px, semibold)
  - Protocol: "Lido" (14px, gray)

Middle section:
- APY display in a rounded pill (light green background #E8F5E9)
- "2.65% APY" (16px, semibold, green text #2D6B4F)
- Small green dot indicator for live data

Right section (flex, align center, gap 16px):
- Weight input:
  - Rounded input field (80px width)
  - Light background, border #E5E7EB
  - "%" suffix inside
  - Value: "50"
  - Disabled (grayed out) if product not selected
- Leverage button (only for eligible products: stETH, weETH):
  - If no leverage: "Leverage" button (outline border #48104a, text #48104a)
  - If leverage active: Gold/amber pill (#fef9e6 bg, #d4a84b border, #8b6914 text) showing "60% LTV · $36k"
  - For non-eligible products: Show "—" in gray

---

PRODUCT LIST ITEMS (4 products):

1. Lido stETH - 2.65% APY - Leverage eligible
2. Ether.fi weETH - 3.17% APY - Leverage eligible
3. Pendle PT-wstETH - 2.90% APY - No leverage
4. Pendle PT-weETH - 2.70% APY - No leverage

---

VISUAL NOTES:
- Entire content wrapped in white card container
- Product cards are light gray (#F5F5F5) inside white container
- Selected products have 4px left border in purple (#48104a)
- Unselected products have 60% opacity
- Weight inputs only enabled when product is checked
- Smooth transitions on all interactions
```

---

## Prompt 3: Stablecoin Products Tab

```
Design the "Stablecoin Products" tab content for a DeFi Yield Simulator. This page shows base stablecoin allocation and any leveraged funds deployed from ETH collateral.

NEW LAYOUT CONTEXT:
- Full-height sidebar (240px) on the left containing logo, nav, and language toggle
- NO separate header bar - branding is in sidebar
- Global controls (Portfolio Allocation + ETH Price widgets) at top of content area
- 16px gap between the two control widgets
- Content area has #FAFAFA background with 32px padding

DESIGN STYLE:
- Robinhood-inspired: clean, spacious, modern fintech
- Light mode, generous whitespace
- Large bold numbers
- Rounded cards (16px), soft shadows

COLOR PALETTE:
- Primary: Deep Purple #48104a
- Background: #FAFAFA
- Surface/Cards: #FFFFFF
- Inner Cards: #F5F5F5
- Text Primary: #1A1A1A
- Text Secondary: #6B7280
- Border: #E5E7EB
- Success: #2D6B4F

---

STRUCTURE - THREE SEPARATE WHITE CARDS:

CARD 1: BASE ALLOCATION
- White container (#FFFFFF)
- Border-radius: 16px
- Shadow: 0px 1px 2px rgba(0,0,0,0.05) - subtle, NOT thick
- Padding: 32px
- Contains:
  - Header: "Stablecoin Products" title (24px, bold) + "Total: $400,000" purple pill badge
  - Subtitle: "Select products and allocate weights" (14px, gray)
  - "Base Allocation" section label (18px, semibold) with progress bar
  - Progress bar: Full width, 8px height, rounded, purple filled (#48104a), gray unfilled (#E5E7EB)
  - Right side of progress: "80% allocated" or "100% ✓" (green #2D6B4F when complete)
  - Product list (light gray cards #F5F5F5)

Product cards inside Card 1:
- Light gray background (#F5F5F5)
- Border-radius: 16px
- Padding: 24px
- Height: 92px
- Gap between cards: 16px
- Layout: checkbox, dual logos, product name, APY pill, weight input
- Selected: 4px left border in purple (#48104a), full opacity
- Unselected: 60% opacity, no left border accent

PRODUCTS (8 items, scrollable if needed):
1. Aave V3 USDC - 3.4% APY
2. Morpho steakUSDC - 4.0% APY
3. Morpho GTUSDC - 4.5% APY
4. Morpho BBQUSDC - 7.2% APY
5. Ethena sUSDe - 4.9% APY
6. Maple Syrup USDC - 6.8% APY
7. Pendle PT-sUSDe - 5.9% APY
8. Pendle PT-syrupUSDC - 6.5% APY

---

CARD 2: LEVERAGED FUNDS (only visible if leverage active)
- White container (#FFFFFF)
- Border-radius: 16px
- Shadow: 0px 1px 2px rgba(0,0,0,0.05) - subtle, NOT thick
- Padding: 32px
- Margin-top: 16px gap from Card 1
- Contains:
  - "Leveraged Funds" header (18px, semibold) with "$60,000 borrowed" badge (purple outline pill)
  - Right side: "100% deployed ✓"
  - Explanation text: "These funds are borrowed against your ETH collateral and deployed to stablecoin products." (small, gray)
  - Deployed funds display (read-only cards)
- KEEP existing gradient styling for leveraged items

Deployed funds cards:
- Light gray card (#F5F5F5) with subtle purple left border (4px #48104a)
- Shows: Product name + Amount deployed + APY
- Example: "Maple Syrup USDC · $60,000 · 6.8% APY"

---

CARD 3: SUMMARY BAR
- White container (#FFFFFF)
- Border-radius: 16px
- Shadow: 0px 1px 2px rgba(0,0,0,0.05) - subtle, NOT thick
- Padding: 24px
- Margin-top: 16px gap from previous card
- Contains:
  - "Total Stablecoin Exposure" label
  - Large number: "$460,000" (24px, bold)
  - Breakdown: "$400,000 base + $60,000 leveraged" (14px, gray)

---

VISUAL NOTES:
- All three cards have the SAME subtle shadow - no thick shadows
- 16px vertical gap between each card
- Product cards are light gray (#F5F5F5) inside white container
- Selected products have 4px left border in purple (#48104a)
- Unselected products have 60% opacity
- Base allocation section always visible
- Leveraged section only appears when leverage is configured in ETH tab
- Keep existing gradient styling in Leveraged Funds section
- Clear visual distinction between base and leveraged sections
```

---

## Prompt 4: Hedge Tab

```
Design the "Hedge" tab content for a DeFi Yield Simulator. This page allows users to configure the leverage multiplier for their ETH short hedge using Hyperliquid perpetuals.

NOTE: The hedge allocation percentage is already set in the global Portfolio Allocation widget (the 3-segment slider: ETH | Stablecoin | Hedge). This tab only configures HOW the hedge operates, not how much is allocated.

NEW LAYOUT CONTEXT:
- Full-height sidebar (240px) on the left containing logo, nav, and language toggle
- NO separate header bar - branding is in sidebar
- Global controls (Portfolio Allocation + ETH Price widgets) at top of content area
- 16px gap between the two control widgets
- Content area has #FAFAFA background with 32px padding

DESIGN STYLE:
- Robinhood-inspired: clean, spacious, modern fintech
- Light mode, generous whitespace
- Large bold numbers
- Rounded cards (16px), soft shadows

COLOR PALETTE:
- Primary: Deep Purple #48104a
- Background: #FAFAFA
- Surface/Cards: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #6B7280
- Border: #E5E7EB
- Success: #2D6B4F
- Warning: #B8860B

---

STRUCTURE - THREE SEPARATE WHITE CARDS:

CARD 1: HEDGE CONFIGURATION
- White container (#FFFFFF)
- Border-radius: 16px
- Shadow: 0px 1px 2px rgba(0,0,0,0.05) - subtle, NOT thick
- Padding: 32px
- Contains:
  - Header: "ETH Hedge" title (24px, bold) + "Hedge: $80,000" purple pill badge (read-only, from global controls)
  - Subtitle: "Configure your Hyperliquid perpetual short position" (14px, gray)
  - Fund Allocation slider (0-100%)
  - Leverage Multiplier slider with tick marks (1x, 2x, 5x, 10x, 25x)

SLIDER STYLE (applies to all sliders):
- Track filled portion: Deep Purple #48104a
- Track unfilled portion: Light Gray #E5E7EB
- Thumb/handle: White circle with purple border (#48104a) and subtle shadow
- Height: 8px, rounded

Fund Allocation Slider:
- Label row: "Fund Allocation" (14px, semibold, left) + "80%" (14px, semibold, right)
- Slider: 0% to 100%
- Below slider: "$64,000 deployed of $80,000" (14px, gray)
- Helper text: "Percentage of hedge funds to deploy as margin" (12px, gray)

Leverage Selector:
- Label row: "Leverage Multiplier" (14px, semibold, left) + "10x" (14px, semibold, right)
- Slider with tick marks at: 1x, 2x, 5x, 10x, 25x
- Tick marks: small vertical lines below slider
- Selected tick: highlighted in purple, others in gray
- Helper text: "Higher leverage = larger position, higher risk" (12px, gray)

---

CARD 2: POSITION DETAILS
- White container (#FFFFFF)
- Border-radius: 16px
- Shadow: 0px 1px 2px rgba(0,0,0,0.05) - subtle, NOT thick
- Padding: 32px
- Margin-top: 16px gap from Card 1
- Contains:
  - "Position Details" header (16px, semibold)
  - Light purple background (#f9f7fa) for inner content area, rounded 12px, padding 24px
  - Three columns, evenly spaced:

Column 1 - Collateral:
- Label: "Collateral" (12px, gray)
- Value: "$80,000" (28px, bold)
- Subtext: "From hedge allocation"

Column 2 - Short Position:
- Label: "Short Position" (12px, gray)
- Value: "$800,000" (28px, bold)
- Subtext: "10x leverage"

Column 3 - Hedge Coverage:
- Label: "ETH Hedged" (12px, gray)
- Value: "133%" (28px, bold, green if >= 100%)
- Subtext: "of $600,000 ETH exposure"

---

CARD 3: FUNDING RATE
- White container (#FFFFFF)
- Border-radius: 16px
- Shadow: 0px 1px 2px rgba(0,0,0,0.05) - subtle, NOT thick
- Padding: 32px
- Margin-top: 16px gap from Card 2
- Green left border (4px #2D6B4F) to indicate positive income
- Contains:
  - Left side:
    - Label: "Est. Funding Rate" (12px, gray)
    - Value: "+12.4% APY" (24px, bold, green #2D6B4F)
    - Subtext: "Paid to shorts (you earn this)"
  - Right side:
    - Label: "Annual Funding Income" (12px, gray)
    - Value: "+$9,920" (24px, bold, green #2D6B4F)
    - Subtext: "Based on current rate"
  - Live indicator dot with green pulse animation
  - "Refresh" link (purple text, 12px)

---

OPTIONAL: INFO CARD (collapsible)
- White container (#FFFFFF)
- Border-radius: 16px
- Shadow: 0px 1px 2px rgba(0,0,0,0.05) - subtle
- Padding: 24px
- Margin-top: 16px
- Collapsed by default
- Header: Info icon + "How ETH Hedging Works" (14px, semibold) + Chevron
- Expanded content (14px, gray, line-height 1.6):
  - "Opening a short position on Hyperliquid offsets your ETH price exposure."
  - "If ETH price drops, your short profits, compensating for losses in ETH holdings."
  - "You earn funding rate when it's positive (longs pay shorts)."
  - "Risk: If ETH rises sharply, the short position loses money."

---

EMPTY STATE (when hedge allocation is 0% in global controls):
- Single centered card
- Shield icon with slash
- Title: "No Hedge Allocation" (18px, semibold)
- Subtitle: "Adjust the hedge slider in Portfolio Allocation to enable hedging" (14px, gray)

---

VISUAL NOTES:
- All cards have the SAME subtle shadow - no thick shadows
- 16px vertical gap between each card
- Sliders are large and easy to drag
- Position summary updates in real-time as leverage changes
- Funding rate has live indicator to show it's real data
- Green accent (#2D6B4F) for positive funding rate values
- Clear visual hierarchy: configuration → position details → funding income
- Info card is subtle, doesn't distract from main configuration
```

---

## Prompt 5: Results Tab

```
Update the "Results" tab to match the new layout and card hierarchy:

NEW LAYOUT CONTEXT:
- Full-height sidebar (240px) on the left containing logo, nav, and language toggle
- NO separate header bar - branding is in sidebar
- Global controls (Portfolio Allocation + ETH Price widgets) at top of content area
- 16px gap between the two control widgets
- Content area has #FAFAFA background with 32px padding

DESIGN STYLE:
- Robinhood-inspired: clean, spacious, modern fintech
- Light mode, generous whitespace
- Large bold hero numbers
- Rounded cards (16px), soft shadows
- Charts are clean and minimal

COLOR PALETTE:
- Primary: Deep Purple #48104a
- Background: #FAFAFA
- Surface/Cards: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #6B7280
- Success: #2D6B4F
- Danger: #8B0000
- Warning: #B8860B
- Chart colors: Purple #48104a, Light Purple #9B6B9B, Green #2D6B4F, Gray #6B7280

---

STRUCTURE - SEPARATE WHITE CARDS (no page header title):

NOTE: Remove "Portfolio Results" title and subtitle. The sidebar already indicates which tab is active, so the title is redundant. Jump straight into the content cards.

---

CARD 1: EXPECTED BALANCE (full width)
- White container (#FFFFFF)
- Border-radius: 16px
- Shadow: 0px 1px 2px rgba(0,0,0,0.05) - subtle, NOT thick
- Padding: 32px
- Contains:
  - Left side:
    - Label: "Expected Balance" (14px, gray)
    - Value: "$1,080,690" (56px, bold, purple) - largest hero number
    - Subtext: "After 1 year" (14px, gray)
  - Right side (breakdown):
    - "ETH: 176.5 → 181.2 (+4.7 ETH)" with change in green/red
    - "→ $677,280" (USD value)
    - "USD: $400,000 → $433,220 (+$33,220)" with change in green/red

---

CARD 2: TOTAL RETURN + APY (two cards side by side, 16px gap)
- Margin-top: 16px from Card 1

LEFT - Total Return (~60% width):
- White container, rounded 16px, subtle shadow, padding 32px
- Label: "Total Return" (14px, gray)
- Value: "+$80,690 (+8.1%)" (42px, bold, green #2D6B4F)
- Subtext: "Including +10% ETH scenario" (12px, gray)

RIGHT - Portfolio APY (~40% width):
- White container, rounded 16px, subtle shadow, padding 32px
- Label: "Portfolio APY" (14px, gray)
- Value: "4.12%" (42px, bold, purple)
- Subtext: "Blended yield rate" (12px, gray)
- Breakdown: "ETH: 2.91%" and "Stablecoin: 5.82%" (14px, gray)

---

CARD 3: RISK METRICS (only if leverage active)
- White container (#FFFFFF)
- Border-radius: 16px
- Shadow: 0px 1px 2px rgba(0,0,0,0.05) - subtle
- Padding: 32px
- Margin-top: 16px
- Title: "Risk Metrics" (16px, semibold)
- Two sections side by side:
  - Left: Health Factor "1.56" with "Safe" status (color-coded text, NO gauge)
  - Right: Liquidation Price "$2,176" with "-36% from current ($3,400)"

---

CARD 4: RETURN BREAKDOWN
- White container (#FFFFFF)
- Border-radius: 16px
- Shadow: 0px 1px 2px rgba(0,0,0,0.05) - subtle
- Padding: 32px
- Margin-top: 16px
- Title: "Return Breakdown" (18px, semibold)
- Subtitle: "Click each category to see per-product details" (12px, gray)

Table layout with expandable/collapsible rows:

| Category                  | Amount              |
|---------------------------|---------------------|
| ETH Yield             [▴] | +0.27 ETH ($900)    |  ← EXPANDED
|   └ stETH                 | +0.15 ETH ($500)    |
|   └ weETH                 | +0.12 ETH ($400)    |
| ETH Price Impact (+10%)   | +$60,090            |  ← collapsed
| Stablecoin Yield      [▾] | +$17,000            |  ← collapsed
| Leverage Net          [▴] | +$780               |  ← EXPANDED
|   └ weETH → Maple USDC    | +$4,080 yield       |
|   └ Borrow cost           | -$3,300             |
|   Net                     | +$780               |
| Hedge Net             [▾] | +$1,920             |  ← collapsed
|---------------------------|---------------------|
| **Total Return**          | **+$80,690**        |

Row styling:
- Each row: flex between, padding 12px 0, border-bottom light gray
- Category name: 14px, semibold
- Amount: 14px, tabular-nums, color-coded (green positive, red negative)
- Expanded rows: indented with └, lighter text, background #FAFAFA
- ETH amounts: "0.27 ETH ($900)" format - ETH in purple, USD in gray

---

CARD 5: ALLOCATION BY CATEGORY
- White container (#FFFFFF)
- Border-radius: 16px
- Shadow: 0px 1px 2px rgba(0,0,0,0.05) - subtle
- Padding: 32px
- Margin-top: 16px
- Two columns (50/50 split):

LEFT - Pie Chart:
- Title: "Allocation by Category" (16px, semibold)
- Donut chart with 3 segments:
  - ETH: purple #48104a (60%)
  - Stablecoin: light purple #9B6B9B (32%)
  - Hedge: gray #6B7280 (8%)
- Selected segment: full opacity, slightly pulled out
- Unselected segments: 50% opacity
- Legend below: colored dots with labels

RIGHT - Category Breakdown:
- Title: "ETH Breakdown" (dynamic based on selected segment)
- Table: Logo + Name | Allocation % | Amount
- Example: "stETH | 60% | 105.9 ETH ($360,000)"

INTERACTION:
- Click pie segment → right side updates to show that category's breakdown

---

FIX: PIE CHART NOT RENDERING PROPERLY

The pie chart must be implemented correctly:

1. Use SVG with explicit dimensions (e.g., width="200" height="200")
2. Calculate arc paths properly using:
   - Start angle and end angle for each segment
   - Use path commands: M (move), A (arc), L (line)
3. For donut effect: use two arcs (outer and inner radius) or stroke-width on circle
4. Add small gaps between segments (2-3 degree offset)
5. Selected segment transform: translate slightly outward from center
6. Ensure viewBox is set correctly to prevent clipping

Example SVG structure:
```svg
<svg viewBox="0 0 200 200" width="200" height="200">
  <g transform="translate(100, 100)">
    <!-- Each segment as a path with proper arc calculation -->
    <path d="..." fill="#48104a" opacity="1" transform="translate(5, 0)" />
    <path d="..." fill="#9B6B9B" opacity="0.5" />
    <path d="..." fill="#6B7280" opacity="0.5" />
  </g>
</svg>
```

Do NOT leave empty white space where the chart should appear.

---

VISUAL NOTES:
- All cards have the SAME subtle shadow - no thick shadows
- 16px vertical gap between each card
- NO "Portfolio Results" page title - content starts immediately with cards
- Pie chart MUST be visible and properly rendered as a donut chart
- Numbers formatted with commas and appropriate decimals
- ETH amounts: show ETH unit first, then USD in parentheses
- Color coding: green for positive, red for negative, purple for ETH amounts
```

---

## Prompt 6: Leverage Configuration Modal

```
Design a Leverage Configuration Modal for the DeFi Yield Simulator. This modal appears when user clicks "Leverage" button on an ETH product.

DESIGN STYLE:
- Robinhood-inspired: clean, spacious, modern fintech
- Modal with semi-transparent dark backdrop
- Rounded corners (20px)
- Generous padding and spacing

COLOR PALETTE:
- Primary: Deep Purple #48104a
- Surface: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #6B7280
- Success: #2D6B4F
- Warning: #B8860B
- Danger: #8B0000

---

MODAL CONTAINER:
- Centered on screen
- Width: 480px
- White background, rounded 20px
- Padding: 32px
- Subtle drop shadow
- Backdrop: black at 50% opacity

---

MODAL HEADER:
- Title: "Configure Leverage" (24px, bold)
- Subtitle: "weETH · $240,000 position" (16px, gray)
- Close button (X) in top right corner (gray, hover: black)

---

FORM SECTIONS (vertical stack, 32px gap):

SECTION 1 - COLLATERAL AMOUNT:
- Label: "Collateral Percentage" (14px, semibold)
- Slider: 0% to 100%
- Slider track: gray, filled portion purple
- Thumb: white circle with shadow
- Value display: "50%" (right side of slider)
- Below: "Using $120,000 as collateral" (14px, gray)

SECTION 2 - LOAN-TO-VALUE:
- Label: "Loan-to-Value (LTV)" (14px, semibold)
- Helper: "Max 75% for weETH" (12px, gray)
- Slider: 0% to 75%
- Slider zones (visual background):
  - 0-50%: subtle green tint
  - 50-65%: subtle amber tint
  - 65-75%: subtle red tint
- Value display: "60%"
- Below: "Borrowing $72,000" (14px, gray)

SECTION 3 - BORROW ASSET:
- Label: "Borrow Asset" (14px, semibold)
- Two pill buttons side by side:
  - "USDC" (selected: purple bg, white text)
  - "USDe" (unselected: gray outline)
- Below selected: "Borrow rate: ~4.7% APY" (14px, gray)

SECTION 4 - DEPLOY TO:
- Label: "Deploy Borrowed Funds To" (14px, semibold)
- Dropdown select (full width):
  - Rounded border, gray
  - Selected: "Maple Syrup USDC - 6.8% APY"
  - Dropdown shows list of stablecoin products with APYs

---

IMPACT SUMMARY CARD (highlighted):
- Background: light purple (#f9f7fa)
- Rounded 12px
- Padding: 20px
- Title: "Leverage Impact" (16px, semibold)

Two rows of metrics:

Row 1:
- "Borrowed" → "$72,000"
- "Net Spread" → "+2.1%" (green, deploy APY minus borrow rate)
- "Annual Boost" → "+$1,512" (green)

Row 2:
- "Health Factor" → "1.56" (green badge if >1.5)
- "Liquidation Price" → "$2,176 (-36%)" (amber text)

---

MODAL FOOTER:
- Left: "Remove Leverage" link (red text, only if editing existing)
- Right: Two buttons
  - "Cancel" (outline, gray)
  - "Apply" (solid purple)

---

VISUAL NOTES:
- Sliders are large and easy to drag
- Real-time updates as user adjusts sliders
- Color-coded risk zones on LTV slider
- Impact summary updates live
- Clean transitions and hover states
- Modal is scrollable if content exceeds viewport
```

---

## Usage Instructions

1. **Prompt 1**: Generate the global layout shell (header, controls bar, sidebar, content area)
2. **Prompt 2**: Generate the ETH Products tab content
3. **Prompt 3**: Generate the Stablecoin Products tab content
4. **Prompt 4**: Generate the Hedge tab content
5. **Prompt 5**: Generate the Results tab content
6. **Prompt 6**: Generate the Leverage Configuration modal

Each prompt builds on the same design system for visual consistency. Generate in order, then combine into a cohesive application.
