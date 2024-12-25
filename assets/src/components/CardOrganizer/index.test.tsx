import { describe, expect, test, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { UniqueIdentifier } from '@dnd-kit/core'

import { render } from '../../test-utils'
import CardOrganizer from '../../components/CardOrganizer'

describe('card organizer', () => {
  type Item = { id: UniqueIdentifier; name: string }

  const defaultProps = {
    columns: ['A', 'B', 'C'],
    items: {
      A: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
    },
    onChange: vi.fn().mockResolvedValue(new Promise(() => {})),
    renderCard: (item: Item) => item.name,
  }

  test('renders every columns', () => {
    const { getByText } = render(
      <CardOrganizer<(typeof defaultProps.columns)[number], Item> {...defaultProps} />
    )

    for (const column of defaultProps.columns) {
      expect(getByText(column)).toBeInTheDocument()
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

  test('renders every card', () => {
    const { getByRole } = render(
      <CardOrganizer<(typeof defaultProps.columns)[number], Item> {...defaultProps} />
    )

    for (const item of Object.values(defaultProps.items).flat()) {
      expect(getByRole('button', { name: item.name })).toBeInTheDocument()
    }
  })

  test('calls onChange with the updated items', async () => {
    const onChange = vi.fn().mockResolvedValue(new Promise(() => {}))

    const { getByRole, findByText, asFragment } = render(
      <CardOrganizer<(typeof defaultProps.columns)[number], Item>
        {...defaultProps}
        onChange={onChange}
      />
    )

    const card = getByRole('button', { name: defaultProps.items['A'][1].name })

    fireEvent.keyDown(card, {
      code: 'Space',
    })

    fireEvent.keyDown(card, {
      code: 'ArrowUp',
    })
    await findByText('Draggable item 2 was moved over droppable area 1.')

    fireEvent.keyDown(card, {
      code: 'Space',
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

  test('does not call onChange when there are no changes', async () => {
    const onChange = vi.fn().mockResolvedValue(new Promise(() => {}))

    const { getByRole, asFragment } = render(
      <CardOrganizer<(typeof defaultProps.columns)[number], Item>
        {...defaultProps}
        onChange={onChange}
      />
    )

    const card = getByRole('button', { name: defaultProps.items['A'][1].name })

    fireEvent.keyDown(card, {
      code: 'Space',
    })

    fireEvent.keyDown(card, {
      code: 'Space',
    })

    expect(asFragment()).toMatchSnapshot()

    expect(onChange).toHaveBeenCalledTimes(0)
  })
})
