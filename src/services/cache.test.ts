import { cachedFetch, FRESH_MS, invalidateCache, peekCache } from "./cache";

describe("smart cache", () => {
  beforeEach(() => {
    invalidateCache();
    window.location.hash = "#/";
    jest.useRealTimers();
  });

  it("serves a fresh entry without calling the network again", async () => {
    const fetcher = jest.fn().mockResolvedValue(["a"]);
    expect(await cachedFetch("/actualites", fetcher)).toEqual(["a"]);
    expect(await cachedFetch("/actualites", fetcher)).toEqual(["a"]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(peekCache("/actualites")).toEqual(["a"]);
  });

  it("shares one request between simultaneous callers", async () => {
    const fetcher = jest.fn(() => new Promise((r) => setTimeout(() => r({ ok: 1 }), 10)));
    const [a, b, c] = await Promise.all([1, 2, 3].map(() => cachedFetch("/informations", fetcher)));
    expect(a).toEqual({ ok: 1 });
    expect(b).toBe(a);
    expect(c).toBe(a);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("returns stale data immediately and refreshes it in the background", async () => {
    const now = Date.now();
    const spy = jest.spyOn(Date, "now").mockReturnValue(now);
    await cachedFetch("/annonces", jest.fn().mockResolvedValue(["old"]));
    spy.mockReturnValue(now + FRESH_MS + 1000);
    const refresh = jest.fn().mockResolvedValue(["new"]);
    expect(await cachedFetch("/annonces", refresh)).toEqual(["old"]); // instant, cached
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(peekCache("/annonces")).toEqual(["new"]);
    spy.mockRestore();
  });

  it("forgets an endpoint after a write (invalidate)", async () => {
    const fetcher = jest.fn().mockResolvedValueOnce(["v1"]).mockResolvedValueOnce(["v2"]);
    await cachedFetch("/slides", fetcher);
    invalidateCache("/slides");
    expect(await cachedFetch("/slides", fetcher)).toEqual(["v2"]);
  });

  it("always reads from the network in the admin area", async () => {
    window.location.hash = "#/admin/news";
    const fetcher = jest.fn().mockResolvedValueOnce(["a"]).mockResolvedValueOnce(["b"]);
    expect(await cachedFetch("/actualites-admin", fetcher)).toEqual(["a"]);
    expect(await cachedFetch("/actualites-admin", fetcher)).toEqual(["b"]);
  });
});
