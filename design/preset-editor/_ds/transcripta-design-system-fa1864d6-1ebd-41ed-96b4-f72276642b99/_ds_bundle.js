/* @ds-bundle: {"format":4,"namespace":"TranscriptaDesignSystem_fa1864","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"Kbd","sourcePath":"components/buttons/Kbd.jsx"},{"name":"KbdHints","sourcePath":"components/buttons/Kbd.jsx"},{"name":"Table","sourcePath":"components/data/Table.jsx"},{"name":"BudgetMeter","sourcePath":"components/feedback/BudgetMeter.jsx"},{"name":"Chip","sourcePath":"components/feedback/Chip.jsx"},{"name":"ProgressBar","sourcePath":"components/feedback/ProgressBar.jsx"},{"name":"QueuedChip","sourcePath":"components/feedback/QueuedChip.jsx"},{"name":"StateCard","sourcePath":"components/feedback/StateCard.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"PageStrip","sourcePath":"components/navigation/PageStrip.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Dialog","sourcePath":"components/overlay/Dialog.jsx"},{"name":"ContextMark","sourcePath":"components/verification/ContextMark.jsx"},{"name":"Dropzone","sourcePath":"components/verification/Dropzone.jsx"},{"name":"SplitPane","sourcePath":"components/verification/SplitPane.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"6c07a3150b7d","components/buttons/Kbd.jsx":"9528d0167778","components/data/Table.jsx":"09de2f2a3975","components/feedback/BudgetMeter.jsx":"7ad39a3750fa","components/feedback/Chip.jsx":"7a8a6e1b3960","components/feedback/ProgressBar.jsx":"f13f87e4435e","components/feedback/QueuedChip.jsx":"d90845a7585a","components/feedback/StateCard.jsx":"181bf41c374f","components/feedback/Toast.jsx":"8374b5af0f3a","components/feedback/Tooltip.jsx":"7089d14688ea","components/forms/Checkbox.jsx":"53f8f21545a6","components/forms/Input.jsx":"8a24561bf447","components/forms/Radio.jsx":"c0adf48e9dd7","components/forms/Select.jsx":"94b5b7de0c1c","components/forms/Textarea.jsx":"c2195eda1fa9","components/navigation/PageStrip.jsx":"b8ff8ecc47b3","components/navigation/Tabs.jsx":"eb47a22a3ba6","components/overlay/Dialog.jsx":"1baae2608daa","components/verification/ContextMark.jsx":"9d3f3378fc9e","components/verification/Dropzone.jsx":"0f7e3a83d9fd","components/verification/SplitPane.jsx":"43fded34b116","ui_kits/app/Auth.jsx":"39f01d0b39c1","ui_kits/app/Documents.jsx":"6a5c1267e944","ui_kits/app/Shell.jsx":"09e612d0e90c","ui_kits/app/Upload.jsx":"2bd4fce4e83b","ui_kits/app/Verification.jsx":"d4b6882e84ad","ui_kits/landing/Landing.jsx":"ba650d1f3d1a"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TranscriptaDesignSystem_fa1864 = window.TranscriptaDesignSystem_fa1864 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Button({
  variant = 'primary',
  size = 'md',
  children,
  ...rest
}) {
  const cls = ['tx-btn', 'tx-btn--' + variant];
  if (size !== 'md') cls.push('tx-btn--' + size);
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls.join(' ')
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/Kbd.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Kbd({
  down = false,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("kbd", _extends({
    className: 'tx-kbd' + (down ? ' is-down' : '')
  }, rest), children);
}
function KbdHints({
  hints = [],
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: "tx-kbdrow"
  }, rest), hints.map((h, i) => /*#__PURE__*/React.createElement("span", {
    key: i
  }, /*#__PURE__*/React.createElement(Kbd, null, h.key), h.label)));
}
Object.assign(__ds_scope, { Kbd, KbdHints });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Kbd.jsx", error: String((e && e.message) || e) }); }

// components/data/Table.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Table({
  columns = [],
  rows = [],
  ...rest
}) {
  return /*#__PURE__*/React.createElement("table", _extends({
    className: "tx-table"
  }, rest), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: c.align ? {
      textAlign: c.align
    } : null
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    className: r.status ? 'tx-row--' + r.status : null,
    onClick: r.onClick,
    style: r.onClick ? {
      cursor: 'pointer'
    } : null
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    className: c.mono ? 'tx-num' : null,
    style: c.align ? {
      textAlign: c.align
    } : null
  }, r[c.key]))))));
}
Object.assign(__ds_scope, { Table });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Table.jsx", error: String((e && e.message) || e) }); }

// components/feedback/BudgetMeter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fmt = n => '$' + Number(n).toFixed(2);
function BudgetMeter({
  spent = 0,
  limit = 10,
  onRaise,
  ...rest
}) {
  const pct = limit > 0 ? spent / limit : 0;
  const state = pct >= 1 ? 'stop' : pct >= 0.8 ? 'warn' : 'ok';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: 'tx-budget' + (state === 'ok' ? '' : ' tx-budget--' + state)
  }, /*#__PURE__*/React.createElement("span", {
    className: "tx-budget-bar"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: Math.min(100, pct * 100) + '%'
    }
  })), fmt(spent), " / ", fmt(limit)), state === 'stop' ? /*#__PURE__*/React.createElement("button", {
    className: "tx-btn tx-btn--secondary tx-btn--sm",
    onClick: onRaise
  }, "Raise the limit") : null);
}
Object.assign(__ds_scope, { BudgetMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/BudgetMeter.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Chip({
  tone,
  mono = false,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: 'tx-chip' + (tone ? ' tx-chip--' + tone : '') + (mono ? ' tnum' : '')
  }, rest), children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Chip.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ProgressBar({
  value = 0,
  left,
  right,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: style
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "tx-progress-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tx-progress-fill",
    style: {
      width: Math.min(100, Math.max(0, value)) + '%'
    }
  })), left || right ? /*#__PURE__*/React.createElement("div", {
    className: "tx-progress-cap"
  }, /*#__PURE__*/React.createElement("span", null, left), /*#__PURE__*/React.createElement("span", null, right)) : null);
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/QueuedChip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function QueuedChip({
  count = 0,
  ...rest
}) {
  if (!count) return null;
  return /*#__PURE__*/React.createElement("span", _extends({
    className: "tx-chip"
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 'var(--fs-xs)'
    }
  }, count), "unsaved action", count === 1 ? '' : 's');
}
Object.assign(__ds_scope, { QueuedChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/QueuedChip.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StateCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StateCard({
  headline,
  reason,
  estimate,
  actions = [],
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "tx-state",
    style: style
  }, rest), /*#__PURE__*/React.createElement("h3", {
    className: "tx-state-h"
  }, headline), reason ? /*#__PURE__*/React.createElement("p", {
    className: "tx-state-reason"
  }, reason) : null, estimate ? /*#__PURE__*/React.createElement("span", {
    className: "tx-state-est"
  }, estimate) : null, actions.length ? /*#__PURE__*/React.createElement("div", {
    className: "tx-state-actions"
  }, actions.map((a, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: 'tx-btn tx-btn--sm tx-btn--' + (a.variant || (i === 0 ? 'primary' : 'secondary')),
    onClick: a.onClick
  }, a.label))) : null);
}
Object.assign(__ds_scope, { StateCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StateCard.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const G = {
  neutral: '·',
  ok: '✓',
  warn: '!',
  danger: '✕'
};
function Toast({
  tone = 'neutral',
  title,
  detail,
  action,
  onAction,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: 'tx-toast tx-toast--' + tone,
    role: "status"
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "tx-toast-glyph",
    "aria-hidden": "true"
  }, G[tone]), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: 600
    }
  }, title), detail ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      color: 'var(--text-2)',
      fontSize: 'var(--fs-xs)'
    }
  }, detail) : null), action ? /*#__PURE__*/React.createElement("button", {
    className: "tx-btn tx-btn--ghost tx-btn--sm",
    onClick: onAction
  }, action) : null);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tooltip({
  tip,
  open = false,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: 'tx-tip' + (open ? ' is-open' : ''),
    "data-tip": tip,
    tabIndex: 0
  }, rest), children);
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  ...rest
}) {
  const el = /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    className: "tx-check"
  }, rest));
  return label ? /*#__PURE__*/React.createElement("label", {
    className: "tx-field"
  }, el, label) : el;
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  id,
  style,
  ...rest
}) {
  const el = /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    className: "tx-input",
    style: style
  }, rest));
  return label ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "tx-label",
    htmlFor: id
  }, label), el) : el;
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  label,
  ...rest
}) {
  const el = /*#__PURE__*/React.createElement("input", _extends({
    type: "radio",
    className: "tx-radio"
  }, rest));
  return label ? /*#__PURE__*/React.createElement("label", {
    className: "tx-field"
  }, el, label) : el;
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  label,
  id,
  options = [],
  style,
  ...rest
}) {
  const el = /*#__PURE__*/React.createElement("span", {
    className: "tx-selectwrap",
    style: style
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: id,
    className: "tx-input"
  }, rest), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o))));
  return label ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "tx-label",
    htmlFor: id
  }, label), el) : el;
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Textarea({
  label,
  id,
  style,
  ...rest
}) {
  const el = /*#__PURE__*/React.createElement("textarea", _extends({
    id: id,
    className: "tx-input",
    style: style
  }, rest));
  return label ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "tx-label",
    htmlFor: id
  }, label), el) : el;
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/PageStrip.jsx
try { (() => {
const GLYPH = {
  confirmed: '✓',
  corrected: '✎',
  skipped: '↷',
  current: '●',
  ready: '▓',
  running: '░',
  queued: '·',
  error: '!'
};
function PageStrip({
  pages = [],
  onSelect,
  onPrev,
  onNext,
  thumbs = true,
  legend = false,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", rest, /*#__PURE__*/React.createElement("div", {
    className: "tx-pstrip"
  }, /*#__PURE__*/React.createElement("button", {
    className: "tx-page",
    "aria-label": "Previous",
    onClick: onPrev
  }, "\u25C4"), pages.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.n,
    className: 'tx-page tx-page--' + p.state,
    onClick: () => onSelect && onSelect(p.n)
  }, p.n, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, GLYPH[p.state] || ''), thumbs && p.state !== 'current' ? /*#__PURE__*/React.createElement("span", {
    className: "tx-page-thumb",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)) : null)), /*#__PURE__*/React.createElement("button", {
    className: "tx-page",
    "aria-label": "Next",
    onClick: onNext
  }, "\u25BA")), legend ? /*#__PURE__*/React.createElement("div", {
    className: "tx-pstrip-legend",
    style: {
      marginTop: 6
    }
  }, "\u2593 ready\u2002\u2591 running\u2002\xB7 queued") : null);
}
Object.assign(__ds_scope, { PageStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/PageStrip.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tabs({
  tabs = [],
  active,
  onChange,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "tx-tabs",
    role: "tablist"
  }, rest), tabs.map(t => {
    const id = typeof t === 'string' ? t : t.id,
      label = typeof t === 'string' ? t : t.label;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      role: "tab",
      "aria-selected": id === active,
      className: 'tx-tab' + (id === active ? ' is-active' : ''),
      onClick: () => onChange && onChange(id)
    }, label);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/overlay/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Dialog({
  open = true,
  title,
  children,
  actions,
  inline = false,
  onClose,
  ...rest
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "tx-scrim",
    style: inline ? {
      position: 'absolute'
    } : null,
    onClick: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "tx-dialog",
    role: "dialog",
    "aria-modal": "true"
  }, title ? /*#__PURE__*/React.createElement("h2", {
    className: "tx-dialog-title"
  }, title) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 var(--fs-sm)/var(--lh-ui) var(--font-ui)',
      color: 'var(--text-2)'
    }
  }, children), actions ? /*#__PURE__*/React.createElement("div", {
    className: "tx-dialog-actions"
  }, actions) : null));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlay/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/verification/ContextMark.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ContextMark({
  tip = 'from the lexicon',
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("mark", _extends({
    className: "tx-mark tx-tip",
    "data-tip": tip,
    tabIndex: 0
  }, rest), children);
}
Object.assign(__ds_scope, { ContextMark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/verification/ContextMark.jsx", error: String((e && e.message) || e) }); }

// components/verification/Dropzone.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Dropzone({
  state = 'rest',
  file,
  reason,
  onChoose,
  style,
  ...rest
}) {
  const cls = 'tx-drop' + (state !== 'rest' && state !== 'selected' ? ' tx-drop--' + state : state === 'selected' ? ' tx-drop--selected' : '');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    style: style
  }, rest), state === 'selected' && file ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", {
    className: "tx-num",
    style: {
      fontSize: 13
    }
  }, file), /*#__PURE__*/React.createElement("small", null, "Ready to upload")) : state === 'rejected' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, reason || 'That file can’t be read'), /*#__PURE__*/React.createElement("small", null, "PDF only \xB7 up to 500 MB, up to 500 pages"), /*#__PURE__*/React.createElement("button", {
    className: "tx-btn tx-btn--secondary tx-btn--sm",
    onClick: onChoose,
    style: {
      marginTop: 6
    }
  }, "Choose another file")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "Drag a PDF here, or ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onChoose && onChoose();
    }
  }, "choose a file")), /*#__PURE__*/React.createElement("small", null, "up to 500 MB, up to 500 pages")));
}
Object.assign(__ds_scope, { Dropzone });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/verification/Dropzone.jsx", error: String((e && e.message) || e) }); }

// components/verification/SplitPane.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SplitPane({
  left,
  right,
  storageKey = 'tx-split',
  defaultPct = 52,
  minPct = 25,
  maxPct = 75,
  style,
  ...rest
}) {
  const saved = Number(typeof localStorage !== 'undefined' && localStorage.getItem(storageKey));
  const [pct, setPct] = React.useState(saved >= minPct && saved <= maxPct ? saved : defaultPct);
  const [drag, setDrag] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!drag) return;
    const move = e => {
      const r = ref.current.getBoundingClientRect();
      const p = Math.min(maxPct, Math.max(minPct, (e.clientX - r.left) / r.width * 100));
      setPct(p);
    };
    const up = () => {
      setDrag(false);
      try {
        localStorage.setItem(storageKey, String(Math.round(pctRef.current)));
      } catch (e) {}
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [drag]);
  const pctRef = React.useRef(pct);
  pctRef.current = pct;
  return /*#__PURE__*/React.createElement("div", _extends({
    ref: ref,
    className: "tx-split",
    style: style
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "tx-split-pane",
    style: {
      width: pct + '%'
    }
  }, left), /*#__PURE__*/React.createElement("div", {
    className: 'tx-split-divider' + (drag ? ' is-dragging' : ''),
    onMouseDown: e => {
      e.preventDefault();
      setDrag(true);
    },
    role: "separator",
    "aria-orientation": "vertical"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tx-split-grip"
  })), /*#__PURE__*/React.createElement("div", {
    className: "tx-split-pane",
    style: {
      flex: 1
    }
  }, right));
}
Object.assign(__ds_scope, { SplitPane });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/verification/SplitPane.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Auth.jsx
try { (() => {
function TxAuth({
  onIn,
  themeBtn
}) {
  const {
    Input,
    Button
  } = window.TranscriptaDesignSystem_fa1864;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      background: 'var(--bg)',
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'var(--font-ui)',
      color: 'var(--text)',
      position: 'relative'
    }
  }, themeBtn ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 12,
      right: 14
    }
  }, themeBtn) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 360,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      padding: '40px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 6,
      background: 'var(--seal-500)',
      display: 'inline-grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 20,
    height: 20,
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 12 L41 8.5 L39.5 17 L8.5 19.5 Z",
    fill: "var(--paper-100)"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.5 15.5 L29 14.5 L26 42 L22.5 42 Z",
    fill: "var(--paper-100)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "33.5",
    cy: "38.5",
    r: "3.4",
    fill: "var(--paper-100)"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 20px/1 var(--font-display)'
    }
  }, "Transcripta")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-lg)',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: '600 20px/1.2 var(--font-display)',
      margin: 0
    }
  }, "Sign in"), /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    id: "em",
    type: "email",
    placeholder: "you@archive.org"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    id: "pw",
    type: "password"
  }), /*#__PURE__*/React.createElement(Button, {
    style: {
      width: '100%',
      marginTop: 4
    },
    onClick: onIn
  }, "Sign in"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      font: '400 12px/1.4 var(--font-ui)',
      color: 'var(--text-2)'
    }
  }, "New here? ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Create an account")))));
}
window.TxAuth = TxAuth;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Auth.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Documents.jsx
try { (() => {
function TxDocuments({
  onOpen,
  onUpload
}) {
  const {
    Table,
    Chip,
    Button,
    BudgetMeter
  } = window.TranscriptaDesignSystem_fa1864;
  const columns = [{
    key: 'name',
    label: 'Document'
  }, {
    key: 'st',
    label: 'Status'
  }, {
    key: 'pages',
    label: 'Pages',
    mono: true,
    align: 'right'
  }, {
    key: 'spent',
    label: 'Spent',
    mono: true,
    align: 'right'
  }];
  const rows = [{
    name: 'Parish register, 1887',
    st: /*#__PURE__*/React.createElement(Chip, null, "Processing"),
    pages: '47/300',
    spent: '$0.98 / $10.00',
    onClick: onOpen
  }, {
    name: 'Hospital records, 1912',
    st: /*#__PURE__*/React.createElement(Chip, {
      tone: "ok"
    }, "Done"),
    pages: '88/88',
    spent: '$2.14 / $10.00'
  }, {
    name: 'Ledger, 1903',
    st: /*#__PURE__*/React.createElement(Chip, {
      tone: "warn"
    }, "Budget limit"),
    pages: '12/240',
    spent: '$10.00 / $10.00',
    status: 'budget_stop'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: onUpload
  }, "Upload a PDF")), /*#__PURE__*/React.createElement(Table, {
    columns: columns,
    rows: rows
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 11px/1.4 var(--font-ui)',
      color: 'var(--text-3)'
    }
  }, "Ledger, 1903 stopped at its budget \u2014 open it to raise the limit. Click \u201CParish register, 1887\u201D to continue verifying."));
}
function TxPresets() {
  const {
    Input,
    Textarea,
    Select,
    Checkbox,
    Button
  } = window.TranscriptaDesignSystem_fa1864;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 520,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Preset",
    id: "pr",
    options: ['Church records', 'Ledgers', 'Letters']
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Preset name",
    id: "pn",
    defaultValue: "Church records"
  }), /*#__PURE__*/React.createElement(Textarea, {
    label: "Prompt notes",
    id: "pt",
    rows: 4,
    defaultValue: "Names repeat across pages; keep spelling. Dates are Julian calendar."
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Feed confirmed words into the lexicon",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, null, "Save preset")));
}
Object.assign(window, {
  TxDocuments,
  TxPresets
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Documents.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Shell.jsx
try { (() => {
function TxShell({
  title,
  active,
  onNav,
  right,
  children,
  unsaved
}) {
  const {
    Chip,
    BudgetMeter,
    QueuedChip
  } = window.TranscriptaDesignSystem_fa1864;
  const Item = ({
    id,
    label
  }) => /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav(id);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      height: 32,
      padding: '0 10px',
      borderRadius: 'var(--r-md)',
      background: active === id ? 'var(--surface-2)' : 'transparent',
      color: active === id ? 'var(--text)' : 'var(--text-2)',
      font: '500 13px/1 var(--font-ui)',
      textDecoration: 'none'
    }
  }, label);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100%',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: 'var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 'var(--sidebar-w)',
      flex: 'none',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--hairline)',
      padding: '14px 12px',
      boxSizing: 'border-box',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9,
      alignItems: 'center',
      padding: '4px 8px 14px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 26,
      height: 26,
      borderRadius: 5,
      background: 'var(--seal-500)',
      display: 'inline-grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 18,
    height: 18,
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 12 L41 8.5 L39.5 17 L8.5 19.5 Z",
    fill: "var(--paper-100)"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.5 15.5 L29 14.5 L26 42 L22.5 42 Z",
    fill: "var(--paper-100)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "33.5",
    cy: "38.5",
    r: "3.4",
    fill: "var(--paper-100)"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 16px/1 var(--font-display)'
    }
  }, "Transcripta")), /*#__PURE__*/React.createElement(Item, {
    id: "documents",
    label: "Documents"
  }), /*#__PURE__*/React.createElement(Item, {
    id: "presets",
    label: "Presets"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--hairline)',
      padding: '10px 8px 2px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12px/1.3 var(--font-ui)',
      color: 'var(--text-2)'
    }
  }, "reader@example.com"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav('auth');
    },
    style: {
      font: '500 12px/1 var(--font-ui)',
      color: 'var(--text-3)',
      textDecoration: 'none'
    }
  }, "Sign out"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      height: 56,
      flex: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      borderBottom: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: '600 22px/1.15 var(--font-display)',
      margin: 0
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, unsaved ? /*#__PURE__*/React.createElement(QueuedChip, {
    count: unsaved
  }) : null, right)), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 20,
      minHeight: 0
    }
  }, children)));
}
window.TxShell = TxShell;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Upload.jsx
try { (() => {
function TxUpload({
  onDone
}) {
  const {
    Dropzone,
    ProgressBar,
    Button,
    StateCard
  } = window.TranscriptaDesignSystem_fa1864;
  const [step, setStep] = React.useState('rest');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, step === 'rest' ? /*#__PURE__*/React.createElement(Dropzone, {
    onChoose: () => setStep('selected')
  }) : null, step === 'selected' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Dropzone, {
    state: "selected",
    file: "dykanka-1887.pdf \xB7 180 MB"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => setStep('uploading')
  }, "Upload"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: () => setStep('rest')
  }, "Remove"))) : null, step === 'uploading' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ProgressBar, {
    value: 71,
    left: "dykanka-1887.pdf \xB7 180 MB",
    right: "71%"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    value: 96,
    left: "page 48 of 50",
    right: "about 40 seconds"
  }), /*#__PURE__*/React.createElement(StateCard, {
    headline: "Preparing the next pages",
    reason: "The model transcribes ahead of you, so verification never waits.",
    estimate: "about 40 seconds",
    actions: [{
      label: 'Review the ready ones',
      onClick: onDone
    }, {
      label: 'Pause',
      variant: 'ghost'
    }]
  })) : null);
}
window.TxUpload = TxUpload;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Upload.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Verification.jsx
try { (() => {
const RECORD_TXT = "No. 15. Born on 11 January, Anna. Parents: peasant of Dykanka village, Petr Ivanenko and his lawful wife Maria, both Orthodox.";
function TxVerify({
  onBack,
  themeBtn
}) {
  const {
    SplitPane,
    PageStrip,
    ContextMark,
    BudgetMeter,
    QueuedChip,
    KbdHints,
    Kbd,
    Button,
    Dialog,
    StateCard,
    Toast
  } = window.TranscriptaDesignSystem_fa1864;
  const RECORD = /*#__PURE__*/React.createElement(React.Fragment, null, "No. 15. Born on 11 January, Anna. Parents: peasant of ", /*#__PURE__*/React.createElement(ContextMark, {
    tip: "from the lexicon, seen on 4 pages"
  }, "Dykanka"), " village, Petr ", /*#__PURE__*/React.createElement(ContextMark, {
    tip: "from the lexicon, seen on 4 pages"
  }, "Ivanenko"), " and his lawful wife Maria, both Orthodox.");
  const [pages, setPages] = React.useState([{
    n: 44,
    state: 'confirmed'
  }, {
    n: 45,
    state: 'confirmed'
  }, {
    n: 46,
    state: 'corrected'
  }, {
    n: 47,
    state: 'current'
  }, {
    n: 48,
    state: 'ready'
  }, {
    n: 49,
    state: 'ready'
  }, {
    n: 50,
    state: 'ready'
  }, {
    n: 51,
    state: 'queued'
  }]);
  const [mode, setMode] = React.useState('read');
  const [help, setHelp] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const cur = pages.find(p => p.state === 'current');
  const advance = newState => setPages(ps => {
    const i = ps.findIndex(p => p.state === 'current');
    if (i < 0) return ps;
    const next = ps.map((p, j) => j === i ? {
      ...p,
      state: newState
    } : p);
    const k = next.findIndex(p => p.state === 'ready');
    if (k >= 0) next[k] = {
      ...next[k],
      state: 'current'
    };
    return next;
  });
  const act = kind => {
    if (!cur) return;
    if (kind === 'confirm') {
      advance(mode === 'edit' ? 'corrected' : 'confirmed');
      setMode('read');
      setToast('Page ' + cur.n + (mode === 'edit' ? ' corrected' : ' confirmed'));
    }
    if (kind === 'skip') {
      advance('skipped');
      setMode('read');
    }
    if (kind === 'edit') setMode('edit');
  };
  React.useEffect(() => {
    const h = e => {
      if (e.key === '?') {
        setHelp(v => !v);
        return;
      }
      if (e.key === 'Escape') {
        setHelp(false);
        setMode('read');
        return;
      }
      if (mode === 'edit' && e.key !== 'Enter') return;
      if (e.key === 'Enter') {
        e.preventDefault();
        act('confirm');
      } else if (e.key === 'e' || e.key === 'E') act('edit');else if (e.key === 's' || e.key === 'S') act('skip');
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  const scan = /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      background: 'var(--paper-100)',
      padding: '28px 32px',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 10,
      right: 10,
      font: '400 10px/1 var(--font-mono)',
      color: 'var(--paper-600)',
      border: '1px solid var(--paper-400)',
      borderRadius: 3,
      padding: '3px 6px'
    }
  }, "scan placeholder"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'italic 400 21px/1.9 var(--font-display)',
      color: '#453a28',
      maxWidth: 520
    }
  }, RECORD_TXT));
  const text = /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      height: '100%',
      boxSizing: 'border-box'
    }
  }, cur ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '500 11px/1 var(--font-mono)',
      color: 'var(--text-3)'
    }
  }, "page ", cur.n, " of 300"), mode === 'edit' ? /*#__PURE__*/React.createElement("textarea", {
    className: "tx-input",
    autoFocus: true,
    rows: 5,
    defaultValue: RECORD_TXT,
    style: {
      font: '400 15px/1.65 var(--font-ui)'
    }
  }) : /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 16px/1.65 var(--font-ui)',
      color: 'var(--text)',
      maxWidth: 560
    }
  }, RECORD), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => act('confirm')
  }, mode === 'edit' ? 'Save & confirm' : 'Correct'), mode === 'read' ? /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => act('edit')
  }, "Edit") : null, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: () => act('skip')
  }, "Skip"))) : /*#__PURE__*/React.createElement(StateCard, {
    headline: "Preparing the next pages",
    reason: "Everything ready has been verified; the model is still reading.",
    estimate: "about 40 seconds",
    actions: [{
      label: 'Pause',
      variant: 'secondary'
    }]
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: 'var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      height: 48,
      flex: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '0 14px',
      borderBottom: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onBack();
    },
    style: {
      font: '500 12px/1 var(--font-ui)',
      color: 'var(--text-2)',
      textDecoration: 'none'
    }
  }, "\u2190 Documents"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 15px/1.15 var(--font-display)'
    }
  }, "Parish register, 1887"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(KbdHints, {
    hints: [{
      key: 'Enter',
      label: 'Correct'
    }, {
      key: 'E',
      label: 'Edit'
    }, {
      key: 'S',
      label: 'Skip'
    }, {
      key: '?',
      label: 'Shortcuts'
    }]
  }), /*#__PURE__*/React.createElement(QueuedChip, {
    count: 3
  }), /*#__PURE__*/React.createElement(BudgetMeter, {
    spent: 0.98,
    limit: 10
  }), themeBtn || null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(SplitPane, {
    storageKey: "tx-verify-split",
    left: scan,
    right: text,
    style: {
      height: '100%'
    }
  })), /*#__PURE__*/React.createElement("footer", {
    style: {
      height: 46,
      flex: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      borderTop: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement(PageStrip, {
    pages: pages
  }), /*#__PURE__*/React.createElement("span", {
    className: "tx-pstrip-legend"
  }, "\u2593 ready\u2002\u2591 running\u2002\xB7 queued")), toast ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 60,
      right: 16
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: "ok",
    title: toast,
    action: "Dismiss",
    onAction: () => setToast(null)
  })) : null, help ? /*#__PURE__*/React.createElement(Dialog, {
    inline: true,
    title: "Keyboard shortcuts",
    onClose: () => setHelp(false),
    actions: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setHelp(false)
    }, "Close")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: '10px 14px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Kbd, null, "Enter"), /*#__PURE__*/React.createElement("span", null, "Confirm the page as shown"), /*#__PURE__*/React.createElement(Kbd, null, "E"), /*#__PURE__*/React.createElement("span", null, "Edit the transcription"), /*#__PURE__*/React.createElement(Kbd, null, "S"), /*#__PURE__*/React.createElement("span", null, "Skip for later"), /*#__PURE__*/React.createElement(Kbd, null, "?"), /*#__PURE__*/React.createElement("span", null, "Toggle this overlay"))) : null);
}
window.TxVerify = TxVerify;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Verification.jsx", error: String((e && e.message) || e) }); }

// ui_kits/landing/Landing.jsx
try { (() => {
const Lockup = () => /*#__PURE__*/React.createElement("span", {
  style: {
    display: 'inline-flex',
    gap: 9,
    alignItems: 'center'
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 26,
    height: 26,
    borderRadius: 5,
    background: 'var(--seal-500)',
    display: 'inline-grid',
    placeItems: 'center'
  }
}, /*#__PURE__*/React.createElement("svg", {
  width: 18,
  height: 18,
  viewBox: "0 0 48 48"
}, /*#__PURE__*/React.createElement("path", {
  d: "M7 12 L41 8.5 L39.5 17 L8.5 19.5 Z",
  fill: "var(--paper-100)"
}), /*#__PURE__*/React.createElement("path", {
  d: "M19.5 15.5 L29 14.5 L26 42 L22.5 42 Z",
  fill: "var(--paper-100)"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "33.5",
  cy: "38.5",
  r: "3.4",
  fill: "var(--paper-100)"
}))), /*#__PURE__*/React.createElement("span", {
  style: {
    font: '600 17px/1 var(--font-display)',
    color: 'var(--text)'
  }
}, "Transcripta"));
function TxLanding() {
  const {
    Button,
    ContextMark,
    KbdHints,
    Chip,
    ProgressBar,
    BudgetMeter
  } = window.TranscriptaDesignSystem_fa1864;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: 'var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 64px',
      borderBottom: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement(Lockup, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 28,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#how",
    style: {
      font: '500 13px var(--font-ui)',
      textDecoration: 'none'
    }
  }, "How it works"), /*#__PURE__*/React.createElement("a", {
    href: "#night",
    style: {
      font: '500 13px var(--font-ui)',
      textDecoration: 'none'
    }
  }, "Night reading"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg"
  }, "Sign in"))), /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.05fr 1fr',
      gap: 56,
      alignItems: 'center',
      padding: '88px 64px 96px',
      maxWidth: 1240,
      margin: '0 auto',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: '600 52px/1.12 var(--font-display)',
      margin: 0,
      letterSpacing: '-.01em',
      textWrap: 'balance'
    }
  }, "Handwritten archives, read and verified."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: '400 17px/1.6 var(--font-ui)',
      color: 'var(--text-2)',
      margin: '20px 0 28px',
      maxWidth: 480
    }
  }, "Upload a scanned PDF. A model transcribes every page; you verify each one in under ten seconds. Confirmed words feed back into the prompt as a lexicon, so accuracy grows while you work."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "landing"
  }, "Start transcribing"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12px/1.4 var(--font-ui)',
      color: 'var(--text-3)'
    }
  }, "up to 500 MB, up to 500 pages"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-lg)',
      padding: 24,
      boxShadow: 'var(--shadow-pop)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 14px var(--font-display)'
    }
  }, "Parish register, 1887"), /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 11,
      color: 'var(--text-3)'
    }
  }, "page 47 of 300")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 15px/1.65 var(--font-ui)'
    }
  }, "No. 15. Born on 11 January, Anna. Parents: peasant of ", /*#__PURE__*/React.createElement(ContextMark, {
    tip: "from the lexicon, seen on 4 pages"
  }, "Dykanka"), " village, Petr ", /*#__PURE__*/React.createElement(ContextMark, {
    tip: "from the lexicon, seen on 4 pages"
  }, "Ivanenko"), " and his lawful wife Maria, both Orthodox."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 18,
      paddingTop: 14,
      borderTop: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement(KbdHints, {
    hints: [{
      key: 'Enter',
      label: 'Correct'
    }, {
      key: 'E',
      label: 'Edit'
    }, {
      key: 'S',
      label: 'Skip'
    }]
  }), /*#__PURE__*/React.createElement(BudgetMeter, {
    spent: 0.98,
    limit: 10
  })))), /*#__PURE__*/React.createElement("section", {
    id: "how",
    style: {
      borderTop: '1px solid var(--hairline)',
      padding: '72px 64px 84px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1112,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: '600 30px/1.2 var(--font-display)',
      margin: '0 0 36px'
    }
  }, "How it works"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 20
    }
  }, [['01', 'Upload', 'Drag a PDF here, or choose a file. Pages start processing immediately, oldest first.'], ['02', 'The model reads', 'Every page is transcribed with your preset and the growing lexicon. Progress is always determinate — a reason and an approximate time, never a spinner.'], ['03', 'You verify', 'Scan beside text, keyboard only. Confirm, correct, or skip — each page in under ten seconds.']].map(([n, t, d]) => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-lg)',
      padding: '22px 22px 26px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 12,
      color: 'var(--accent-text)'
    }
  }, n), /*#__PURE__*/React.createElement("h3", {
    style: {
      font: '600 19px/1.25 var(--font-display)',
      margin: '10px 0 8px'
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 13.5px/1.6 var(--font-ui)',
      color: 'var(--text-2)'
    }
  }, d)))))), /*#__PURE__*/React.createElement("section", {
    id: "night",
    "data-theme": "dark",
    style: {
      background: 'var(--bg)',
      color: 'var(--text)',
      padding: '72px 64px 84px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1112,
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 56,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: '600 30px/1.2 var(--font-display)',
      margin: 0
    }
  }, "A reading room at night."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: '400 15px/1.65 var(--font-ui)',
      color: 'var(--text-2)',
      margin: '16px 0 0',
      maxWidth: 440
    }
  }, "Verification is evening work. The dark theme keeps surfaces warm and near-black while the scanned page stays the brightest thing on screen \u2014 hours of reading without glare.")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-lg)',
      padding: 20,
      display: 'flex',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      width: 150,
      background: 'var(--paper-100)',
      borderRadius: 'var(--r-sm)',
      padding: '14px 12px'
    }
  }, [92, 78, 86, 64, 88, 72, 80].map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      height: 4,
      width: w + '%',
      background: 'var(--paper-400)',
      borderRadius: 2,
      marginBottom: 8
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 13.5px/1.6 var(--font-ui)'
    }
  }, "\u2026peasant of ", /*#__PURE__*/React.createElement(ContextMark, {
    tip: "from the lexicon, seen on 4 pages"
  }, "Dykanka"), " village, Petr ", /*#__PURE__*/React.createElement(ContextMark, {
    tip: "from the lexicon, seen on 4 pages"
  }, "Ivanenko"), "\u2026"), /*#__PURE__*/React.createElement(ProgressBar, {
    value: 96,
    left: "page 48 of 50",
    right: "about 40 seconds"
  }))))), /*#__PURE__*/React.createElement("section", {
    style: {
      borderTop: '1px solid var(--hairline)',
      padding: '80px 64px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: '600 34px/1.15 var(--font-display)',
      margin: '0 0 12px'
    }
  }, "Your archive is waiting."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: '400 15px/1.6 var(--font-ui)',
      color: 'var(--text-2)',
      margin: '0 0 28px'
    }
  }, "Set a budget, upload a PDF, and start confirming pages."), /*#__PURE__*/React.createElement(Button, {
    size: "landing"
  }, "Start transcribing")), /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: '1px solid var(--hairline)',
      padding: '24px 64px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Lockup, null), /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 11,
      color: 'var(--text-3)'
    }
  }, "\xA9 2026 Transcripta \xB7 BSA")));
}
window.TxLanding = TxLanding;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/landing/Landing.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Kbd = __ds_scope.Kbd;

__ds_ns.KbdHints = __ds_scope.KbdHints;

__ds_ns.Table = __ds_scope.Table;

__ds_ns.BudgetMeter = __ds_scope.BudgetMeter;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.QueuedChip = __ds_scope.QueuedChip;

__ds_ns.StateCard = __ds_scope.StateCard;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.PageStrip = __ds_scope.PageStrip;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.ContextMark = __ds_scope.ContextMark;

__ds_ns.Dropzone = __ds_scope.Dropzone;

__ds_ns.SplitPane = __ds_scope.SplitPane;

})();
