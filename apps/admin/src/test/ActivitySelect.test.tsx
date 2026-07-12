import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActivitySelect, type ActivityOption } from '../components/ActivitySelect'

const OPTIONS: ActivityOption[] = [
  { id: 'match3-classic', name: 'Match-3 Mania', icon: '💎', category: 'Match-3', mechanic: 'match3' },
  { id: 'color-crush', name: 'Color Crush', icon: '🌈', category: 'Match-3', mechanic: 'match3' },
  { id: 'reflex-tap', name: 'Tap Fast', icon: '👆', category: 'Reflex', mechanic: 'reflex' },
  { id: 'math-add', name: 'Mental Addition', icon: '➕', category: 'Mental Math', mechanic: 'arithmetic' },
]

describe('ActivitySelect (select2-style, grouped)', () => {
  it('groups options by category and lets you pick one', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ActivitySelect options={OPTIONS} value="" onChange={onChange} />)

    await user.click(screen.getByRole('button'))
    const listbox = screen.getByRole('listbox')
    // Category group headers present.
    expect(within(listbox).getByText('Match-3')).toBeInTheDocument()
    expect(within(listbox).getByText('Reflex')).toBeInTheDocument()
    expect(within(listbox).getByText('Mental Math')).toBeInTheDocument()

    await user.click(within(listbox).getByText('Mental Addition'))
    expect(onChange).toHaveBeenCalledWith('math-add')
  })

  it('filters as you type (search)', async () => {
    const user = userEvent.setup()
    render(<ActivitySelect options={OPTIONS} value="" onChange={() => {}} />)
    await user.click(screen.getByRole('button'))
    await user.type(screen.getByLabelText('Search activities'), 'reflex')
    const listbox = screen.getByRole('listbox')
    expect(within(listbox).getByText('Tap Fast')).toBeInTheDocument()
    expect(within(listbox).queryByText('Match-3 Mania')).not.toBeInTheDocument()
  })

  it('supports keyboard: arrow down + Enter selects', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ActivitySelect options={OPTIONS} value="" onChange={onChange} />)
    const control = screen.getByRole('button')
    control.focus()
    await user.keyboard('{ArrowDown}') // opens
    await user.keyboard('{ArrowDown}') // move off "Auto" onto first real option
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('match3-classic')
  })

  it('shows the current selection with its category', () => {
    render(<ActivitySelect options={OPTIONS} value="color-crush" onChange={() => {}} />)
    const control = screen.getByRole('button')
    expect(within(control).getByText('Color Crush')).toBeInTheDocument()
    expect(within(control).getByText('Match-3')).toBeInTheDocument()
  })
})
