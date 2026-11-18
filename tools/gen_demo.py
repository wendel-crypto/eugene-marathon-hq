#!/usr/bin/env python3
"""Builds site/demo.html: the app with invented sample data, no connectors and no personal data.
Usage: python3 tools/gen_demo.py"""
import json, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(root, "app/index.html"), encoding="utf-8").read()
plan = json.dumps(json.load(open(os.path.join(root, "app/plan.json"), encoding="utf-8")), separators=(",", ":"), ensure_ascii=False).replace("</", "<\\/")
mock = open(os.path.join(root, "tools/demo_mock.js"), encoding="utf-8").read()
inject = ('<script>\n' + mock + '\nwindow.__PLAN=' + plan + ';\n'
          '(()=>{const f=window.fetch.bind(window);window.fetch=(u,o)=>String(u).split("?")[0].endsWith("plan.json")?Promise.resolve(new Response(JSON.stringify(window.__PLAN),{headers:{"content-type":"application/json"}})):f(u,o);})();\n'
          '</script>\n')
banner = ('<div style="position:sticky;top:0;z-index:60;background:#11142D;color:#fff;font:600 13px system-ui,sans-serif;padding:8px 14px;text-align:center">'
          'Demo with sample data. Not real training numbers. <a href="/eugene-marathon-hq/" style="color:#c8f135">Back to the case study</a></div>')
i = html.index("<script>")
html = html[:i] + inject + html[i:]
b = html.index("<body"); b = html.index(">", b) + 1
html = html[:b] + banner + html[b:]
html = html.replace("<title>", "<title>Demo · ", 1).replace("</head>", '<meta name="robots" content="noindex"></head>', 1)
open(os.path.join(root, "site/demo.html"), "w", encoding="utf-8").write(html)
print(len(html))
