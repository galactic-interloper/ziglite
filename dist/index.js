var O = (e) => {
  throw TypeError(e);
};
var C = (e, t, s) => t.has(e) || O("Cannot " + s);
var o = (e, t, s) => (C(e, t, "read from private field"), s ? s.call(e) : t.get(e)), y = (e, t, s) => t.has(e) ? O("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), $ = (e, t, s, n) => (C(e, t, "write to private field"), n ? n.call(e, s) : t.set(e, s), s);
import { z as r } from "zod";
import { parse as P, stringify as D } from "qs";
r.record(r.string(), r.boolean());
const j = r.union([r.string(), r.number(), r.boolean()]), x = r.record(
  r.unknown(),
  j
), N = r.object({
  _query: r.record(
    x.keySchema,
    x.valueSchema.or(r.array(j))
  ).optional()
});
r.intersection(
  x,
  N
);
const Q = r.object({
  uri: r.string(),
  domain: r.string().nullable(),
  wheres: x
});
r.object({
  substituted: r.array(r.string()),
  url: r.string()
});
const V = r.record(r.string(), Q), A = r.object({
  base: r.string(),
  defaults: x,
  routes: V
}), _ = (e) => typeof e == "string" || e instanceof String, k = (e) => e == null ? !0 : (_(e) || (e = String(e)), e.trim().length === 0), R = (e) => e.replace(/\/+$/, ""), F = (e) => {
  const t = e.indexOf("?"), s = t > -1;
  return {
    location: e.substring(0, s ? t : e.length),
    query: e.substring(s ? t + 1 : e.length)
  };
};
var d, a, g;
class I {
  constructor(t, s, n) {
    y(this, d);
    y(this, a);
    y(this, g);
    $(this, d, t), $(this, a, s), $(this, g, n);
  }
  /**
   * Retruns the route's origin
   */
  get origin() {
    if (!k(o(this, a).domain)) {
      const s = o(this, g).base.match(/^(http|https):\/\//);
      return R(((s == null ? void 0 : s[0]) ?? "") + o(this, a).domain);
    }
    return o(this, g).config.absolute ? R(o(this, g).origin) : "";
  }
  /**
   * Retruns the route's template
   */
  get template() {
    const t = R(`${this.origin}/${o(this, a).uri}`);
    return k(t) ? "/" : t;
  }
  /**
   * Retruns the route's template expected parameters
   */
  get expects() {
    const t = {}, s = this.template.match(/{\w+\??}/g) ?? [];
    for (const n of s) {
      const h = n.replace(/\W/g, "");
      t[h] = n.includes("?") || (t[h] ?? !1);
    }
    return t;
  }
  /**
   * Return the compiled URI for this route, along with an array of substituted tokens.
   */
  compile(t) {
    var l;
    const s = new Array(), n = this.expects, h = Object.keys(n);
    if (h.length < 1)
      return { substituted: s, url: this.template };
    let f = this.template;
    for (const i of h) {
      const S = n[i];
      let c = (t == null ? void 0 : t[i]) ?? ((l = o(this, g).config.defaults) == null ? void 0 : l[i]) ?? "";
      typeof c == "boolean" && (c = c ? 1 : 0);
      const b = String(c);
      if (!S) {
        if (k(b))
          throw new Error(
            `Missing required parameter "${i}" for route "${o(this, d)}"`
          );
        if (Object.hasOwn(o(this, a).wheres, i)) {
          const p = o(this, a).wheres[i];
          if (!new RegExp(`^${p}$`).test(b))
            throw new Error(
              `Parameter "${i}" for route "${o(this, d)}" does not match format "${p}"`
            );
        }
      }
      const m = new RegExp(`{${i}\\??}`, "g");
      if (m.test(f)) {
        const p = encodeURIComponent(b);
        if (f = R(f.replace(m, p)), s.push(i), /\/|%2F/g.test(p)) {
          const w = `Character "/" or sequence "%2F" in parameter "${i}" for route "${o(this, d)}" might cause routing issues.`;
          if (o(this, g).config.strict)
            throw new Error(
              w + `
	An error was thrown because you enabled strict mode.
`
            );
          console.warn(w);
        }
      }
    }
    return { substituted: s, url: f };
  }
  /**
   * Determine if the current route template matches the given URL.
   */
  matches(t) {
    var b;
    const s = /^[a-z]*:\/\//i;
    let n = this.template;
    (b = o(this, a).domain) != null && b.includes("{") ? t = t.replace(s, "") : (t = t.replace(/^[a-z]*:\/\/([a-z]*\.?)*/i, ""), t += t.startsWith("/") ? "" : "/", n = n.replace(/^[a-z]*:\/\/([a-z]*\.?)*/i, ""), n += n.startsWith("/") ? "" : "/");
    const { location: h, query: f } = F(t), l = /[/\\^$.|?*+()[\]{}]/g, i = /\\{(\w+)(\\\?)?\\}/g, S = n.replace(s, "").replace(l, "\\$&").replace(i, (m, p, w) => {
      const z = o(this, a).wheres[p] ?? "[^/]+";
      return `${w ? "?" : ""}(?<${p}>${z})${w ? "?" : ""}`;
    }), c = new RegExp(`^${S}/?$`).exec(h);
    if (c === null)
      return !1;
    for (const m in c.groups)
      if (Object.hasOwn(c.groups, m)) {
        if (c.groups[m] === void 0)
          continue;
        c.groups[m] = decodeURIComponent(c.groups[m]);
      }
    return {
      ...c.groups,
      _query: P(f)
    };
  }
}
d = new WeakMap(), a = new WeakMap(), g = new WeakMap();
const E = () => ({
  addQueryPrefix: !0,
  encoder: (e, t, s, n) => n === "value" && typeof e == "boolean" ? e ? 1 : 0 : t(e),
  encodeValuesOnly: !0,
  skipNulls: !0
}), W = () => ({
  absolute: !1,
  strict: !1,
  qsConfig: E(),
  base: "/",
  defaults: {},
  routes: {}
}), J = (e) => A.parse(JSON.parse(e));
var u;
class L {
  constructor(t) {
    y(this, u, W());
    this.config = t ?? {};
  }
  get config() {
    return o(this, u);
  }
  set config(t) {
    t = _(t) ? J(t) : t, $(this, u, {
      ...o(this, u),
      ...t,
      qsConfig: {
        ...E(),
        ...(t == null ? void 0 : t.qsConfig) ?? {}
      }
    });
  }
  get base() {
    return R(o(this, u).base);
  }
  get origin() {
    return o(this, u).absolute ? this.base : "";
  }
  has(t) {
    return Object.hasOwn(o(this, u).routes, t);
  }
  compile(t, s) {
    const n = this.getRoute(t), { substituted: h, url: f } = n.compile(s), l = s._query ?? {};
    delete s._query;
    for (const i of Object.keys(s))
      h.includes(i) || (Object.hasOwn(l, i) && console.warn(`Duplicate "${i}" in params and params.query may cause issues`), l[i] = s[i]);
    return f + D(l, o(this, u).qsConfig);
  }
  getRoute(t) {
    if (!this.has(t))
      throw new Error(`No such route "${t}" in the route list`);
    return new I(t, o(this, u).routes[t], this);
  }
}
u = new WeakMap();
const q = new L(), T = (e) => (q.config = e ?? {}, q.config), M = (e, t) => q.compile(e, t ?? {}), Z = (e) => q.has(e), G = {
  install(e) {
    e.mixin({
      methods: { route: M }
    });
  }
};
export {
  L as Router,
  G as ZigliteVuePlugin,
  T as configureRouter,
  Z as hasRoute,
  M as route
};
