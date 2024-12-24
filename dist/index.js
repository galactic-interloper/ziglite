var C = (t) => {
  throw TypeError(t);
};
var j = (t, e, s) => e.has(t) || C("Cannot " + s);
var o = (t, e, s) => (j(t, e, "read from private field"), s ? s.call(t) : e.get(t)), y = (t, e, s) => e.has(t) ? C("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), $ = (t, e, s, n) => (j(t, e, "write to private field"), n ? n.call(t, s) : e.set(t, s), s);
import { z as r } from "zod";
import { parse as D, stringify as N } from "qs";
r.record(r.string(), r.boolean());
const _ = r.union([r.string(), r.number(), r.boolean()]), x = r.record(
  r.unknown(),
  _
), Q = r.object({
  _query: r.record(
    x.keySchema,
    x.valueSchema.or(r.array(_))
  ).optional()
});
r.intersection(
  x,
  Q
);
const V = r.object({
  uri: r.string(),
  domain: r.string().nullable(),
  wheres: x
});
r.object({
  substituted: r.array(r.string()),
  url: r.string()
});
const A = r.record(r.string(), V), F = r.object({
  base: r.string(),
  defaults: x,
  routes: A
}), E = (t) => typeof t == "string" || t instanceof String, k = (t) => t == null ? !0 : (E(t) || (t = String(t)), t.trim().length === 0), R = (t) => t.replace(/\/+$/, ""), I = (t) => {
  const e = t.indexOf("?"), s = e > -1;
  return {
    location: t.substring(0, s ? e : t.length),
    query: t.substring(s ? e + 1 : t.length)
  };
};
var d, a, g;
class W {
  constructor(e, s, n) {
    y(this, d);
    y(this, a);
    y(this, g);
    $(this, d, e), $(this, a, s), $(this, g, n);
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
    const e = R(`${this.origin}/${o(this, a).uri}`);
    return k(e) ? "/" : e;
  }
  /**
   * Retruns the route's template expected parameters
   */
  get expects() {
    const e = {}, s = this.template.match(/{\w+\??}/g) ?? [];
    for (const n of s) {
      const h = n.replace(/\W/g, "");
      e[h] = n.includes("?") || (e[h] ?? !1);
    }
    return e;
  }
  /**
   * Return the compiled URI for this route, along with an array of substituted tokens.
   */
  compile(e) {
    var l;
    const s = new Array(), n = this.expects, h = Object.keys(n);
    if (h.length < 1)
      return { substituted: s, url: this.template };
    let f = this.template;
    for (const i of h) {
      const S = n[i];
      let c = (e == null ? void 0 : e[i]) ?? ((l = o(this, g).config.defaults) == null ? void 0 : l[i]) ?? "";
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
  matches(e) {
    var b;
    const s = /^[a-z]*:\/\//i;
    let n = this.template;
    (b = o(this, a).domain) != null && b.includes("{") ? e = e.replace(s, "") : (e = e.replace(/^[a-z]*:\/\/([a-z]*\.?)*/i, ""), e += e.startsWith("/") ? "" : "/", n = n.replace(/^[a-z]*:\/\/([a-z]*\.?)*/i, ""), n += n.startsWith("/") ? "" : "/");
    const { location: h, query: f } = I(e), l = /[/\\^$.|?*+()[\]{}]/g, i = /\\{(\w+)(\\\?)?\\}/g, S = n.replace(s, "").replace(l, "\\$&").replace(i, (m, p, w) => {
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
      _query: D(f)
    };
  }
}
d = new WeakMap(), a = new WeakMap(), g = new WeakMap();
const P = () => ({
  addQueryPrefix: !0,
  encoder: (t, e, s, n) => n === "value" && typeof t == "boolean" ? t ? 1 : 0 : e(t),
  encodeValuesOnly: !0,
  skipNulls: !0
}), J = () => ({
  absolute: !1,
  strict: !1,
  qsConfig: P(),
  base: "/",
  defaults: {},
  routes: {}
}), L = (t) => F.parse(JSON.parse(t));
var u;
class M {
  constructor(e) {
    y(this, u, J());
    this.config = e ?? {};
  }
  get config() {
    return o(this, u);
  }
  set config(e) {
    e = E(e) ? L(e) : e, $(this, u, {
      ...o(this, u),
      ...e,
      qsConfig: {
        ...P(),
        ...(e == null ? void 0 : e.qsConfig) ?? {}
      }
    });
  }
  get base() {
    return R(o(this, u).base);
  }
  get origin() {
    return o(this, u).absolute ? this.base : "";
  }
  has(e) {
    return Object.hasOwn(o(this, u).routes, e);
  }
  compile(e, s) {
    const n = this.getRoute(e), { substituted: h, url: f } = n.compile(s), l = s._query ?? {};
    delete s._query;
    for (const i of Object.keys(s))
      h.includes(i) || (Object.hasOwn(l, i) && console.warn(`Duplicate "${i}" in params and params.query may cause issues`), l[i] = s[i]);
    return f + N(l, o(this, u).qsConfig);
  }
  getRoute(e) {
    if (!this.has(e))
      throw new Error(`No such route "${e}" in the route list`);
    return new W(e, o(this, u).routes[e], this);
  }
}
u = new WeakMap();
const q = new M(), T = (t) => (q.config = t ?? {}, q.config), O = (t, e) => q.compile(t, e ?? {}), Z = (t) => q.has(t), G = {
  install(t) {
    Number(t.version.split(".")[0]) < 3 ? t.mixin({
      methods: { route: O }
    }) : (t.config.globalProperties.route = O, t.provide("route", O));
  }
};
export {
  M as Router,
  G as ZigliteVuePlugin,
  T as configureRouter,
  Z as hasRoute,
  O as route
};
