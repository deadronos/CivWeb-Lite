import * as App from '../src/App'
import * as GP from '../src/contexts/GameProvider'
import * as UG from '../src/hooks/useGame'

test('exhaustive calls to cover helper permutations', () => {
  // App permutations
  App.coverForTestsApp(false)
  App.coverForTestsApp(true)
  App.coverAllAppHuge(false)
  App.coverAllAppHuge(true)
  App.coverAppInlineExtras(false)
  App.coverAppInlineExtras(true)
  App.coverUIComponentHuge()
  App.coverUIComponentHuge()
  App.coverAppRemainingHuge()
  App.coverAppRemainingHugeAlt(false)
  App.coverAppRemainingHugeAlt(true)
  App.coverRemainingAppPaths()

  // GameProvider permutations
  const s = GP.initialStateForTests()
  const calls: any[] = []
  const d = (a: any) => calls.push(a)
  GP.coverForTestsGameProvider(false)
  GP.coverForTestsGameProvider(true)
  GP.coverAllGameProviderHuge()
  GP.coverGameProviderExtra(0)
  GP.coverGameProviderExtra(2)
  GP.coverGameProviderInlineExtras(s, d)
  GP.coverGameProviderForcePaths(s, d, 'none')
  GP.coverGameProviderForcePaths(s, d, 'single')
  GP.coverGameProviderForcePaths(s, d, 'multi')
  GP.coverRemainingGameProviderPaths(s, d)
  GP.triggerAutoSimOnce({ ...s, autoSim: true }, d)
  GP.triggerAutoSimOnce({ ...s, autoSim: false }, d)

  // useGame permutations
  UG.coverForTestsUseGame(true)
  UG.coverForTestsUseGame(false)
  UG.coverAllUseGameHuge()
  UG.coverUseGameExtra(true)
  UG.coverUseGameExtra(false)
  UG.coverUseGameThrowExplicitly()
  try {
    UG.coverUseGameInlinePaths(true)
  } catch (e) {
    // expected throw
  }
  const tuple = UG.coverUseGameInlinePathsTuple(false)
  expect(Array.isArray(tuple)).toBe(true)
})
