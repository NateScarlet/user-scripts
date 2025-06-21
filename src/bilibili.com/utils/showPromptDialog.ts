import PromptDialog from '../components/PromptDialog';

export interface PromptDialogOptions {
  title?: string;
  label?: string;
  value?: string;
  placeholder?: string;
  actionText?: string;
}

export default async function showPromptDialog(
  options: PromptDialogOptions = {}
): Promise<string | null> {
  return await new Promise((resolve) => {
    const dialog = new PromptDialog(options, resolve);
    dialog.open();
  });
}
