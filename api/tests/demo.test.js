// Demo test để kiểm tra Jest setup
describe('Demo Tests', () => {
  test('should pass basic math test', () => {
    expect(2 + 2).toBe(4);
  });

  test('should handle async operations', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });

  test('should check environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.MONGODB_URI).toContain('test');
  });
});