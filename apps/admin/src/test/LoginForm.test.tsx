import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '../auth/AuthContext'
import { LoginForm } from '../components/LoginForm'
import { authApi, ApiError } from '../auth/api'

// The form is exercised through the real AuthProvider; only the network layer
// (authApi) is mocked so we test component behavior, not fetch.
vi.mock('../auth/api', async () => {
  const actual = await vi.importActual<typeof import('../auth/api')>('../auth/api')
  return {
    ...actual,
    authApi: {
      captcha: vi.fn(),
      login: vi.fn(),
      me: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
      auditLogs: vi.fn(),
    },
  }
})

const mockApi = authApi as unknown as {
  captcha: ReturnType<typeof vi.fn>
  login: ReturnType<typeof vi.fn>
  me: ReturnType<typeof vi.fn>
}

function renderForm() {
  return render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>,
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.me.mockRejectedValue(new ApiError(401, 'UNAUTHENTICATED', 'no session'))
    mockApi.captcha.mockResolvedValue({
      captchaId: 'cap-1',
      image: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
      expiresInMs: 300000,
    })
  })

  it('loads a CAPTCHA challenge on mount', async () => {
    renderForm()
    await waitFor(() => expect(mockApi.captcha).toHaveBeenCalled())
    expect(await screen.findByAltText(/CAPTCHA challenge/i)).toBeInTheDocument()
  })

  it('shows inline validation and does not call login when fields are empty', async () => {
    const user = userEvent.setup()
    renderForm()
    await screen.findByAltText(/CAPTCHA challenge/i)
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText('Username is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(mockApi.login).not.toHaveBeenCalled()
  })

  it('submits credentials + captcha and surfaces server errors without alert()', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    mockApi.login.mockRejectedValueOnce(new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid username or password'))
    const user = userEvent.setup()
    renderForm()
    await screen.findByAltText(/CAPTCHA challenge/i)

    await user.type(screen.getByLabelText('Username'), 'admin')
    await user.type(screen.getByLabelText('Password'), 'wrongpass')
    await user.type(screen.getByLabelText(/security check/i), 'ABCDE')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() =>
      expect(mockApi.login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'wrongpass',
        captchaId: 'cap-1',
        captchaText: 'ABCDE',
      }),
    )
    expect(await screen.findByText('Invalid username or password')).toBeInTheDocument()
    // A failed login must fetch a fresh CAPTCHA (one-time use).
    expect(mockApi.captcha).toHaveBeenCalledTimes(2)
    expect(alertSpy).not.toHaveBeenCalled()
    alertSpy.mockRestore()
  })
})
