async function migrateV1() {
  const key = 'blockedUserIDs@7ced1613-89d7-4754-8989-2ad0d7cfa9db';
  const oldValue = await GM.getValue(key);
  if (!oldValue) {
    return;
  }
  const newValue: Record<string, true> = {};
  (JSON.parse(String(oldValue)) as string[]).forEach((i) => {
    newValue[i] = true;
  });
  await GM.setValue(
    'blockedUsers@206ceed9-b514-4902-ad70-aa621fed5cd4',
    JSON.stringify(newValue)
  );
  await GM.deleteValue(key);
}

export default async function migrate() {
  await migrateV1();
}
