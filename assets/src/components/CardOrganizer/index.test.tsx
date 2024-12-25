import { describe, expect, test, vi } from 'vitest'
import { act, fireEvent } from '@testing-library/react'
import { UniqueIdentifier } from '@dnd-kit/core'

import { render } from '../../test-utils'
import CardOrganizer from '../../components/CardOrganizer'
import { isEmptyItemPlaceholder } from './helpers'

/**
 * Note: the tests rely on the keyboard navigation as the the DOM is emulated by the testing library (jsdom) we cannot trigger real drag and drop events.
 * In order to test real drag and drop events, we should use a real browser in e2e tests (with utils like Playwright or Cypress).
 * See: https://github.com/clauderic/dnd-kit/issues/261#issuecomment-844597229
 */
describe('CardOrganizer', () => {
  type Item = { id: UniqueIdentifier; name: string }

  const defaultProps = {
    columns: ['A', 'B', 'C'],
    items: {
      A: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ],
      B: [],
      C: [],
    },
    onChange: vi.fn().mockResolvedValue(new Promise(() => {})),
    renderCard: (item: Item) => item.name,
  }

  test('renders every columns with their counters', () => {
    const { getByText, getByTestId } = render(
      <CardOrganizer<(typeof defaultProps.columns)[number], Item> {...defaultProps} />
    )

    for (const column of defaultProps.columns) {
      expect(getByText(column)).toBeInTheDocument()

      expect(getByTestId(`column-counter-${column}`)).toHaveTextContent(
        (defaultProps.items[column as 'A'] ?? [])
          .filter(item => !isEmptyItemPlaceholder(item))
          .length.toString()
      )
    }
  })

  test('renders custom column label', () => {
    const { getByText } = render(
      <CardOrganizer<(typeof defaultProps.columns)[number], Item>
        {...defaultProps}
        renderColumnLabel={column => <span>{column} label</span>}
      />
    )

    for (const column of defaultProps.columns) {
      expect(getByText(column + ' label')).toBeInTheDocument()
    }
  })

  test('renders every card in the correct column', () => {
    const { getByRole, getByTestId } = render(
      <CardOrganizer<(typeof defaultProps.columns)[number], Item> {...defaultProps} />
    )

    for (const column of defaultProps.columns) {
      expect(getByTestId(`column-${column}`)).toBeInTheDocument()

      for (const item of defaultProps.items[column as 'A'] ?? []) {
        if (isEmptyItemPlaceholder(item)) {
          continue
        }
        const itemElement = getByRole('button', { name: item.name })
        expect(getByTestId(`column-${column}`).contains(itemElement))
      }
    }
  })

  test('calls onChange with the updated items when moving Up', async () => {
    const itemName = defaultProps.items['A'][1].name

    const onChange = vi.fn().mockResolvedValue(new Promise(() => {}))

    const { getByRole, findByText, asFragment, findByRole } = render(
      <CardOrganizer<(typeof defaultProps.columns)[number], Item>
        {...defaultProps}
        onChange={onChange}
      />
    )

    // Wait for the item to be rendered
    expect(await findByRole('button', { name: itemName })).toBeInTheDocument()

    const card = getByRole('button', { name: itemName })

    // Select card
    act(() => {
      fireEvent.keyDown(card, { code: 'Space' })
    })

    // Move card up
    act(() => {
      fireEvent.keyDown(card, { code: 'ArrowUp' })
    })
    await findByText('Draggable item 2 was moved over droppable area 1.')

    // Commit the change
    act(() => {
      fireEvent.keyDown(card, { code: 'Space' })
    })
    await findByText('Draggable item 2 was dropped over droppable area 1')

    expect(asFragment()).toMatchSnapshot()

    expect(onChange).toHaveBeenNthCalledWith(1, {
      from: expect.objectContaining({
        id: 2,
        sortable: expect.objectContaining({ containerId: 'A' }),
      }),
      to: expect.objectContaining({
        id: 1,
        sortable: expect.objectContaining({ containerId: 'A' }),
      }),
    })
  })

  test('calls onChange with the updated items when moving Down', async () => {
    const itemName = defaultProps.items['A'][0].name

    const onChange = vi.fn().mockResolvedValue(new Promise(() => {}))

    const { getByRole, findByText, asFragment, findByRole } = render(
      <CardOrganizer<(typeof defaultProps.columns)[number], Item>
        {...defaultProps}
        onChange={onChange}
      />
    )

    // Wait for the item to be rendered
    expect(await findByRole('button', { name: itemName })).toBeInTheDocument()

    const card = getByRole('button', { name: itemName })

    // Select card
    act(() => {
      fireEvent.keyDown(card, { code: 'Space' })
    })

    // Move card down
    act(() => {
      fireEvent.keyDown(card, { code: 'ArrowDown' })
    })
    await findByText('Draggable item 1 was moved over droppable area 1.')

    // Commit the change
    act(() => {
      fireEvent.keyDown(card, { code: 'Space' })
    })
    await findByText('Draggable item 1 was dropped over droppable area 1')

    expect(asFragment()).toMatchSnapshot()

    expect(onChange).toHaveBeenNthCalledWith(1, {
      from: expect.objectContaining({
        id: 1,
        sortable: expect.objectContaining({ containerId: 'A' }),
      }),
      to: expect.objectContaining({
        id: 1,
        sortable: expect.objectContaining({ containerId: 'A' }),
      }),
    })
  })

  test('does not call onChange when there are no changes or mouvement is canceled', async () => {
    const itemName = defaultProps.items['A'][1].name

    const onChange = vi.fn().mockResolvedValue(new Promise(() => {}))

    const { getByRole, asFragment, findByText, findByRole } = render(
      <CardOrganizer<(typeof defaultProps.columns)[number], Item>
        {...defaultProps}
        onChange={onChange}
      />
    )

    // Wait for the item to be rendered
    expect(await findByRole('button', { name: itemName })).toBeInTheDocument()

    const card = getByRole('button', { name: itemName })

    // Triggers card selection
    act(() => {
      fireEvent.keyDown(card, { code: 'Space' })
    })

    // Move card up
    await act(() => {
      fireEvent.keyDown(card, { code: 'ArrowUp' })
    })
    await findByText('Draggable item 2 was moved over droppable area 1.')

    // Cancel the change
    act(() => {
      fireEvent.keyDown(card, { code: 'Escape' })
    })

    expect(asFragment()).toMatchSnapshot()

    expect(onChange).toHaveBeenCalledTimes(0)
  })
})
