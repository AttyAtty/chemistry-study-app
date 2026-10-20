import { test, expect } from '@playwright/test';
import { CHEMICA_VERSION_LABEL } from '../../src/lib/appVersion';
const searches: [string,string][] = [
 ['糖','carbohydrates'],['グルコース','carbohydrates'],['高分子','polymers'],['系統分析','metal-analysis'],
 ['炎色反応','flame-tests'],['沈殿','precipitates'],['蒸気圧','vapor-pressure'],['滴定','titration'],
 ['エンタルピー','thermochemistry'],['ヘス','thermochemistry'],['電池','electrochemistry'],['電気分解','electrochemistry'],
];
for(const width of [1440,390,320]) {
 test(`release: links, metadata, search, console and responsive pages ${width}px`,async({page,context},info)=>{
  test.setTimeout(300000);
  await page.setViewportSize({width,height:width===320?667:900});
  await context.addInitScript(()=>localStorage.setItem('chemica-tutorial',JSON.stringify({tutorialStatus:'completed',tutorialVersion:'0.7.0'})));
  const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error' && /hydration|React|maximum update|uncaught|service.?worker/i.test(m.text())) errors.push(m.text());});
  page.on('response',r=>{if(new URL(r.url()).origin==='http://127.0.0.1:3211' && r.status()>=400 && !r.url().includes('/api/')) errors.push(`HTTP ${r.status()} ${new URL(r.url()).pathname}`);});
  await page.goto('/home');
  await expect(page.locator('.site-version')).toContainText(CHEMICA_VERSION_LABEL);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://chemica.app/home');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content','https://chemica.app/home');
  const schema=await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(JSON.parse(schema!).url).toBe('https://chemica.app');
  expect((await page.request.get('/robots.txt')).status()).toBe(200);
  expect(await (await page.request.get('/robots.txt')).text()).toContain('https://chemica.app/sitemap.xml');
  const sitemap=await (await page.request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('https://chemica.app/illustrated');
  expect(sitemap).not.toContain('vercel.app');
  const manifest=await (await page.request.get('/site.webmanifest')).json();
  expect(manifest.start_url).toBe('/');
  for(const icon of manifest.icons) expect((await page.request.get(icon.src)).status()).toBe(200);
  // All hub cards, not only a selected sample, must resolve.
  await page.goto('/illustrated');
  const hubLinks=await page.locator('.diagram-hub-card').evaluateAll(els=>els.map(el=>(el as HTMLAnchorElement).getAttribute('href')!));
  expect(hubLinks.length).toBeGreaterThanOrEqual(19);
  for(const href of hubLinks) expect((await page.request.get(href)).status(),href).toBe(200);
  const paths=['/home','/illustrated','/units/theory-chemistry','/theory/formulas','/theory/practice','/units/inorganic-reactions','/units/organic-reactions',
    '/illustrated/polymers','/illustrated/carbohydrates','/illustrated/energy-map','/separation/metal-analysis','/separation/aromatic-separation',
    '/tools/memory-quiz','/quiz?unit=all&count=5','/progress','/settings/data','/feedback','/about/changelog'];
  for(const path of paths){
   const response=await page.goto(path);expect(response?.status(),path).toBe(200);
   await expect(page.locator('main')).toBeVisible();
   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),{message:path}).toBe(true);
   if(path.startsWith('/theory/') || path==='/about/changelog') await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://chemica.app'+path);
   if(path==='/theory/formulas') {
    await expect(page.locator('math mfrac').first()).toBeVisible();
    await expect(page.locator('math msup').first()).toBeVisible();
    await expect(page.locator('math msub').first()).toBeVisible();
   }
   if(path==='/illustrated/energy-map') await expect(page.locator('.energy-map-level line')).toHaveCount(24);
   if(['/home','/illustrated/energy-map','/illustrated/carbohydrates','/settings/data'].includes(path)) await page.screenshot({path:info.outputPath(`release-${width}-${path.replaceAll('/','-')}.png`),fullPage:false});
  }
  const searchResults:Record<string,string[]>={};
  for(const [query,expected] of searches){
   await page.goto('/search?q='+encodeURIComponent(query));
   const hrefs=await page.locator('.search-result-card h2 a').evaluateAll(els=>els.slice(0,5).map(el=>el.getAttribute('href')!));
   searchResults[query]=hrefs;
   expect.soft(hrefs.some(href=>href.includes(expected)),`${query}: ${hrefs.join(',')}`).toBe(true);
  }
  await info.attach('search-rankings',{body:JSON.stringify(searchResults,null,2),contentType:'application/json'});
  expect(errors).toEqual([]);
  const notFound=await page.goto('/release-check-nonexistent-page');
  expect(notFound?.status()).toBe(404);
  await expect(page.getByRole('heading',{name:'ページが見つかりません'})).toBeVisible();
 });
}
test('release: feedback success, provider error, offline and memory-quiz/practice print',async({page,context},info)=>{
 test.setTimeout(180000);
 await context.addInitScript(()=>localStorage.setItem('chemica-tutorial',JSON.stringify({tutorialStatus:'completed',tutorialVersion:'0.7.0'})));
 let code=200,requests=0;
 // Never send real feedback or an email during the release check.
 await context.route('**/api/feedback',route=>{requests++;return route.fulfill({status:code,json:code===200?{ok:true}:{ok:false,message:'送信できませんでした。時間をおいて再度お試しください。'}});});
 await page.goto('/feedback');
 await page.getByLabel('内容 必須').fill('公開前のフォーム動作確認です。実メールは送りません。');
 await page.getByLabel('メールアドレス').fill('release@example.test');
 await page.getByRole('button',{name:'送信する',exact:true}).click();
 await expect(page.getByText('送信しました。ありがとうございます。',{exact:true})).toBeVisible();
 code=503;
 await page.getByLabel('内容 必須').fill('送信エラー時も入力内容を保持するテストです。');
 await page.getByRole('button',{name:'送信する',exact:true}).click();
 await expect(page.locator('.feedback-form').getByRole('alert')).toContainText('送信できませんでした');
 await expect(page.getByLabel('内容 必須')).not.toBeEmpty();
 await context.setOffline(true);
 await expect(page.getByRole('button',{name:'送信する',exact:true})).toBeDisabled();
 await expect(page.getByText(/オフラインでは送信できません/)).toBeVisible();
 expect(requests).toBe(2);
 await context.setOffline(false);
 for(const [url,label] of [['/tools/memory-quiz','memory-quiz'],['/theory/practice','theory-practice'],['/separation/metal-analysis','metal-analysis']]) {
  await page.goto(url);
  await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
  await page.emulateMedia({media:'print'});
  if(label==='theory-practice') {
   await expect(page.locator('.practice-question-card details').first()).toHaveAttribute('open','');
   await expect(page.locator('.practice-question-card details p').first()).toBeVisible();
  }
  const printedElement=label==='theory-practice'?'.worked-card':label==='metal-analysis'?'.separation-svg':'.memory-problem-sheet';
  expect(await page.locator(printedElement).first().evaluate(el=>getComputedStyle(el).visibility)).toBe('visible');
  const pdf=await page.pdf({path:info.outputPath(`${label}-release.pdf`),preferCSSPageSize:true});
  expect(pdf.length).toBeGreaterThan(5000);
  await page.emulateMedia({media:'screen'});
  await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
  if(label==='theory-practice') await expect(page.locator('.practice-question-card details').first()).not.toHaveAttribute('open','');
 }
});
