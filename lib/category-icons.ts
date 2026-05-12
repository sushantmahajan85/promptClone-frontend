/** Returns an emoji icon for a category based on keywords in its label or slug. */
export function iconForCategory(label: string, slug: string): string {
  const t = `${label} ${slug}`.toLowerCase();
  if (/content|writing|copy|blog|article/.test(t))        return "✍️";
  if (/seo|search|growth|rank|traffic/.test(t))            return "📈";
  if (/data|analys|analytics|insight|stat/.test(t))        return "📊";
  if (/cod|dev|engineer|program|software/.test(t))         return "💻";
  if (/image|video|media|visual|design|creative/.test(t))  return "🎨";
  if (/research|science|lab|study/.test(t))                return "🔬";
  if (/product|workflow|automat|effic|tool/.test(t))       return "⚡";
  if (/social|instagram|twitter|linkedin|tiktok/.test(t))  return "📱";
  if (/support|customer|service|chat|help/.test(t))        return "🎧";
  if (/financ|account|money|tax|invest|budget/.test(t))    return "💰";
  if (/legal|law|contract|compli/.test(t))                 return "⚖️";
  if (/edu|learn|teach|train|course|tutor/.test(t))        return "🎓";
  if (/web3|blockchain|crypto|nft|defi/.test(t))           return "⛓️";
  if (/business|strateg|market|sales/.test(t))             return "💼";
  return "🤖";
}
