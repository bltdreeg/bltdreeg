# Copy audit (roadmap Step 1.9): every Arabic string under mobile.* must be the board's text (mobile.html) or,
# for states the board doesn't draw, Flutter's ARB text. Prints the strings that are neither, with the closest
# board/Flutter text, so each one is fixed or logged in GAPS.
# usage: python copy_audit.py [namespace ...]   (default: all of mobile.*)
import difflib, html, json, re, sys

BOARD = r"E:\bltdreeg\apps\web\Beltadreeg customer app design\mobile.html"
ARB = r"E:\bltdreeg\apps\bltdreeg_cutsomer_mobile\lib\core\localization\arb\app_ar.arb"
AR = r"E:\bltdreeg\apps\customer-mobile\src\i18n\messages\ar.json"

raw = open(BOARD, encoding="utf-8").read()
raw = re.sub(r"<(script|style)\b.*?</\1>", " ", raw, flags=re.S)
texts = [re.sub(r"\s+", " ", html.unescape(t).strip()) for t in re.split(r"<[^>]+>", raw)]
texts = [t for t in texts if re.search(r"[\u0600-\u06FF]", t)]
board = " ¶ ".join(texts)
flutter_texts = [v for k, v in json.load(open(ARB, encoding="utf-8")).items() if isinstance(v, str) and not k.startswith("@")]
flutter = " ¶ ".join(flutter_texts)


def parts(val):
    """literal Arabic chunks of an ICU message: placeholders, plural/select syntax and <tags> split it"""
    val = re.sub(r"\{\w+, (?:plural|select),", " ", val)
    chunks = re.split(r"\{[^{}]*\}|[{}]|=\d+|\bother\b|<[^>]+>|\n", val)
    return [c for c in (re.sub(r"\s+", " ", c).strip(" ،.:؟") for c in chunks) if re.search(r"[\u0600-\u06FF]{2}", c)]


def walk(node, path):
    if isinstance(node, dict):
        for k, v in node.items():
            yield from walk(v, path + [k])
    elif isinstance(node, str):
        yield ".".join(path), node


msgs = json.load(open(AR, encoding="utf-8"))["mobile"]
namespaces = sys.argv[1:] or list(msgs)
counts = {"board": 0, "flutter": 0}
misses = []
for ns in namespaces:
    for key, val in walk(msgs[ns], [ns]):
        ps = parts(val)
        if not ps:
            continue
        if all(p in board for p in ps):
            counts["board"] += 1
        elif all(p in board or p in flutter for p in ps):
            counts["flutter"] += 1
        else:
            bad = next(p for p in ps if p not in board and p not in flutter)
            close = difflib.get_close_matches(bad, texts + flutter_texts, n=1, cutoff=0.4)
            misses.append(f"{key}: {bad!r}\n    closest: {close[0] if close else '—'!r}")

print("\n".join(misses))
print(f"\nboard: {counts['board']} · board + Flutter: {counts['flutter']} · neither: {len(misses)}")
