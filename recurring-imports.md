# Recurring imports

[Back to the API guide](README.md)

Use repeated searches to refresh a local collection of matching jobs. This endpoint searches by computed posting time. It is not a feed of newly discovered jobs, updates, or deletions.

## What a completed run means

Each page is a fresh query, not part of a fixed snapshot. Reaching `nextCursor: null` completes pagination for that run. It does not prove that every job posted in the window has already been discovered or that all details stayed unchanged while paging.

For example, a run searches Monday through Tuesday. A job with a Monday posting time is first discovered on Wednesday. A later search covering only Tuesday through Wednesday can miss it. Filtering by `created_at` or `updated_at` is not supported; those are response fields only.

## Suggested workflow

1. Store the date range, a reference to your saved filter settings, and the completion state for each run.
2. Choose `before` once at the start of the run. Choose `after` to include an overlap with the last completed window. Select the overlap according to your tolerance for missed late arrivals and repeated results; no fixed overlap guarantees completeness.
3. Keep dates and filters unchanged while fetching pages. Save each page before requesting the next one. Apply page, time, and retry budgets from [Usage and compatibility](usage-and-compatibility.md).
4. Mark the run complete and advance its checkpoint only after all output is saved and `nextCursor` is `null`. A timeout, error, or page cap leaves the run incomplete.
5. If restarting without a cursor, expect repeated results. If you retained a cursor, reuse it only with the same dates and filters; handle [invalid cursors](errors.md#invalid-cursor) by restarting. No cursor lifetime is guaranteed in this guide.

If saved filters change, start a new search and decide which historical window to import again. Do not reuse the previous cursor.

## Identity and changed jobs

The response has no dedicated public job ID. `position.apply_url` can be used as a local matching hint, but it is not a guaranteed permanent identifier. A URL can change or be reused. A title or employer name is also not a unique key.

Keep your own record ID, source URL, first-seen time, last-seen time, and run reference. Choose a merge policy that fits your application. Retain ambiguous records for review rather than promising exact deduplication.

A job missing from a later search is not proof that it closed or was deleted. It may no longer match the filters or date window. `computed_closed_at: null` means no closure time is available, not that the source still accepts applications. Check the source posting when status matters.

## Limits of this approach

Overlap can reduce missed late arrivals and can expose changes to jobs within the overlap. It cannot guarantee complete imports, permanent identity, or all updates and deletions. Periodic wider searches can find more older jobs, but still have these limits and use more calls. Contact [RTJ support](https://t.me/RealtimeJobsSupport) if your workflow requires complete synchronization.
