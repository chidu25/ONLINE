export type ModelOption = {
  id: string;
  label: string;
  censored: boolean;
};

export const modelOptions: ModelOption[] = [
  {
    id: 'nousresearch/nous-hermes-llama2-13b',
    label: 'Nous Hermes Llama2 13B',
    censored: false
  },
  {
    id: 'gryphe/mythomax-l2-13b',
    label: 'MythoMax L2 13B',
    censored: false
  },
  {
    id: 'openrouter/auto',
    label: 'OpenRouter Auto (best available)',
    censored: true
  }
];

export function getModelOption(id?: string) {
  const fallback = modelOptions[0];
  if (!id) return fallback;
  return modelOptions.find((model) => model.id === id) || fallback;
}
