import { UniqueIdentifier } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

// Type matching non exported `AnyData` from `@dnd-kit/core`, `any` is necessary to match the type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ItemData = { id: UniqueIdentifier; [key: string]: any }

export type ItemRegistry<Column extends string, Item extends ItemData> = Partial<
  Record<Column, Item[]>
>

export type ColumnUpdate<Column extends string, Item extends ItemData> = {
  from: ItemWithSortableData<Column, Item> & { originalContainerId?: Column }
  to: ItemWithSortableData<Column, Item> & { originalContainerId?: Column }
  columns: ItemRegistry<Column, Item>
}

export type ItemWithSortableData<Column extends string, Item extends ItemData> = Item & {
  sortable: { containerId: Column; index: number; items: UniqueIdentifier[] }
}

export function toCardOrganizerItem<Column extends string, Item extends ItemData>(
  item: { [key: string]: unknown } | undefined
) {
  // Transforms `AnyData` from dnd-kit/core into our own more specific type
  return item as ItemWithSortableData<Column, Item> | undefined
}

export const emptyItemPlaceholderIdPrefix = '__empty__'

export type EmptyItemPlaceholder<Column extends string> = {
  id: `${typeof emptyItemPlaceholderIdPrefix}-${Column}`
}

export function isEmptyItemPlaceholder<Column extends string>(
  item: ItemData | EmptyItemPlaceholder<Column>
): item is EmptyItemPlaceholder<Column> {
  return item.id.toString().startsWith(emptyItemPlaceholderIdPrefix)
}

export function applyColumnChanges<Column extends string, Item extends ItemData>(
  items: ItemRegistry<Column, Item>,
  from: ItemWithSortableData<Column, Item>,
  to: ItemWithSortableData<Column, Item>
) {
  const fromColumn: Column = from.originalContainerId ?? from.sortable.containerId
  const toColumn = to.sortable.containerId
  const fromItems = items[fromColumn] ?? []
  const toItems = items[toColumn] ?? []
  const oldIndex = from.sortable.index
  const newIndex = to.sortable.index

  if (fromColumn === toColumn && oldIndex === newIndex) {
    return items
  }

  // Move the item to a different column
  if (fromColumn !== toColumn) {
    const oldIndex = fromItems.findIndex(item => item.id === from.id)
    const item = fromItems[oldIndex]
    const newFromItems = [...fromItems.slice(0, oldIndex), ...fromItems.slice(oldIndex + 1)]
    const newToItems = [...toItems.slice(0, newIndex), item, ...toItems.slice(newIndex)]
    return {
      ...items,
      [fromColumn]: newFromItems,
      [toColumn]: newToItems,
    }
  }
  // Move the item within the same column
  else {
    return {
      ...items,
      [fromColumn]: arrayMove(fromItems, oldIndex, newIndex),
    }
  }
}
