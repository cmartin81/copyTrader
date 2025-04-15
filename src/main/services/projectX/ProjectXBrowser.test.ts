import { ProjectXBrowser } from "./ProjectXBrowser";

test("ProjectX", async () => {
  const p = await ProjectXBrowser.create("TopstepX", "","")
  p.start()
  console.log('jj')
})
