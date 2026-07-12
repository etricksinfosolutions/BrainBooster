import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordField } from '../components/PasswordField'
import { CaptchaImage } from '../components/CaptchaImage'
import { RefreshCaptchaButton } from '../components/RefreshCaptchaButton'

describe('PasswordField', () => {
  it('toggles password visibility via the accessible toggle', async () => {
    const user = userEvent.setup()
    render(<PasswordField value="secret" onChange={() => {}} />)
    const input = screen.getByLabelText('Password') as HTMLInputElement
    expect(input.type).toBe('password')
    await user.click(screen.getByRole('button', { name: /show password/i }))
    expect(input.type).toBe('text')
    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(input.type).toBe('password')
  })
})

describe('CaptchaImage', () => {
  it('renders a skeleton while loading and the image when ready', () => {
    const { rerender } = render(<CaptchaImage src={null} loading />)
    expect(screen.getByLabelText(/loading captcha/i)).toBeInTheDocument()
    rerender(<CaptchaImage src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=" loading={false} />)
    expect(screen.getByAltText(/CAPTCHA challenge/i)).toBeInTheDocument()
  })
})

describe('RefreshCaptchaButton', () => {
  it('invokes onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<RefreshCaptchaButton onClick={onClick} />)
    await user.click(screen.getByRole('button', { name: /new captcha/i }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
