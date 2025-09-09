import { vi } from 'vitest';
import { exportToFile, importFromFile, serializeState, SizeExceededError } from '../src/game/save';
import { initialStateForTests } from '../src/contexts/GameProvider';

describe('file save helpers', () => {
  test('exportToFile triggers download', () => {
    const a = { click: vi.fn(), set href(_v: string) {}, set download(_v: string) {} } as any;
    const create = vi.spyOn(document, 'createElement').mockReturnValue(a);
    (globalThis as any).URL.createObjectURL = () => 'blob:';
    (globalThis as any).URL.revokeObjectURL = () => {};
    const object = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:' as any);
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    exportToFile(initialStateForTests());
    expect(create).toHaveBeenCalledWith('a');
    expect(a.click).toHaveBeenCalled();
    create.mockRestore();
    object.mockRestore();
    revoke.mockRestore();
  });

  test('importFromFile loads state', async () => {
    const state = initialStateForTests();
    const content = serializeState(state);
    const file = { size: content.length, text: async () => content } as any as File;
    const loaded = await importFromFile(file);
    expect(loaded).toEqual(state);
  });

  test('importFromFile enforces size limit', async () => {
    const big = { size: 2 * 1024 * 1024 + 1, text: async () => '' } as any as File;
    await expect(importFromFile(big)).rejects.toThrow(SizeExceededError);
  });
});
