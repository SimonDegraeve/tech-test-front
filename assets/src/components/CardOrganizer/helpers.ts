import { UniqueIdentifier } from '@dnd-kit/core'

// Type matching non exported `AnyData` from `@dnd-kit/core`, `any` is necessary to match the type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ItemData = { id: UniqueIdentifier; [key: string]: any }

export const emptyItemPlaceholderIdPrefix = '__empty__'

export type EmptyItemPlaceholder<Column extends string> = {
  id: `${typeof emptyItemPlaceholderIdPrefix}-${Column}`
}

export function isEmptyItemPlaceholder<Column extends string>(
  item: ItemData | EmptyItemPlaceholder<Column>
): item is EmptyItemPlaceholder<Column> {
  return item.id.toString().startsWith(emptyItemPlaceholderIdPrefix)
}
