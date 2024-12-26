import { forwardRef, memo, ReactNode, useEffect, useRef, useState } from 'react'
import { Text } from '@welcome-ui/text'
import { Flex } from '@welcome-ui/flex'
import { Badge } from '@welcome-ui/badge'
import { Box, BoxProps } from '@welcome-ui/box'
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
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  applyColumnChanges,
  ColumnUpdate,
  EmptyItemPlaceholder,
  emptyItemPlaceholderIdPrefix,
  isEmptyItemPlaceholder,
  ItemData,
  ItemRegistry,
  ItemWithSortableData,
  toCardOrganizerItem,
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
      const newColumns = applyColumnChanges(parentItems, activeItem, overItem)

      // Notify the parent component of the change
      onChange({
        from: activeItem,
        to: overItem,
        columns: newColumns,
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

      setInternalItems(newColumns)
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
      const oldIndex = activeItem.sortable.index
      const newIndex = overItem.sortable.index
      const fromColumn = activeItem.sortable.containerId
      const toColumn = overItem.sortable.containerId

      // If the item is dragged to a different column, update the internal items
      // to remove the item from the original column and add it to the new column
      if (fromColumn !== toColumn) {
        setInternalItems(items => {
          const fromItems = items?.[fromColumn] ?? []
          const toItems = items?.[toColumn] ?? []
          const item = fromItems[oldIndex]
          const newFromItems = [...fromItems.slice(0, oldIndex), ...fromItems.slice(oldIndex + 1)]
          const newToItems = [
            ...toItems.slice(0, newIndex),
            { ...item, originalContainerId: item.originalContainerId ?? fromColumn },
            ...toItems.slice(newIndex),
          ]
          return { ...items, [fromColumn]: newFromItems, [toColumn]: newToItems }
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
      <Flex p={'20 0'} overflow="hidden" flexGrow={1} gap={10}>
        <DragOverlay>
          {internalActiveItem ? (
            <Item style={{ transform: 'rotate(3deg)' }}>{renderCard(internalActiveItem)}</Item>
          ) : null}
        </DragOverlay>

        {columns.map(column => {
          let items: (Item | EmptyItemPlaceholder<Column>)[] =
            internalItems?.[column] ?? parentItems[column] ?? []

          // Add an empty item placeholder if the column is empty,
          // this is necessary to allow dragging items to an empty column because we need somethinng to collide with
          if (!items.length) {
            items = [{ id: `${emptyItemPlaceholderIdPrefix}-${column}` }]
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
    </DndContext>
  )
}

export default CardOrganizer

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
        <Flex
          as="ul"
          direction="column"
          p={10}
          minHeight={100}
          gap={10}
          overflow="auto"
          w="100%"
          listStyleType="none"
        >
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
    // The comparison could be improved depending on benchmarks (ex: deep comparison)
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

export type ItemProps = BoxProps

export const Item = forwardRef(
  ({ children, ...props }: ItemProps, ref: React.LegacyRef<HTMLDivElement> | undefined) => {
    return (
      <Box {...props} ref={ref}>
        {children}
      </Box>
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
    <Item as="li" ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </Item>
  )
}
