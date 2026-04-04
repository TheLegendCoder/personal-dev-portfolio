## Performance Optimisation Baseline and Findings

The initial code fetched **all** blog posts to extract the top 3 latest/featured ones. This is very inefficient as it means:

1. **Over-fetching Data:** The `content` field contains raw markdown content for all blog posts. Fetching it for potentially hundreds of posts just to get the top 3 is extremely wasteful in terms of bandwidth and DB query execution time.
2. **CPU Overhead:** The `getAllBlogPosts()` function iterated over *every single* fetched post and executed `await markdownToHtml(row.content)`. `markdownToHtml` is an expensive CPU-bound task that runs markdown parsing and HTML sanitisation (`isomorphic-dompurify`).
3. **Memory Overhead:** Holding all posts and their sanitised HTML in memory simultaneously for every homepage hit.

### The Fix

Created `getTopBlogPosts(limit = 3)` which:
- Limits the database query directly (`.limit(limit)`).
- Explicitly selects only metadata, omitting `content`.
- Avoids calling `markdownToHtml`.

### Expected Impact
Without a direct database connection, empirical measurements aren't viable, but we can deduce that the algorithm's complexity has improved from `O(N)` (where `N` is total posts) to `O(limit)` - which is essentially `O(1)`. Time taken will remain constant no matter how many blog posts are written in the future.
