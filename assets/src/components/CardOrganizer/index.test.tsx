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
  type Column = 'A' | 'B' | 'C'

  const defaultProps = {
    columns: ['A', 'B', 'C'],
    items: {
      A: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ],
      B: [],
      C: [{ id: 4, name: 'Item 4' }],
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
        (defaultProps.items[column as Column] ?? [])
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

      for (const item of defaultProps.items[column as Column] ?? []) {
        if (isEmptyItemPlaceholder(item)) {
          continue
        }
        const itemElement = getByRole('button', { name: item.name })
        expect(getByTestId(`column-${column}`).contains(itemElement))
      }
    }
  })

  test.each([
    [
      'Up',
      {
        itemName: defaultProps.items['A'][1].name,
        from: 2,
        to: 1,
        columns: { A: [2, 1, 3], B: [], C: [4] },
      },
    ],
    [
      'Left',
      {
        itemName: defaultProps.items['C'][0].name,
        from: 4,
        to: 1,
        columns: { A: [1, 4, 2, 3], B: [], C: [] },
      },
    ],
    [
      'Down',
      {
        itemName: defaultProps.items['A'][1].name,
        from: 2,
        to: 1,
        columns: { A: [2, 1, 3], B: [], C: [4] },
      },
    ],
    [
      'Right',
      {
        itemName: defaultProps.items['C'][0].name,
        from: 4,
        to: 1,
        columns: { A: [1, 4, 2, 3], B: [], C: [] },
      },
    ],
  ])(
    'calls onChange with the updated items when moving %s',
    async (name, { itemName, from, to, columns }) => {
      const onChange = vi.fn().mockResolvedValue(new Promise(() => {}))

      const { getByRole, findByText, asFragment, findByRole } = render(
        <CardOrganizer<(typeof defaultProps.columns)[number], Item>
          {...defaultProps}
          onChange={onChange}
        />
      )

      // Wait for the item to be rendered
      expect(await findByRole('button', { name: itemName })).toBeInTheDocument()

      // Select card
      act(() => {
        fireEvent.keyDown(getByRole('button', { name: itemName }), { code: 'Space' })
      })

      // Move card
      act(() => {
        fireEvent.keyDown(getByRole('button', { name: itemName }), { code: `Arrow${name}` })
      })
      await findByText(`Draggable item ${from} was moved over droppable area ${to}.`)

      // Commit the change
      act(() => {
        fireEvent.keyDown(getByRole('button', { name: itemName }), { code: 'Space' })
      })
      await findByText(`Draggable item ${from} was dropped over droppable area ${to}`)

      expect(asFragment()).toMatchSnapshot()

      expect(onChange).toHaveBeenNthCalledWith(1, {
        from: expect.objectContaining({ id: from }),
        to: expect.objectContaining({ id: to }),
        columns: Object.fromEntries(
          Object.entries(columns).map(([key, value]) => [
            key,
            value.map(id => expect.objectContaining({ id })),
          ])
        ),
      })
    }
  )

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

    // Triggers card selection
    act(() => {
      fireEvent.keyDown(getByRole('button', { name: itemName }), { code: 'Space' })
    })

    // Move card up
    await act(() => {
      fireEvent.keyDown(getByRole('button', { name: itemName }), { code: 'ArrowUp' })
    })
    await findByText('Draggable item 2 was moved over droppable area 1.')

    // Cancel the change
    act(() => {
      fireEvent.keyDown(getByRole('button', { name: itemName }), { code: 'Escape' })
    })

    expect(asFragment()).toMatchSnapshot()

    expect(onChange).toHaveBeenCalledTimes(0)
  })
})
