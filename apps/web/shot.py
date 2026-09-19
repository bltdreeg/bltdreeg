from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg = b.new_page(viewport={"width":1440,"height":900})
    pg.goto("http://localhost:3000/ar", wait_until="networkidle", timeout=60000)
    pg.wait_for_timeout(3500)
    info = pg.evaluate("""() => {
      const c = document.querySelector('canvas');
      if (!c) return {canvas:false};
      const r = c.getBoundingClientRect();
      return {canvas:true, w:r.width, h:r.height, dw:c.width, dh:c.height};
    }""")
    print("CANVAS:", info)
    pg.locator("section").first.screenshot(path="hero.png")
    b.close()
