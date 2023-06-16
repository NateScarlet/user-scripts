/**
 * run javascript in content scope using `window.eval`
 * https://wiki.greasespot.net/Content_Script_Injection
 * only palin data can be returned.
 */
export default function evalInContentScope(javascript: string): unknown {
  try {
    return JSON.parse(
      window.eval(`JSON.stringify(eval(${JSON.stringify(javascript)}))`)
    );
  } catch (err) {
    return err;
  }
}
