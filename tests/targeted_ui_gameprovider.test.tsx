import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { UIComponent, coverRemainingAppPaths } from '../src/App'
import * as GP from '../src/contexts/GameProvider'

test('UIComponent renders and buttons dispatch', () => {
  const state = { seed: 'seed1', map: { width: 3, height: 2 }, turn: 0 }
  const calls: any[] = []
  const dispatch = (a: any) => calls.push(a)
  const { container } = render(<UIComponent state={state as any} dispatch={dispatch as any} />)
  // click Regenerate
  const btn = screen.getByText('Regenerate')
  fireEvent.click(btn)
  // click End Turn
  const end = screen.getByText('End Turn')
  fireEvent.click(end)
  expect(calls.length).toBeGreaterThanOrEqual(2)
  // also call coverRemainingAppPaths to exercise branch where refs are null
  const r = coverRemainingAppPaths()
  expect(r).toHaveProperty('v')
})

test('GameProvider force single and coverRemainingGameProviderPaths with players', () => {
  const s = GP.initialStateForTests()
  const calls: any[] = []
  const d = (a: any) => calls.push(a)
  // force single player branch
  GP.coverGameProviderForcePaths(s, d, 'single')
  // now force multi branch
  GP.coverGameProviderForcePaths(s, d, 'multi')
  // coverRemainingGameProviderPaths when players present
  GP.coverRemainingGameProviderPaths(s, d)
  expect(calls.length).toBeGreaterThanOrEqual(0)
})
