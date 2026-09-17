# CHRONO — design contract

Mobile clock prototype. Reference: IU_2.pdf pp.87–99, especially visible construction (88), outlines and hard shadows (96), crude illustrations (97), usability caveats (99). Negative reference is explicitly not a layout template.

Three materials: exposed square-cell pixels on black for world clocks; irregular warm paper with marker hourglass; typographic stopwatch revealed through torn black holes. One continuous mirrored L: right vertical arm and substantial lower arm. Approximately square upper-left clock void. No dashboard cards or additional features.

Palette: #050505 ink, #F3F0E6 paper, #F7F7F2 text, #00E5FF digital accent, #FFE500 selection/completion, #39FF14 running only. No gradients, blur or glow. JetBrains Mono for values and UI, Impact for short display typography. 3px outlines and 5px hard shadows where functional cards exist. Torn holes deliberately exempt from rectangular frames.

Timer: remaining output, editable total MM:SS, start/reset at hourglass throat, timestamp-derived countdown and sand. Stopwatch: elapsed time, reset, start/pause/resume; no laps. World clocks: true timezone hands, two columns, main selection, add/search, multiple deletion with minus badges and transformed action tiles. Protect final remaining city. Persist cities and main selection.

44px minimum targets; keyboard focus; reduced motion; no hover-only information. Home fits 360×800, 375×812, 390×844, 430×932. At text enlargement allow vertical scrolling instead of clipping. Desktop retains mobile composition. Verify render twice, interactions, timer completion, paused stopwatch, persistence, navigation and overflow.

Local frontend only; no publishing required. Original SVG paper and hourglass, transparent gaps in SVG pixel renderer. No invented calendar, presets, telemetry or navigation bar.

## User revision — saturated digital edition
The later user request supersedes the original analog-only and warm-white/black-cutout palette rules. World clocks are now genuine pixel-matrix DIGITAL HH / MM displays. Each city deterministically receives one of six vivid palettes (yellow, green, red, cyan, orange, pink); its identity persists across navigation. A visible MAIN badge and heavy external outline identify selection independently of theme. Green is no longer exclusive to running state.

The paper is saturated pink (#ff5286), while the stopwatch hole exposes a cobalt blue layer (#2038c5). CHRONO is yellow, angled upward toward the left. The handmade hourglass and its two value cards span 92% of screen height along the right arm. These requested changes retain flat colors, hard contrast, exposed square-cell construction, thick outlines and unblurred shadows. Palette combinations are intentionally controlled rather than randomly generated RGB colors.

## User revision — aligned composition
The stopwatch opening center now follows the actual hourglass throat center through ResizeObserver geometry, including viewport changes. Its RESET and START/PAUSE controls are vertically stacked underneath with full touch targets. This fills the left lower arm while preserving a small intentional separation between objects.

## Semantic interaction palette
- Cyan #00e5ff: actionable buttons, editable TOTAL, city search, selected-city marker and focus feedback. Buttons retain their cyan surface across start/reset/pause/resume states.
- Green #39ff14: currently running numeric outputs only within timer/stopwatch; never a button-state substitution.
- Yellow #ffe500: resting time outputs, CHRONO title and timer completion notice; never an action control.
- Pink: paper and locked TOTAL, with visible LOCK label. Blue: stopwatch cutout.
- City theme colors encode city identity only, not operational state. The cyan MAIN marker and outline communicate selection independently of that identity. Digit colors remain theme-specific as requested.
Color is paired with text, disabled semantics, outlines and pressed displacement. Palette consistency does not depend on hover.

## Latest control refinement
Each normal city tile has a separate accessible minus button entering deletion mode. Those badges disappear in deletion mode: tapping a city then toggles selection. Selected tiles invert their own ink/background palette and show upright REMOVE letters in a narrow central strip. Confirmation still batches deletion; cancel discards the selection. The header back control is a torn blue shape with a cyan non-pixel arrow. Stopwatch control holes share the main cobalt material and contain cyan inset action cards. CHRONO follows an actual circular SVG text path along the upper-left arc.

## Approved strategy implemented
Paper reaches all exterior screen edges, with tearing restricted to the inner world-clock boundary and stopwatch cutouts. Timer controls are yellow rectangular paper labels; REMAINING is unframed black text directly on pink paper. Stopwatch controls use cyan clipped octagonal tokens inside cobalt holes. Neutral arrow-shaped navigation is separate from both families. CHRONO returns to straight diagonal lettering. Minus badges move to top-right and MAIN is placed by the city name.

Timer now has idle/running/paused/finished states. START becomes PAUSE; pausing freezes remaining time and sand, locks TOTAL, and reveals a smaller neutral RESET tab beneath CONTINUE. Continue resumes the stored duration; reset restores the configured total. The primary button stays yellow across states. Reset reveal does not change layout; reduced-motion suppresses animation.

## Responsive world-clock containment
The complete home world-clock group is constrained to the height of the black opening. The pixel SVG scales within the remaining space after reserving the city and GMT caption heights. This prevents wide/short viewports from pushing captions onto the paper; caption typography stays readable.

## Timer motion refinement
RESET remains mounted and retracts 54px behind the primary button over 160ms before visibility is removed. It is immediately disabled and removed from keyboard/accessibility interaction while closing; reset returns focus to the primary control. Reduced motion removes the transition.

The falling grain stream repeats at a fixed speed through a clip extending from the throat to the current mound tip. Both the mound and stream endpoint derive from the same pileTop value (280 - progress * 100), so grains reach the growing surface without falling through it. The stream is removed on pause/completion; the mound remains as progress evidence.

## TOTAL stamp transition
Running/paused TOTAL now renders a semantic output rather than a disabled input. Its paper frame lifts off in a dry 180ms sequence; resetting stamps the yellow editable card back down in 210ms, with a short hard-shadow compression. Content and frame are separate layers with stable reserved height. No blur, springs or layout shift. Reduced motion directly switches the surface without animation.

## Discrete time-weighted sand
Sand now consists of conserved, individually rendered grains with deterministic positions and timestamp-based trajectories. Each grain moves from its upper position through the throat and settles into a growing lower pile. It is never duplicated across chambers. Below 30 seconds each grain represents a fraction of a second; 30–180 seconds uses one grain per second; longer timers use a bounded multiple. Maximum 180 grains; the final grain accounts for any remainder. Pause freezes all trajectories; reset restores every grain. Reduced motion uses discrete transfers with no continuous flight.

## Stopwatch reset reveal
RESET exists only as an available action while the stopwatch is paused (not idle or running). Its reserved slot avoids layout movement, but the complete hole is clipped away when closed so the original textured paper is exposed. Opening first reveals the cobalt cutout over 140ms, then reuses the TOTAL stamp animation for the cyan token. Closing crops the entire hole and token into the paper over 180ms. Hidden controls are disabled and excluded from keyboard and accessibility navigation. Reset restores focus to START; reduced motion switches instantly.

## Split-token exit
The stopwatch RESET exit replaces the previous crop with two jagged cyan token halves falling apart for 400ms, while the cobalt opening closes behind them in 180ms. The opening/stamp entrance remains. Exit fragments are decorative and never interactive; reopening cancels the fragment sequence. Reduced motion removes the fragments and closes immediately.

The stopwatch reset opening now contracts uniformly toward its center (both axes), keeping the torn perimeter as it closes. Fragment trajectories remain independent of the radial closure.

## Gravity-driven sand
Replaced interpolated grain paths with a lightweight 2D particle solver in src/sand.ts: gravity, wall/floor constraints, damped motion and iterative grain-grain contact resolution. The timed gate chooses the unreleased grain nearest the throat, so the remaining upper grains settle into the vacated space. Rendering uses round non-scaling dots rather than diagonal strokes. Particle count/time weighting remains bounded and adaptive. Pausing freezes the simulation; final in-flight grains settle naturally after zero. This is an approximate visual simulation, not a precision granular-material model. Reduced-motion mode uses stationary chamber indicators.

## Correction: reset animation ownership
The split-and-fall exit belongs to the TIMER RESET card, including on resume or reset. The STOPWATCH RESET returns to radial contraction of its complete cobalt hole and cyan token, without fragments; its opening/stamp sequence is retained.

## Masked TOTAL editing
TOTAL selects all on focus/click. Its controlled numeric mask always retains a colon, even after select-all deletion, and routes the first two digits to minutes and the next two to seconds. Typing 1234 yields 12:34; typing over a selection replaces digits without requiring punctuation. Backspace/Delete around the separator operate on adjacent digits. Blur pads incomplete fields and preserves existing invalid/zero fallback behavior.

## Final clarification of animation ownership
TOTAL is the only card that splits into two falling fragments when locking into plain text. Its editable entrance retains the stamp. TIMER RESET returns to sliding beneath the primary button. STOPWATCH RESET keeps its radial hole closure and stamp entrance, without fragments.

## Fixed-width TOTAL mask
All four digit positions persist throughout editing: clearing a selection or deleting a digit writes zeros into those slots rather than removing characters. Typing overwrites slots and skips the colon automatically. Keyboard, beforeinput/mobile and paste paths share the same positional edit handler. Clearing everything remains 00:00 even on blur; it no longer resets to 05:00. Seconds above 59 are capped on blur.

Seconds overflow now carries into minutes on blur (01:75 -> 02:15), rather than clamping the seconds field. The fixed two-digit minute format caps the total at 99:59.

## Continue reset-retraction hotfix
When the timer is paused, pressing CONTINUE starts retracting the RESET tab on pointer-down instead of waiting for the resume state update. Retraction is component state, so unrelated timer renders cannot reopen the tab between pointer-down and click. The countdown still resumes on normal activation, preserving keyboard semantics while pointer input receives immediate visual feedback.

## Continue reset motion isolation
CONTINUE now stops its pointer-down event before it reaches the hourglass wobble handler. RESET still begins retracting on pointer-down, but its 160ms slide no longer rides inside the 230ms parent rotation, eliminating the mid-motion micro-stutter. START, PAUSE, direct hourglass presses, and RESET retain their existing tactile wobble behavior.
