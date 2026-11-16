import type { LifeDimensionKey } from '../../../shared/design-system/tokens.generated';

/**
 * Static Life Dimension copy (Figma page 13). Figma specifies Career; the other six follow the same pattern and are
 * listed for product review in figma-handoff §6.3. Nothing here scores or judges a dimension.
 */
export const DIMENSION_COPY: Readonly<
  Record<LifeDimensionKey, { readonly description: string; readonly prompt: string }>
> = {
  career: {
    description: 'A direction for learning, work and what comes next.',
    prompt: 'What would you like your work and learning to make possible?',
  },
  finance: {
    description: 'A direction for security, freedom and the choices money supports.',
    prompt: 'What would you like your finances to make possible?',
  },
  health: {
    description: 'A direction for energy, rest and feeling at home in your body.',
    prompt: 'What would you like your health to make possible?',
  },
  love: {
    description: 'A direction for closeness, care and the people you share life with.',
    prompt: 'What would you like to nurture in your closest relationships?',
  },
  passion: {
    description: 'A direction for curiosity, craft and what makes time disappear.',
    prompt: 'What would you like to explore or create for its own sake?',
  },
  friendship: {
    description: 'A direction for connection, belonging and showing up for each other.',
    prompt: 'What would you like your friendships to feel like?',
  },
  family: {
    description: 'A direction for roots, home and the people you call family.',
    prompt: 'What would you like to build or keep with your family?',
  },
};
