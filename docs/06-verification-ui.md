# 06 - The verification screen

This is the screen where the user spends their time. Everything else in the
system exists to make this one fast. The preset editor is described at the end,
because a preset is what the verification screen depends on.

**The headline number: seconds per page. Target — under 10.**

On a 300-page document every extra second costs 5 minutes of human time.

---

## Layout

```
┌────────────────────────────────────────────────────────────────────┐
│ Parish register, 1887     ●●●○○○○○○○  47 / 300      $0.98 / $10.00 │
├──────────────────────────────┬─────────────────────────────────────┤
│                              │                                     │
│                              │  No. 15. Born on 11 January,        │
│                              │  Anna. Parents: peasant of          │
│         PAGE IMAGE           │  ‹Dykanka› village, Petr            │
│                              │  ‹Ivanenko› and his lawful wife     │
│      wheel — zoom            │  Maria, both Orthodox.              │
│      drag — pan              │                                     │
│                              │  ‹word› — suggested by the context  │
│                              │                                     │
├──────────────────────────────┴─────────────────────────────────────┤
│  [✓ Correct]  [✎ Edit]  [↷ Skip]                                   │
│                                                                     │
│  ◄ 44  45  46 [47] 48  49  50 ►     ▓ ready  ░ running  · queued   │
└────────────────────────────────────────────────────────────────────┘
```

Three zones:

| Zone               | Role                                                     |
| ------------------ | -------------------------------------------------------- |
| Left — the image   | The source of truth. Must be large and zoom instantly    |
| Right — the text   | What is being checked                                    |
| Bottom — the strip | Where I am in the document and what the system has ready |

The splitter can be dragged and its position is remembered: dense cursive needs
more room for the image, sprawling text needs more room for the text.

---

## Highlighting context words

This is not cosmetics but a defence against the main danger of the system.

```
   ...Dykanka village, Petr ‹Ivanenko› and...
                             ˄
                             └─ from the lexicon, seen on 4 pages
```

**Why.** If a mistake gets into the lexicon, the model will start repeating it
confidently and the text will become **more consistent** — that is, it will
look better while being wrong. Noticing this is impossible unless you can see
which words came from the hint.

Highlighted words are the list of places to check first. Everything else can be
skimmed.

The data arrives in the `contextWords` field from the API
([05-api.md](05-api.md#get-apiv1documentsidpagesfrom47limit5)).

---

## Keyboard

The mouse cannot reach the required speed. The keyboard is the primary mode.

### Viewing mode

| Key            | Action                 |
| -------------- | ---------------------- |
| `Enter` or `→` | Correct, next          |
| `←`            | Previous               |
| `E`            | Edit                   |
| `S`            | Skip                   |
| `Ctrl+Z`       | Undo the last action   |
| `Space`        | Zoom the image         |
| `?`            | Show the shortcut list |

### Editing mode

| Key          | Action               |
| ------------ | -------------------- |
| `Ctrl+Enter` | Save and move on     |
| `Esc`        | Leave without saving |

### The trap everyone steps into

The human is typing text, presses `s` — and the system skips the page instead
of printing the letter.

```ts
// apps/frontend/src/features/verify/use-shortcuts.hook.ts

function canHandleShortcut(): boolean {
	const el = document.activeElement;
	if (!el) return true;
	if (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return false;
	if ((el as HTMLElement).isContentEditable) return false;
	return true;
}

useEffect(() => {
	const onKeyUp = (e: KeyboardEvent) => {
		if (!canHandleShortcut()) return;
		if (e.ctrlKey || e.metaKey || e.altKey) return; // leave system combos alone
		handleKey(e.key);
	};
	document.addEventListener("keyup", onKeyUp);
	return () => document.removeEventListener("keyup", onKeyUp);
}, [handleKey]);
```

Two non-obvious points:

- **`keyup`, not `keydown`.** On `keydown` a held key auto-repeats and the
  human accidentally confirms five pages instead of one.
- **Skip `Ctrl`/`Cmd`/`Alt`.** Otherwise `Ctrl+C` fires the "confirm"
  shortcut.

---

## The UI does not wait for the server

Press `Enter` and the next page appears instantly. The request goes out in the
background.

The template has no RTK Query — it has `createAsyncThunk` and plain slices.
There is no request cache, no `updateQueryData` and no ready-made `undo`, so
the optimistic update and the rollback are written by hand inside the slice.

```ts
// apps/frontend/src/modules/pages/slices/actions.ts

const verifyPage = createAsyncThunk<
	VerifyResponseDto,
	VerifyRequestDto,
	AsyncThunkConfig
>(`${sliceName}/verify`, async (payload, { extra, rejectWithValue }) => {
	const { pageApi } = extra; // api classes arrive through extraArgument
	try {
		return await pageApi.verify(payload);
	} catch (error) {
		// BaseHTTPApi has already turned the response into an HTTPError
		// carrying errorType and details
		return rejectWithValue(error as HTTPError);
	}
});
```

```ts
// apps/frontend/src/modules/pages/slices/pages.slice.ts

const { actions, name, reducer } = createSlice({
	name: "pages",
	initialState,
	reducers: {
		// The optimistic step: dispatched BEFORE the thunk, straight from the key
		// handler. We store the previous page state so there is something to undo.
		verifyOptimistic(state, action: PayloadAction<VerifyRequestDto>) {
			const page = state.byId[action.payload.pageId];
			// Everything the optimistic step changes goes in here, or the rollback
			// will restore half the state. It is an object for exactly that reason.
			state.rollback[action.payload.pageId] = {
				cursorPageNo: state.cursorPageNo,
				status: page.status,
			};
			page.status = action.payload.action;
			state.cursorPageNo += 1;
		},
	},
	extraReducers(builder) {
		builder.addCase(verifyPage.fulfilled, (state, { payload }) => {
			delete state.rollback[payload.pageId];
			// the server already sent the next page — no second request
			state.byId[payload.next.pageId] = payload.next;
		});
		builder.addCase(verifyPage.rejected, (state, { meta, payload }) => {
			const { pageId } = meta.arg;
			const previous = state.rollback[pageId];

			state.byId[pageId].status = previous.status;
			state.cursorPageNo = previous.cursorPageNo;
			delete state.rollback[pageId];
			state.dataStatus = DataStatus.REJECTED;
			state.lastError = payload;
		});
	},
});
```

**Two steps, not one.** `verifyOptimistic` is dispatched synchronously with the
keypress; the thunk follows. Put the optimistic update inside the thunk and it
runs a microtask later — during fast `Enter` bursts the UI visibly stutters.

**The `rollback` map has to be maintained by hand.** This is exactly what
`patch.undo()` would give you in RTK Query. Without the saved previous state
there is nowhere to roll back to: `rejected` knows only the thunk's argument,
not what the state held before it.

**Store an object, not a bare status.** The optimistic step changes the page
status _and_ the cursor, so restoring only the status leaves the user one page
further along than the page they verified — and every subsequent failure
compounds it. Keeping the whole snapshot in one entry means the next field
added optimistically cannot be silently forgotten.

**The error code is read from `HTTPError`, not from the response.**
`BaseHTTPApi` parses the body itself and throws an `HTTPError` with `status`,
`errorType` and `details`. Our stable code (`transcription_changed`) is a field
we add to the error envelope; until that exists, a 409 "the text changed"
cannot be told apart from a 409 "out of money". See
[05-api.md](05-api.md#errors) and
[08-template-gaps.md](08-template-gaps.md#4-error-codes-are-too-coarse).

If the internet drops, actions queue up in `localStorage` and are sent when the
connection returns. The UI shows "3 unsaved actions" but **does not block the
work**.

### Replays must not be applied twice

An offline queue means the same `verify` can arrive at the server more than
once — the request went through but the response was lost, and the client
retries. Idempotency here is not automatic and has to be built, because
`updateLexicon` increments counters unconditionally:

```sql
freq = lexicon_entry.freq + 1,
distinct_pages = lexicon_entry.distinct_pages + CASE WHEN … END
```

A second application of the same action inflates `freq` and, worse,
`distinct_pages` — and that is the threshold for entering the context. A word
would reach the prompt without having earned it, which is exactly the poisoning
[03-core-logic.md](03-core-logic.md#6-context-poisoning--the-main-danger)
guards against.

The guard is a unique index on the history table, which is append-only anyway:

```sql
CREATE UNIQUE INDEX page_event_once
  ON page_event (page_id, transcription_id, event)
  WHERE event IN ('confirm', 'correct', 'skip');
```

The handler writes `page_event` **first**, inside the same transaction as the
lexicon update. A replay hits the unique index, the transaction rolls back, and
the endpoint answers `200` with the current page state — the client sees
success and drops the action from its queue.

Both the column and the index are already in
[schema.sql](schema/schema.sql) — `page_event.transcription_id` and
`page_event_once`. The index is partial on purpose: `transcribed` and `failed`
are system events that legitimately repeat on a re-run, so only the three human
actions are constrained.

Answering `200` rather than `409` matters: a replay is not a conflict. The
human did confirm this page against this transcription, and the outcome the
client wants has already been achieved.

### `Ctrl+Z` does not roll back the lexicon

Undo returns the page from `confirmed`/`corrected`/`skipped` to `transcribed`
and clears `verified_by`. It does **not** decrement the lexicon counters, and
that is a decision rather than an omission.

The counters are shared: the word "Ivanenko" may have arrived from five
different pages. `lexicon_entry` stores only the totals, so there is no way to
tell how much of `freq` came from the page being undone. Decrementing blindly
corrupts the count for the other four pages; the alternatives are an extra
occurrences table or recomputing the whole document's lexicon on every undo.

Neither is worth it, because the residual problem is already solved by another
route. If an undone page contributed a wrong word, the way to remove it is the
button that has to exist anyway:

```
POST /api/v1/lexicon/:id/invalidate
```

That is precise — it invalidates exactly one word and re-queues the
unconfirmed pages that saw it — whereas an automatic rollback would guess.

**What this means in the UI.** After `Ctrl+Z` the page is unverified again, but
the highlighted context words on later pages do not change. That is honest: the
model really was given those hints. The only thing the user loses is the
illusion that undo rewinds time.

---

## Prefetch

```
cursor on 47
  ├── images 48, 49, 50 — already in the browser cache
  └── texts  48, 49, 50 — already loaded
```

There is no ready-made `usePrefetch` either — the texts arrive in batches of
five from `GET /documents/:id/pages?from=…&limit=5` anyway, so only the images
are left to preload:

```ts
// apps/frontend/src/pages/verify/libs/hooks/use-prefetch-images.hook.ts

useEffect(() => {
	for (const n of [1, 2, 3]) {
		const page = pages[cursorIndex + n];
		if (!page) continue;
		new Image().src = page.imageUrl; // the browser will cache it
	}
}, [cursorIndex, pages]);
```

When the cursor reaches the end of the loaded batch of five, the slice
dispatches `loadPages({ from: cursorPageNo + 1, limit: 5 })` — an ordinary
thunk, no request cache involved.

Without this the human waits for the image to load on every page, and 8 seconds
turn into 12.

---

## When the system cannot keep up

It will happen: the model slows down, the budget runs out, the internet dies.
The question is not "will it happen" but "what will the human see".

```
┌────────────────────────────────────────────────────┐
│                                                     │
│          Preparing the next pages                  │
│                                                     │
│          ▓▓▓▓▓▓▓▓░░░░░░  page 48 of 50             │
│          about 40 seconds                           │
│                                                     │
│   Recognition is slower than your verification.    │
│                                                     │
│   [Review the ready ones]      [Pause]             │
└────────────────────────────────────────────────────┘
```

The difference between an honest state and an endless spinner is the difference
between "I'll go make coffee" and "it's broken, I'll reload".

States that must be distinguished:

| Situation                        | What to show                                              |
| -------------------------------- | --------------------------------------------------------- |
| The queue is moving, just slowly | Progress and an approximate time                          |
| Budget exhausted                 | "Spent 10.00 of 10.00" + a button to raise the limit      |
| The model is unavailable         | "Service unavailable" + a "try again" button              |
| The page failed to read          | "Failed after 3 attempts" + "re-read" / "type it by hand" |

---

## The page strip

```
◄ 44  45  46 [47] 48  49  50  51 ►
  ✓   ✓   ✎   ●   ▓   ▓   ▓   ·
```

| Mark | State            |
| ---- | ---------------- |
| `✓`  | Confirmed        |
| `✎`  | Corrected        |
| `↷`  | Skipped          |
| `●`  | Current          |
| `▓`  | Ready to check   |
| `░`  | Being recognised |
| `·`  | Queued           |
| `!`  | Error            |

Hovering shows a thumbnail, clicking jumps to the page.

---

## Small things that add up

Verification is hours of monotonous work. Every small thing is multiplied by
hundreds of pages.

| Requirement                                | Why                                               |
| ------------------------------------------ | ------------------------------------------------- |
| **No transition animations between pages** | 200 ms × 300 pages = a minute of pure waiting     |
| Adjustable font size                       | Cursive is read by people with different eyesight |
| Adjustable image contrast                  | Faded ink                                         |
| Dark theme                                 | Long evening sessions                             |
| Progress saved on every page               | Close the tab and lose nothing                    |
| Focus always visible                       | The work is keyboard-driven                       |

---

## A separate mode: typing the ground truth

Measuring CER requires pages typed **blind**.

```
┌────────────────────────────────────────────────────┐
│  GROUND-TRUTH MODE — the model's output is hidden  │
├──────────────────────┬─────────────────────────────┤
│                      │                             │
│        IMAGE         │  [empty input field]        │
│                      │                             │
└──────────────────────┴─────────────────────────────┘
```

Show a human the model's version and ask them to "correct it" and they will
agree with most of what they see, mistakes included. The ground truth becomes a
copy of the model's output, CER comes out near zero, and the measurement shows
nothing.

The mode is needed in week 5 to check whether context learning works. It is
reachable from the document menu, not from the main flow.

---

---

## The preset editor

A preset holds three different things, and only two of them are meant for a
human to write:

| Part           | Who writes it       | In the UI                          |
| -------------- | ------------------- | ---------------------------------- |
| `instructions` | The user            | A plain textarea                   |
| `seedGlossary` | The user            | A word list with a "kind" dropdown |
| `outputSchema` | **Nobody, by hand** | Comes with the chosen template     |

**JSON Schema is not edited in the MVP.** The app ships 3-4 built-in presets —
parish register, medical record, diary, ledger — each with a ready
`outputSchema`. Creating a preset means picking one as a base and editing the
instruction text and the glossary. The schema is copied across unchanged.

```
┌──────────────────────────────────────────────────────────┐
│  New preset                                              │
│                                                           │
│  Based on:  [ Parish register ▾ ]   ← schema comes from here
│  Name:      [ Dykanka, 1880s________________ ]           │
│                                                           │
│  Instructions for the model                              │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ This is a page from a late 19th-century parish…     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Seed glossary                    [+ add word]           │
│   surname ▾  Ivanenko                            [×]     │
│   place   ▾  Dykanka                             [×]     │
│   formula ▾  born and baptised                   [×]     │
│                                                           │
│  Output fields: record_no, date, given_name, surname,    │
│  place, notes        (from the template, not editable)   │
└──────────────────────────────────────────────────────────┘
```

**Why not a field builder.** A visual "add a field, pick a type, mark it as an
entity" form is the obvious next step, and it is a day or two of work with its
own validation. It buys flexibility that the first users do not need: whoever
digitises a parish register wants the parish-register fields. Templates cover
that on day one, and the builder can be added later without changing the data
model — `output_schema` is already free-form jsonb.

**Why not a raw JSON textarea.** It is the cheapest option and it is honest
only for developers. [00-overview.md](00-overview.md) promises that a user can
create presets; a textarea demanding valid JSON Schema does not deliver that
promise, it just relocates it.

The preset is immutable, so "editing" a preset always creates a new version
([04-database.md](04-database.md#1-a-preset-is-never-updated--a-new-version-is-created)).
The UI must say so plainly — otherwise a user who edits a preset mid-document
will not understand why the pages already processed did not change.

---

## The other three screens

They are deliberately plain. Everything that could be interesting was spent on
the verification screen.

### Upload

One screen, one path, no branching:

```
┌──────────────────────────────────────────────────────────┐
│  Drag a PDF here, or choose a file                       │
│  up to 500 MB, up to 500 pages                           │
│                                                           │
│  Preset:  [ Parish register ▾ ]     [ new preset ]       │
│                                                           │
│  dykanka-1887.pdf · 180 MB    ▓▓▓▓▓▓▓░░░  71%            │
│                                                           │
│                                   [ Start processing ]   │
└──────────────────────────────────────────────────────────┘
```

Two things it must get right, both from
[02-data-pipeline.md](02-data-pipeline.md#steps-1-4-upload):

- the size and type check happens **before** the upload, on the file
  description, so a 2 GB file is rejected in a second rather than in twenty
  minutes;
- the progress bar tracks the `PUT` straight to S3, not a request to our
  server. Our backend sees nothing during those minutes, so the only source of
  progress is the browser's own upload event.

After `ingest` the user is taken to the document page, which shows processing
progress and does not require them to wait on this screen.

### Document list

A table. The one non-obvious column is progress, and it comes ready-made from
the `document_progress` view, so the list costs one query:

| Title                  | Status      | Progress | Spent        |
| ---------------------- | ----------- | -------- | ------------ |
| Parish register, 1887  | processing  | 47 / 300 | $0.98 / $10  |
| Hospital records, 1912 | done        | 88 / 88  | $2.14 / $10  |
| Ledger, 1903           | budget_stop | 12 / 240 | $10.00 / $10 |

`budget_stop` and `failed` need to look different from `processing` — those are
the two states where the document is not moving and the user has to act.

Clicking a row opens verification at `cursor_page_no`, not at page 1. The
cursor is in the database precisely so that closing the tab loses nothing.

### Export

A dialog rather than a screen:

```
┌────────────────────────────────────────────┐
│  Export "Parish register, 1887"            │
│                                             │
│  Format:  ( ) JSON   (•) CSV   ( ) TXT     │
│                                             │
│  12 of 300 pages are still unverified.     │
│  They will be exported as the model read   │
│  them, unchecked.                          │
│                                             │
│              [ Cancel ]  [ Export ]        │
└────────────────────────────────────────────┘
```

The warning about unverified pages is the whole point of the dialog. Export is
allowed at any time — an interrupted job is a normal reason to want the data —
but the user must know that part of it has not been through a human.

Export is a background job, so the dialog closes immediately and the finished
file arrives as a link on the document page.

---

## Next

[07-how-it-works.md](07-how-it-works.md) — the same path in plain words.
