const RU_TO_EN: Record<string, string> = {
  "й": "q", "ц": "w", "у": "e", "к": "r", "е": "t", "н": "y", "г": "u",
  "ш": "i", "щ": "o", "з": "p", "х": "[", "ъ": "]",
  "ф": "a", "ы": "s", "в": "d", "а": "f", "п": "g", "р": "h", "о": "j",
  "л": "k", "д": "l", "ж": ";", "э": "'",
  "я": "z", "ч": "x", "с": "c", "м": "v", "и": "b", "т": "n", "ь": "m",
  "б": ",", "ю": ".", "ё": "`",
};

export function ru_layout_to_en(text: string): string {
  let result = "";
  for (const ch of text) {
    const lower = ch.toLowerCase();
    const mapped = RU_TO_EN[lower];
    if (mapped === undefined) {
      result += ch;
    } else {
      result += ch === lower ? mapped : mapped.toUpperCase();
    }
  }
  return result;
}
