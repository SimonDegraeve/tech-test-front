import { forwardRef, memo, ReactNode, useEffect, useRef, useState } from 'react'
import { Text } from '@welcome-ui/text'
import { Flex } from '@welcome-ui/flex'
import { Badge } from '@welcome-ui/badge'
import { CSS } from '@dnd-kit/utilities'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  EmptyItemPlaceholder,
  emptyItemPlaceholderIdPrefix,
  isEmptyItemPlaceholder,
} from './helpers'

export type CardOrganizerProps<Column extends string, Item extends ItemData> = {
  columns: Column[]
  items: ItemRegistry<Column, Item>
  renderCard: (item: Item) => ReactNode
  renderColumnLabel?: (column: Column, count: number) => ReactNode
  onChange: (columnUpdate: ColumnUpdate<Column, Item>) => Promise<void>
}

function CardOrganizer<Column extends string, Item extends ItemData>({
  columns,
  items: parentItems,
  renderCard,
  renderColumnLabel,
  onChange,
}: CardOrganizerProps<Column, Item>) {
  const [internalActiveItem, setInternalActiveItem] = useState<
    ItemWithSortableData<Column, Item> | undefined
  >()

  /**
   * `internalItems` is used to manage updates when dragging between columns
   * it is instantiated with the `parentItems` when the drag starts
   * and it is reset when the drag ends if the component is still mounted
   */
  const [internalItems, setInternalItems] = useState<ItemRegistry<Column, Item> | undefined>()

  const isMounted = useRef(false)
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    // Keyboard navigation for improved accessibility
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const activeItem = toCardOrganizerItem<Column, Item>(active.data.current)
    setInternalActiveItem(activeItem)
    setInternalItems(parentItems)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const activeItem = toCardOrganizerItem<Column, Item>(active.data.current)
    const overItem = toCardOrganizerItem<Column, Item>(over?.data.current)

    if (activeItem && overItem) {
      // Notify the parent component of the change
      onChange({
        from: {
          ...activeItem,
          // Remove empty item placeholder from the items list
          sortable: {
            ...activeItem.sortable,
            items: activeItem.sortable.items.filter(id => !isEmptyItemPlaceholder({ id })),
          },
        },
        to: {
          ...overItem,
          // Remove empty item placeholder from the items list
          sortable: {
            ...overItem.sortable,
            items: overItem.sortable.items.filter(id => !isEmptyItemPlaceholder({ id })),
          },
        },
      }).finally(() => {
        // Note: Could use `requestAnimationFrame` instead of `setTimeout` to wait for the next frame
        setTimeout(() => {
          if (
            isMounted.current &&
            (!internalActiveItem || internalActiveItem.id === activeItem.id)
          ) {
            setInternalItems(undefined)
          }
        }, 16 /* 1 frame */)
      })

      // Move the item in internal items to reflect the change
      if (activeItem.sortable.containerId === overItem.sortable.containerId) {
        setInternalItems(items => {
          const oldIndex = activeItem.sortable.index
          const newIndex = overItem.sortable.index
          const column = activeItem.sortable.containerId
          return {
            ...items,
            [column]: arrayMove(items?.[column] ?? [], oldIndex, newIndex),
          }
        })
      }
    } else {
      setInternalItems(undefined)
    }

    setInternalActiveItem(undefined)
  }

  function onDragOver(event: DragEndEvent) {
    const { active, over } = event
    const activeItem = toCardOrganizerItem<Column, Item>(active.data.current)
    const overItem = toCardOrganizerItem<Column, Item>(over?.data.current)

    if (activeItem && overItem) {
      // If the item is dragged to a different column, update the internal items
      if (activeItem.sortable.containerId !== overItem.sortable.containerId) {
        setInternalItems(items => {
          const oldIndex = activeItem.sortable.index
          const newIndex = overItem.sortable.index
          const fromColumn = activeItem.sortable.containerId
          const toColumn = overItem.sortable.containerId
          const fromItems = items?.[fromColumn] ?? []
          const toItems = items?.[toColumn] ?? []
          const item = fromItems[oldIndex]

          // Remove the item from the original column..
          const newFromItems = [...fromItems.slice(0, oldIndex), ...fromItems.slice(oldIndex + 1)]
          // ...and insert it into the new column
          const newToItems = [...toItems.slice(0, newIndex), item, ...toItems.slice(newIndex)]

          return {
            ...items,
            [fromColumn]: newFromItems,
            [toColumn]: newToItems,
          }
        })
      }
    }
  }

  function onDragCancel() {
    setInternalActiveItem(undefined)
    setInternalItems(undefined)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={onDragOver}
      onDragCancel={onDragCancel}
    >
      <Flex p={'20 0'} overflow="hidden" flexGrow={1}>
        <Flex gap={10} overflow="hidden">
          <DragOverlay>
            {internalActiveItem ? (
              <Item style={{ transform: 'rotate(3deg)' }}>{renderCard(internalActiveItem)}</Item>
            ) : null}
          </DragOverlay>

          {columns.map(column => {
            const items: (Item | EmptyItemPlaceholder<Column>)[] =
              internalItems?.[column] ?? parentItems[column] ?? []

            // Add an empty item placeholder if the column is empty,
            // this is necessary to allow dragging items to an empty column because we need somethinng to collide with
            if (!items.length) {
              items.push({ id: `${emptyItemPlaceholderIdPrefix}-${column}` })
            }

            return (
              <SortableContext
                id={column}
                key={column}
                items={items}
                strategy={verticalListSortingStrategy}
              >
                <MemoizedCardColumn
                  key={column}
                  column={column}
                  items={items}
                  activeItem={internalActiveItem}
                  renderCard={renderCard}
                  renderColumnLabel={renderColumnLabel}
                />
              </SortableContext>
            )
          })}
        </Flex>
      </Flex>
    </DndContext>
  )
}

export default CardOrganizer

/**
 * CardOrganizer types and helpers
 */

// Type matching non exported `AnyData` from `@dnd-kit/core`, `any` is necessary to match the type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ItemData = { id: UniqueIdentifier; [key: string]: any }

type ItemRegistry<Column extends string, Item extends ItemData> = Partial<Record<Column, Item[]>>

export type ColumnUpdate<Column extends string, Item extends ItemData> = {
  from: ItemWithSortableData<Column, Item>
  to: ItemWithSortableData<Column, Item>
}

type ItemWithSortableData<Column extends string, Item extends ItemData> = Item & {
  sortable: { containerId: Column; index: number; items: UniqueIdentifier[] }
}

function toCardOrganizerItem<Column extends string, Item extends ItemData>(
  item: { [key: string]: unknown } | undefined
) {
  // Transforms `AnyData` from dnd-kit/core into our own more specific type
  return item as ItemWithSortableData<Column, Item> | undefined
}

/**
 * CardColumn & MemoizedCardColumn components
 */

function CardColumn<Column extends string, Item extends ItemData>({
  column,
  items,
  activeItem,
  renderCard,
  renderColumnLabel,
}: {
  column: Column
  items: (Item | EmptyItemPlaceholder<Column>)[]
  activeItem: ItemWithSortableData<Column, Item> | undefined
  renderCard: (item: Item) => ReactNode
  renderColumnLabel?: (column: Column, count: number) => ReactNode
  maxColumnSize?: number
}) {
  const itemsCount = items.filter(item => !isEmptyItemPlaceholder(item)).length

  return (
    <Flex
      w={300}
      border={1}
      backgroundColor="white"
      borderColor="neutral-30"
      borderRadius="md"
      overflow="hidden"
      flexDirection="column"
      data-testid={`column-${column}`}
    >
      <Flex
        p={10}
        borderBottom={1}
        borderColor="neutral-30"
        alignItems="center"
        justify="space-between"
      >
        {renderColumnLabel?.(column, itemsCount) ?? (
          <Text color="black" m={0} textTransform="capitalize" fontWeight="600">
            {column}
          </Text>
        )}

        <Badge data-testid={`column-counter-${column}`}>{itemsCount}</Badge>
      </Flex>

      <Flex overflow="hidden" h="100%">
        <Flex direction="column" p={10} minHeight={100} gap={10} overflow="auto" w="100%">
          {items.map(item => (
            <SortableItem
              key={item.id}
              data={item}
              style={item.id === activeItem?.id ? { opacity: 0.5 } : {}}
            >
              {isEmptyItemPlaceholder(item) ? null : renderCard(item)}
            </SortableItem>
          ))}
        </Flex>
      </Flex>
    </Flex>
  )
}

const MemoizedCardColumn = memo(
  CardColumn,
  (
    { column: prevColumn, items: prevItems, activeItem: prevActiveItem },
    { column: nextColumn, items: nextItems, activeItem: nextActiveItem }
  ) => {
    const hasSameColumn = prevColumn === nextColumn

    // Warning: The column will not update if the data of the items changes
    const hasSameItems =
      prevItems.map(({ id }) => id).join('') === nextItems.map(({ id }) => id).join('')

    const hasSameActiveColumn =
      !!prevItems.find(({ id }) => id === prevActiveItem?.id) ===
      !!nextItems.find(({ id }) => id === nextActiveItem?.id)

    return hasSameColumn && hasSameItems && hasSameActiveColumn
  }
) as typeof CardColumn

/**
 * Item & SortableItem components
 */

export type ItemProps = React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>

export const Item = forwardRef(
  ({ children, ...props }: ItemProps, ref: React.LegacyRef<HTMLDivElement> | undefined) => {
    return (
      <div {...props} ref={ref}>
        {children}
      </div>
    )
  }
)

export type SortableItemProps<DragItemData extends ItemData> = ItemProps & {
  data: DragItemData
}

export function SortableItem<DragItemData extends ItemData>({
  data,
  style: extraStyle,
  children,
}: SortableItemProps<DragItemData>) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: data.id,
    data,
  })

  const style = {
    transform: `${CSS.Transform.toString(transform) ?? ''} ${extraStyle?.transform ?? ''}`,
    transition,
    ...extraStyle,
  }

  return (
    <Item ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </Item>
  )
}
