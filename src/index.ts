type TestCase = [name: string, fn: () => void | Promise<void>];
// private state
let _freezed = false;

const _tests: Array<TestCase> = [];
const _orig: any = { ...console };
const _logs: Array<[type: string, ...args: any]> = [];
const _stub = (name: string) =>
  Object.keys(_orig).forEach(
    (key) =>
      ((globalThis.console as any)[key] = (...args: any) =>
        _logs.push([key, [`(${name})`, ...args]]))
  );
const _hydrate = (show: boolean) => {
  show && _logs.forEach(([type, args]) => _orig[type](...args));
  _logs.length = 0;
};

const _restore = () => (globalThis.console = _orig);
// public api
export const cancelAll = () => (_tests.length = 0);
export const cancel = () => _tests.pop();
export const test = (...t: TestCase) => {
  if (_freezed) {
    console.warn("[testion] Tests are frozen");
    return;
  }
  _tests.push(t);
};

export const run = async ({
  prefix,
  stub = true,
  stopOnFail = false,
  main = true,
}: {
  prefix?: string;
  stub?: boolean;
  stopOnFail?: boolean;
  main?: boolean;
} = {}): Promise<boolean> => {
  if (!main) return false;
  await new Promise((r) => setTimeout(r, 0));

  _freezed = true;
  let isSuccess = true;
  for (const [name, testFn] of _tests) {
    stub && _stub(prefix ? `${prefix}@${name}` : name);
    try {
      await testFn();
      _orig.log(`=== PASS: ${name}`);
      stub && _hydrate(false);
    } catch (err) {
      _orig.error(`=== FAIL: ${name}`);
      stub && _hydrate(true);
      _orig.error(err);
      isSuccess = false;
      if (stopOnFail) break;
    }
  }
  stub && _restore();
  return isSuccess;
};
