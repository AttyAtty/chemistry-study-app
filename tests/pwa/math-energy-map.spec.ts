import {expect,test} from "@playwright/test";

test("MathML formula fractions and the energy-level diagrams render and print",async({page},info)=>{
 await page.goto("/theory/formulas");
 await expect(page.locator(".formula-block math mfrac").first()).toBeVisible();
 await expect(page.locator(".formula-block math msub").first()).toBeVisible();
 await expect(page.locator(".formula-block math msup").first()).toBeVisible();
 await page.goto("/illustrated/energy-map");
 await expect(page.locator(".energy-map-material h2").first()).toBeVisible();
 await expect(page.locator(".energy-map-material .illustrated-diagram")).toHaveCount(4);
 await expect(page.locator(".energy-map-material .energy-map-level line")).toHaveCount(24);
 await page.screenshot({path:info.outputPath("energy-map-desktop.png"),fullPage:true});
 await page.emulateMedia({media:"print"});
 const pdf=await page.pdf({path:info.outputPath("energy-map-landscape.pdf"),preferCSSPageSize:true});
 const pdfText=pdf.toString("latin1");
 expect(pdfText).toMatch(/MediaBox\s*\[\s*0\s+0\s+841\.\d+\s+594\.\d+\s*\]/); expect(pdf.length).toBeGreaterThan(5000);
 await page.emulateMedia({media:"screen"});
 await page.setViewportSize({width:390,height:844});
 await expect(page.locator(".energy-map-material .illustrated-diagram").first()).toBeVisible();
 const scroll=await page.locator(".illustrated-scroll").first().evaluate(el=>({clientWidth:el.clientWidth,scrollWidth:el.scrollWidth})); expect(scroll.clientWidth).toBeLessThanOrEqual(391); expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
 await page.screenshot({path:info.outputPath("energy-map-mobile.png"),fullPage:true});
});
