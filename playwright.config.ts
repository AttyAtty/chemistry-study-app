import { defineConfig } from "@playwright/test";
export default defineConfig({
 testDir:"./tests/pwa",timeout:120000,expect:{timeout:20000},workers:1,
 reporter:[["list"],["html",{open:"never"}]],use:{baseURL:"http://127.0.0.1:3211",trace:"retain-on-failure"},
 projects:[{name:"chrome",metadata:{channel:"chrome"}},{name:"edge",metadata:{channel:"msedge"}}],
 webServer:{command:"npm run start -- --hostname 127.0.0.1 --port 3211",url:"http://127.0.0.1:3211/home",reuseExistingServer:false,timeout:120000},
});
